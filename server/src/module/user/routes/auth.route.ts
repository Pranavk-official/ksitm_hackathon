import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { setCookie, getCookie, deleteCookie } from "hono/cookie";
import { loginSchema, userCreateSchema } from "../models/user.model";
import responder from "@shared/responder";
import { createAudit } from "@shared/audit";
import {
  createUserService,
  loginUserService,
  refreshTokenService,
} from "../services/auth.service";
import {
  issuePasswordReset,
  resetPassword,
} from "../services/password.service";
import { rateLimit } from "@middleware/auth.middleware";
import { UnauthorizedError } from "@shared/error";
import { z } from "zod";

const forgotSchema = z.object({ email: z.string().email() });
const resetSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(6),
});

const app = new Hono();

// Sign up
app.post(
  "/signup",
  rateLimit,
  zValidator("json", userCreateSchema),
  async (c) => {
    const body = c.req.valid("json");
    const user = await createUserService(body);
    await createAudit(user.id, "signup");
    const response = responder(
      { data: user },
      { message: "User created successfully" }
    );
    return c.json(response, 201);
  }
);

app.post("/login", rateLimit, zValidator("json", loginSchema), async (c) => {
  const body: any = c.req.valid("json");
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
  await createAudit(result.user.id, "login");
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
  await createAudit(result.user.id, "refresh");
  return c.json(response);
});

// Forgot/Reset implemented below
// Forgot - issue a reset token (in dev we return token in response; in prod email it)
app.post("/forgot", rateLimit, zValidator("json", forgotSchema), async (c) => {
  const body: any = c.req.valid("json");
  const result = await issuePasswordReset(body.email);
  await createAudit(result.userId, "reset-password:issued");
  // In dev return token for testing; in prod send via email and return 202
  const response = responder(
    { resetToken: result.token },
    { message: "Password reset token issued" }
  );
  return c.json(response);
});

// Reset - accept token + newPassword
app.post("/reset", zValidator("json", resetSchema), async (c) => {
  const body: any = c.req.valid("json");
  const res = await resetPassword(body.token, body.newPassword);
  await createAudit(res.id, "reset-password:completed");
  const response = responder(
    { data: res },
    { message: "Password reset successful" }
  );
  return c.json(response);
});

// Logout
app.post("/logout", async (c) => {
  const user = c.get("user");
  const userId = user?.id!;

  await createAudit(userId, "logout");
  // clear cookie using helper
  deleteCookie(c, "refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  // await logoutService();
  return c.json(responder({ data: null }, { message: "Logged out" }));
});

export default app;
