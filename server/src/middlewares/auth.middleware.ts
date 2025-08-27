import { Context, Next } from "hono";
import { JwtPayload, verifyAccessToken } from "@shared/jwt";
import { UnauthorizedError, TooManyRequestsError } from "@shared/error";

import { incrWithTTL } from "@shared/rateLimiter";
import { User } from "@prisma/client";

declare module "hono" {
  interface ContextVariableMap {
    user: JwtPayload | User;
    token: string;
  }
}

const RATE_LIMIT_WINDOW_SECONDS =
  Number(process.env.RATE_LIMIT_WINDOW_SECONDS) || 60; // seconds
const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX) || 10;

export const rateLimit = async (c: Context, next: Next) => {
  const ip =
    c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "local";
  const key = `rl:${ip}`;
  const count = await incrWithTTL(key, RATE_LIMIT_WINDOW_SECONDS);
  if (count > RATE_LIMIT_MAX)
    throw new TooManyRequestsError("Too many requests");
  await next();
};

// Auth middleware: expects Authorization: Bearer <accessToken>
export const authMiddleware = async (c: Context, next: Next) => {
  const auth = c.req.header("authorization");
  if (!auth) throw new UnauthorizedError("Missing Authorization header");
  const parts = auth.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer")
    throw new UnauthorizedError("Invalid Authorization header");
  const token = parts[1];
  const payload = verifyAccessToken(token);
  c.set("user", payload);
  c.set("token", token);
  await next();
};
