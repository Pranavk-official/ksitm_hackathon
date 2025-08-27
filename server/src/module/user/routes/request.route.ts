import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { authMiddleware } from "@middleware/auth.middleware";
import responder from "@shared/responder";
import {
  createServiceRequest,
  getMyRequests,
} from "../services/request.service";
import { createAuditFromContext } from "@shared/audit";

const createSchema = z.object({
  serviceType: z.string().min(1),
  description: z.string().optional(),
  feeAmount: z.union([z.string(), z.number()]).optional(),
});

const app = new Hono();

app.use("*", authMiddleware);

app.post("/", zValidator("json", createSchema), async (c) => {
  const body: any = c.req.valid("json");
  const user = c.get("user");
  const userId = user?.id!;
  const sr = await createServiceRequest(userId, body);
  await createAuditFromContext(c, `request:create:${sr.id}`);
  return c.json(
    responder({ data: sr }, { message: "Service request created" }),
    201
  );
});

app.get("/me", async (c) => {
  const user = c.get("user");
  const userId = user?.id!;
  const list = await getMyRequests(userId);
  await createAuditFromContext(c, `request:list:my`);
  return c.json(responder({ data: list }));
});

export default app;
