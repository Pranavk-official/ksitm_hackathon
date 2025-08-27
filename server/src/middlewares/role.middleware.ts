import { Context, Next } from "hono";
import { JwtPayload } from "@shared/jwt";
import { ForbiddenError, UnauthorizedError } from "@shared/error";

/**
 * Role guard middleware factory.
 * Usage: app.use('/admin', roleGuard(['ADMIN']))
 */
export const roleGuard = (allowed: string[] | string) => {
  const allowedArr = Array.isArray(allowed) ? allowed : [allowed];
  return async (c: Context, next: Next) => {
    // auth middleware sets c.get('user') as JwtPayload
    const user = c.get("user") as JwtPayload | undefined;
    if (!user) throw new UnauthorizedError("Missing authenticated user");

    const role = (user.role as string) || (user as any).roleId || undefined;
    if (!role) throw new ForbiddenError("User has no role assigned");

    if (!allowedArr.includes(role.toUpperCase())) {
      throw new ForbiddenError("Insufficient role permissions");
    }

    await next();
  };
};

export default roleGuard;
