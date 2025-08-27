import prisma from "@shared/prisma";
import { Prisma } from "@prisma/client";

export const createServiceRequest = async (
  userId: string,
  data: {
    serviceType: string;
    description?: string;
    feeAmount?: string | number;
  }
) => {
  const fee =
    typeof data.feeAmount === "number"
      ? new Prisma.Decimal(data.feeAmount)
      : new Prisma.Decimal(String(data.feeAmount ?? "0.00"));
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
