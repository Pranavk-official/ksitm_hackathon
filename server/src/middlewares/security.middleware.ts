import { Context, Next } from "hono";

export const securityHeaders = async (c: Context, next: Next) => {
  // Basic protection headers (subset of helmet)
  c.header("X-Content-Type-Options", "nosniff");
  c.header("X-Frame-Options", "DENY");
  c.header("X-XSS-Protection", "1; mode=block");
  c.header("Referrer-Policy", "no-referrer");
  c.header("Permissions-Policy", "geolocation=(), microphone=()");
  await next();
};

export default securityHeaders;
