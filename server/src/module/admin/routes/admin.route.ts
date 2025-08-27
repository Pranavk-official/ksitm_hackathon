import { Hono } from "hono";
import responder from "@shared/responder";
import roleGuard from "@middleware/role.middleware";
import { listUsers, setUserRole } from "../services/admin.service";
import { createAudit } from "@shared/audit";

const app = new Hono();

// All admin routes require ADMIN role
app.use("*", roleGuard(["ADMIN"]));

app.get("/users", async (c) => {
  const users = await listUsers();
  await createAudit(c.get("user")?.id ?? undefined, "admin:list_users");
  return c.json(responder({ data: users }));
});

app.post("/users/:id/role", async (c) => {
  const id = c.req.param("id");
  const body: any = c.req.json ? await c.req.json() : {};
  const role = body.role;
  if (!role)
    return c.json(responder({ data: null }, { message: "role required" }));
  const updated = await setUserRole(id, role);
  await createAudit(
    c.get("user")?.id ?? undefined,
    `admin:set_role:${id}:${role}`
  );
  return c.json(responder({ data: updated }));
});

export default app;
export type AppType = typeof app;
