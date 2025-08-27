import { Hono } from "hono";

export const authRoutes = new Hono()
  .post("/signup", (c) => c.text(""))
  .post("/login", (c) => c.text(""))
  .post("/refresh", (c) => c.text(""))
  .post("/forgot", (c) => c.text(""))
  .post("/reset", (c) => c.text(""))
  .post("/logout", (c) => c.text(""));

export type AppType = typeof authRoutes;
export default authRoutes;
