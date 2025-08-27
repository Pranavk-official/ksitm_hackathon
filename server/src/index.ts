import { Hono } from "hono";
import { logger } from "hono/logger";
import { errorHandler } from "./error";
import { NotFoundError } from "@shared/error";
import auth_routes from "@module/user/routes/auth.route";

const app = new Hono();

// Logger middleware
app.use(logger());

app.get("/health", (c) => {
  return c.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

app.route("/auth", auth_routes);

app.notFound((c) => {
  throw new NotFoundError(`Route: ${c.req.path} not found`);
});

app.onError(errorHandler);

export default app;
