// Minimal mock payment gateway adapter for dev/testing.
// Exposes createOrder and verifyWebhookSignature.
import crypto from "crypto";

export const createOrder = async (opts: {
  amount: number;
  currency: string;
  receipt?: string;
}) => {
  // Simulate creating an order at gateway; return orderId and payload
  const orderId = `MOCKORD_${crypto.randomBytes(6).toString("hex")}`;
  return {
    id: orderId,
    amount: opts.amount,
    currency: opts.currency,
    receipt: opts.receipt,
    created_at: Date.now(),
  };
};

export const signPayload = (payload: string, secret: string) => {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
};

export const verifyWebhookSignature = (
  rawBody: string,
  signature: string,
  secret: string
) => {
  const expected = signPayload(rawBody, secret);
  return expected === signature;
};

export default { createOrder, signPayload, verifyWebhookSignature };
