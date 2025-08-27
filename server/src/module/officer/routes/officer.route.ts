import { Hono } from "hono";
import responder from "@shared/responder";
import roleGuard from "@middleware/role.middleware";
import { listRequests, updateRequestStatus } from "../services/officer.service";
import { createAudit } from "@shared/audit";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

const statusBody = z.object({
  status: z.string().min(3),
  note: z.string().optional(),
});

const app = new Hono();

app.use("*", roleGuard(["OFFICER"]));

app.get("/requests", async (c) => {
  const data = await listRequests();
  await createAudit(c.get("user")?.id ?? undefined, "officer:list_requests");
  return c.json(responder({ data }));
});

app.post("/requests/:id/status", zValidator("json", statusBody), async (c) => {
  const id = c.req.param("id");
  const body: any = c.req.valid("json");
  const updated = await updateRequestStatus(id, body.status, body.note);
  await createAudit(
    c.get("user")?.id ?? undefined,
    `officer:update_request:${id}:${body.status}`
  );
  return c.json(responder({ data: updated }));
});

export default app;
