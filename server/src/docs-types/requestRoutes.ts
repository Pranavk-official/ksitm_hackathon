import { Hono } from "hono";

export const requestRoutes = new Hono()
  .post("/", (c) => c.text(""))
  .get("/me", (c) => c.text(""))
  .get("/fee", (c) => c.text(""));

export type AppType = typeof requestRoutes;
export default requestRoutes;
