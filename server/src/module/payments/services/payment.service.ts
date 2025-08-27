import prisma from "../../../shared/prisma";
import { createOrder as gatewayCreateOrder } from "../../../adapters/mockGateway";

export const createOrderIntent = async (opts: {
  userId: string;
  requestId: string;
  amount: string; // decimal string
  currency?: string;
  idempotencyKey?: string;
}) => {
  const currency = opts.currency || "INR";
  // Check request ownership and status
  const req = await prisma.serviceRequest.findUnique({
    where: { id: opts.requestId },
  });
  if (!req) throw new Error("Request not found");
  if (req.userId !== opts.userId)
    throw new Error("Not authorized to pay for this request");

  // Try to find existing txn by idempotencyKey
  if (opts.idempotencyKey) {
    const existing = await prisma.paymentTransaction.findFirst({
      where: { idempotencyKey: opts.idempotencyKey },
    });
    if (existing) return existing;
  }

  // Create a pending transaction record
  const txn = await prisma.paymentTransaction.create({
    data: {
      userId: opts.userId,
      requestId: opts.requestId,
      amount: opts.amount as any,
      currency,
      status: "PENDING",
      idempotencyKey: opts.idempotencyKey,
    },
  });

  // Call gateway to create an order
  const order = await gatewayCreateOrder({
    amount: Math.round(Number(opts.amount) * 100),
    currency,
    receipt: txn.id,
  });

  // Store orderId and gateway response
  const updated = await prisma.paymentTransaction.update({
    where: { id: txn.id },
    data: {
      orderId: order.id,
      gatewayResponse: order as any,
    },
  });

  return updated;
};

export const handleWebhook = async (opts: {
  rawBody: string;
  signature: string;
  secret: string;
}) => {
  // Verify signature using mock adapter
  const { verifyWebhookSignature } = await import(
    "../../../adapters/mockGateway"
  );
  const ok = verifyWebhookSignature(opts.rawBody, opts.signature, opts.secret);
  if (!ok) return { ok: false };

  const payload = JSON.parse(opts.rawBody);
  const { order_id, payment_id, status } = payload;

  // Idempotent upsert based on orderId or paymentId
  const existing = await prisma.paymentTransaction.findFirst({
    where: { orderId: order_id },
  });
  if (!existing) return { ok: false, reason: "order not found" };

  // Update txn
  const tx = await prisma.paymentTransaction.update({
    where: { id: existing.id },
    data: {
      paymentId: payment_id,
      status: status === "success" ? "SUCCESS" : "FAILED",
      gatewayResponse: payload,
    },
  });

  // If success, mark service request paid by setting status to COMPLETED (or keep APPROVED flow)
  if (tx.status === "SUCCESS" && tx.requestId) {
    await prisma.serviceRequest.update({
      where: { id: tx.requestId },
      data: { status: "COMPLETED" },
    });
  }

  return { ok: true, tx };
};

export default { createOrderIntent, handleWebhook };
