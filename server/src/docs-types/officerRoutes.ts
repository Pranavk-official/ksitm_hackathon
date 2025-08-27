import { Hono } from "hono";

export const officerRoutes = new Hono()
  .get("/requests", (c) => c.text(""))
  .post("/requests/:id/status", (c) => c.text(""));

export type AppType = typeof officerRoutes;
export default officerRoutes;
