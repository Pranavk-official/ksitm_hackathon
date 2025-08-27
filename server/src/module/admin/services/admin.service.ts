import prisma from "@shared/prisma";
import { RoleType } from "@prisma/client";

export const listUsers = async () => {
  return prisma.user.findMany({ include: { role: true } });
};

export const setUserRole = async (userId: string, role: RoleType) => {
  return prisma.user.update({
    where: { id: userId },
    data: {
      roleId:
        (await prisma.role.findUnique({ where: { name: role } }))?.id ??
        undefined,
    },
  });
};
