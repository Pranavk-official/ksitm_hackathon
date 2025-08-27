import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { errorHandler } from "./error";
import { NotFoundError } from "@shared/error";
import auth_routes from "@module/user/routes/auth.route";
import admin_routes from "@module/admin/routes/admin.route";
import officer_routes from "@module/officer/routes/officer.route";
import request_routes from "@module/user/routes/request.route";
import payment_routes from "@module/payments/routes/payment.route";
import docs_routes from "./routes/docs";
import { securityHeaders } from "@middleware/security.middleware";

const app = new Hono();

// Logger middleware
app.use(logger());
// Basic security headers (helmet subset)
app.use(securityHeaders);
app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

app.get("/health", (c) => {
  return c.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

app.route("/auth", auth_routes);
app.route("/admin", admin_routes);
app.route("/officer", officer_routes);
app.route("/requests", request_routes);
app.route("/payments", payment_routes);
app.route("/docs", docs_routes);

app.notFound((c) => {
  throw new NotFoundError(`Route: ${c.req.path} not found`);
});

app.onError(errorHandler);

export default app;
