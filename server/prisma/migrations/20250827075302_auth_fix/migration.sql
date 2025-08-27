-- CreateEnum
CREATE TYPE "public"."ServiceRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "public"."RoleType" AS ENUM ('ADMIN', 'OFFICER', 'CITIZEN');

-- CreateTable
CREATE TABLE "public"."users" (
    "UserID" TEXT NOT NULL,
    "Name" TEXT NOT NULL,
    "Email" TEXT NOT NULL,
    "Mobile" TEXT,
    "Salt" TEXT NOT NULL,
    "PasswordHash" TEXT NOT NULL,
    "Role" TEXT,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("UserID")
);

-- CreateTable
CREATE TABLE "public"."roles" (
    "RoleID" TEXT NOT NULL,
    "RoleName" "public"."RoleType" NOT NULL DEFAULT 'CITIZEN',

    CONSTRAINT "roles_pkey" PRIMARY KEY ("RoleID")
);

-- CreateTable
CREATE TABLE "public"."service_requests" (
    "RequestID" TEXT NOT NULL,
    "UserID" TEXT NOT NULL,
    "ServiceType" TEXT NOT NULL,
    "Description" TEXT,
    "FeeAmount" DECIMAL(10,2) NOT NULL,
    "Status" "public"."ServiceRequestStatus" NOT NULL DEFAULT 'PENDING',
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_requests_pkey" PRIMARY KEY ("RequestID")
);

-- CreateTable
CREATE TABLE "public"."audit_logs" (
    "LogID" TEXT NOT NULL,
    "UserID" TEXT,
    "Action" TEXT NOT NULL,
    "Timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("LogID")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_Email_key" ON "public"."users"("Email");

-- CreateIndex
CREATE UNIQUE INDEX "roles_RoleName_key" ON "public"."roles"("RoleName");

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_Role_fkey" FOREIGN KEY ("Role") REFERENCES "public"."roles"("RoleID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."service_requests" ADD CONSTRAINT "service_requests_UserID_fkey" FOREIGN KEY ("UserID") REFERENCES "public"."users"("UserID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."audit_logs" ADD CONSTRAINT "audit_logs_UserID_fkey" FOREIGN KEY ("UserID") REFERENCES "public"."users"("UserID") ON DELETE SET NULL ON UPDATE CASCADE;
