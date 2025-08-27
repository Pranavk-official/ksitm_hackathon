import prisma from "@shared/prisma";
import { ServiceRequestStatus } from "@prisma/client";
import { NotFoundError, BadRequestError } from "@shared/error";

export const listRequests = async () => {
  return prisma.serviceRequest.findMany({ include: { user: true } });
};

export const updateRequestStatus = async (
  id: string,
  status: string,
  note?: string
) => {
  const statusUpper = (status || "").toUpperCase();
  const allowed = Object.values(ServiceRequestStatus) as string[];
  if (!allowed.includes(statusUpper)) {
    throw new BadRequestError(`Invalid status. Allowed: ${allowed.join(",")}`);
  }

  const updated = await prisma.serviceRequest.update({
    where: { id },
    data: { status: statusUpper as ServiceRequestStatus, description: note },
  });
  return updated;
};
