import { Hono } from "hono";

export const paymentRoutes = new Hono()
  .get("/health", (c) => c.text(""))
  .post("/create-order", (c) => c.text(""))
  .post("/webhook", (c) => c.text(""));

export type AppType = typeof paymentRoutes;
export default paymentRoutes;
