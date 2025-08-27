import { Hono } from "hono";
import z from "zod";
import { authMiddleware } from "../../../middlewares/auth.middleware";
import { createOrderIntent, handleWebhook } from "../services/payment.service";
import { createAuditFromContext } from "../../../shared/audit";
import responder from "../../../shared/responder";

const app = new Hono();

app.get("/health", (c) => c.json(responder({ data: { ok: true } })));

const createSchema = z.object({
  requestId: z.string().uuid(),
  idempotencyKey: z.string().optional(),
});

app.post("/create-order", authMiddleware, async (c) => {
  const body = await c.req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success)
    return c.json(
      responder({ error: parsed.error.issues }, { message: "Invalid input" }),
      400
    );

  const user = c.get("user");
  const userId = ((user as any)?.sub ?? (user as any)?.id) as string;

  try {
    // Lookup the service request to send amount. We trust server-side fee already present in SR
    const sr = await (
      await import("../../../shared/prisma")
    ).default.serviceRequest.findUnique({
      where: { id: parsed.data.requestId },
    });
    if (!sr) return c.json(responder({ error: "Request not found" }), 404);
    if (sr.userId !== userId)
      return c.json(responder({ error: "Not authorized" }), 403);

    const txn = await createOrderIntent({
      userId,
      requestId: parsed.data.requestId,
      amount: sr.feeAmount.toString(),
      idempotencyKey: parsed.data.idempotencyKey,
    });

    await createAuditFromContext(c, `payment:create:${txn.id}`);

    return c.json(responder({ data: txn }));
  } catch (err: any) {
    return c.json(responder({ error: String(err.message || err) }), 500);
  }
});

// Webhook - no auth, but signature verified inside service
app.post("/webhook", async (c) => {
  const raw = await c.req.text();
  const signature = c.req.header("x-mock-signature") || "";
  const secret = process.env.MOCK_GATEWAY_SECRET || "mock_secret";

  const res = await handleWebhook({ rawBody: raw, signature, secret });
  if (!res.ok)
    return c.json(
      responder({ error: res.reason || "verification failed" }),
      400
    );
  return c.json(responder({ data: res.tx }));
});

export default app;
export type AppType = typeof app;
