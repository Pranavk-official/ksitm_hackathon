import prisma from "@shared/prisma";

export const createAudit = async (
  userId: string | null | undefined,
  action: string
) => {
  try {
    await prisma.auditLog.create({
      data: { userId: userId ?? undefined, action },
    });
  } catch (e) {
    // Don't block primary flow on audit failures. Log to console in development.
    if (process.env.NODE_ENV === "development")
      console.error("Audit log failed:", e);
  }
};

export default { createAudit };

// Convenience: accept a Hono Context-like object with user payload or token
export const createAuditFromContext = async (c: any, action: string) => {
  try {
    const user = c?.get ? c.get("user") : (c?.user ?? undefined);
    const userId = (user && (user.sub ?? user.id)) || undefined;
    await createAudit(userId, action);
  } catch (e) {
    if (process.env.NODE_ENV === "development")
      console.error("Audit ctx failed:", e);
  }
};
