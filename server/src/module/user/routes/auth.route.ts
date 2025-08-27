import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { setCookie, getCookie, deleteCookie } from "hono/cookie";
import { loginSchema, userCreateSchema } from "../models/user.model";
import responder from "@shared/responder";
import {
  createUserService,
  loginUserService,
  refreshTokenService,
  logoutService,
} from "../services/auth.service";
import { rateLimit } from "@middleware/auth.middleware";
import { UnauthorizedError } from "@shared/error";

const app = new Hono();

// Using Hono cookie helpers (setCookie/getCookie/deleteCookie)

// Sign up
app.post("/signup", zValidator("json", userCreateSchema), async (c) => {
  const body = c.req.valid("json");
  const user = await createUserService(body);
  const response = responder(
    { data: user },
    { message: "User created successfully" }
  );
  return c.json(response, 201);
});

app.post("/login", rateLimit, zValidator("json", loginSchema), async (c) => {
  const body: any = c.req.valid("json");
  console.log(body);
  const result = await loginUserService(body.email, body.password);

  // set refresh token as httpOnly cookie
  const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  } as any;
  setCookie(c, "refreshToken", result.tokens.refreshToken, cookieOpts);

  const response = responder(
    { data: { user: result.user, accessToken: result.tokens.accessToken } },
    { message: "User logged in successfully" }
  );
  return c.json(response);
});

// Refresh tokens
app.post("/refresh", async (c) => {
  const refreshToken = getCookie(c, "refreshToken");
  if (!refreshToken) throw new UnauthorizedError("No refresh token");

  const result = await refreshTokenService(refreshToken);

  // rotate refresh cookie
  const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  } as any;
  setCookie(c, "refreshToken", result.tokens.refreshToken, cookieOpts);

  const response = responder(
    { data: { user: result.user, accessToken: result.tokens.accessToken } },
    { message: "Token refreshed successfully" }
  );
  return c.json(response);
});

// TODO: Forgot/Reset Password /reset and /forgot

// Logout
app.post("/logout", async (c) => {
  // clear cookie using helper
  deleteCookie(c, "refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  await logoutService();
  return c.json(responder({ data: null }, { message: "Logged out" }));
});

export default app;
