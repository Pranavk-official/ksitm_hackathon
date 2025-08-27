import prisma from "@shared/prisma";
import { signResetToken, verifyResetToken } from "@shared/jwt";
import { NotFoundError, BadRequestError } from "@shared/error";
import * as bcrypt from "bcryptjs";

export const issuePasswordReset = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new NotFoundError("User not found");

  const role = user.roleId ?? undefined;
  const token = signResetToken({ id: user.id, email: user.email, role });
  // In production we'd email the token or a URL containing it.
  return { token, userId: user.id };
};

export const resetPassword = async (token: string, newPassword: string) => {
  const payload = verifyResetToken(token);
  if (!payload || !payload.id) throw new BadRequestError("Invalid reset token");

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(newPassword, salt);

  const user = await prisma.user.update({
    where: { id: payload.id },
    data: { passwordHash, salt },
  });

  return { id: user.id, email: user.email };
};
