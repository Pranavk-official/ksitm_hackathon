import { Hono } from "hono";

export const adminRoutes = new Hono()
  .get("/users", (c) => c.text(""))
  .post("/users/:id/role", (c) => c.text(""));

export type AppType = typeof adminRoutes;
export default adminRoutes;
