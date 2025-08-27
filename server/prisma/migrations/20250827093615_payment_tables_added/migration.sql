-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED');

-- CreateTable
CREATE TABLE "public"."payment_transactions" (
    "TransactionID" TEXT NOT NULL,
    "UserID" TEXT,
    "RequestID" TEXT,
    "Amount" DECIMAL(10,2) NOT NULL,
    "Currency" TEXT NOT NULL,
    "OrderId" TEXT,
    "PaymentId" TEXT,
    "Status" "public"."PaymentStatus" NOT NULL,
    "Signature" TEXT,
    "GatewayResponse" JSONB,
    "IdempotencyKey" TEXT,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_transactions_pkey" PRIMARY KEY ("TransactionID")
);

-- AddForeignKey
ALTER TABLE "public"."payment_transactions" ADD CONSTRAINT "payment_transactions_UserID_fkey" FOREIGN KEY ("UserID") REFERENCES "public"."users"("UserID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payment_transactions" ADD CONSTRAINT "payment_transactions_RequestID_fkey" FOREIGN KEY ("RequestID") REFERENCES "public"."service_requests"("RequestID") ON DELETE SET NULL ON UPDATE CASCADE;
