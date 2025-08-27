import prisma from "@shared/prisma";
import { Prisma } from "@prisma/client";
import { getFeeForService } from "@config/fees";

export const createServiceRequest = async (
  userId: string,
  data: {
    serviceType: string;
    description?: string;
    feeAmount?: string | number;
  }
) => {
  // Always compute fee server-side to prevent tampering.
  const feeValue = getFeeForService(data.serviceType);
  const fee = new Prisma.Decimal(String(feeValue ?? "0.00"));
  const sr = await prisma.serviceRequest.create({
    data: {
      userId,
      serviceType: data.serviceType,
      description: data.description ?? undefined,
      feeAmount: fee,
    },
  });
  return sr;
};

export const getMyRequests = async (userId: string) => {
  return prisma.serviceRequest.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
};
