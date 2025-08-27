import prisma, { Prisma } from "@shared/prisma";
import { RoleType } from "@prisma/client";
import { UserCreateInput } from "../models/user.model";
import * as bcrypt from "bcryptjs";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "@shared/jwt";
import { UnauthorizedError, NotFoundError } from "@shared/error";

type TokenPair = { accessToken: string; refreshToken: string };

// Create (signup) user: hash password and store salt + hash
export const createUserService = async (data: UserCreateInput) => {
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(data.password, salt);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      name: data.name ?? "",
      mobile: data.mobile ?? undefined,
      salt,
      passwordHash,
      // ensure a default role is attached. connectOrCreate will connect to
      // an existing Role with name = CITIZEN or create it if missing.
      role: {
        connectOrCreate: {
          where: { name: RoleType.CITIZEN },
          create: { name: RoleType.CITIZEN },
        },
      },
    },
    include: { role: true },
  });

  return user;
};

// Helper to sign access + refresh tokens
export const signTokenPair = (user: {
  id: string;
  role?: string;
}): TokenPair => {
  const payload = { sub: user.id, role: user.role };
  const accessToken = signAccessToken(payload as any);
  const refreshToken = signRefreshToken(payload as any);
  return { accessToken, refreshToken };
};

// Login service: verify credentials and return token pair + user
export const loginUserService = async (email: string, password: string) => {
  const allowedFields: string[] = [
    "id",
    "email",
    "name",
    "roleId",
    "role",
    "mobile",
    "passwordHash",
    "salt",
  ];
  const select: Prisma.UserSelect = allowedFields.reduce(
    (acc, field) => ({ ...acc, [field]: true }),
    {}
  );

  const user = await prisma.user.findUnique({ where: { email }, select });
  if (!user) throw new UnauthorizedError("Invalid credentials");

  const isValid = bcrypt.compareSync(password, user.passwordHash);
  if (!isValid) throw new UnauthorizedError("Invalid credentials");

  const tokens = signTokenPair({ id: user.id, role: user.roleId ?? undefined });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.roleId,
    },
    tokens,
  };
};

// Verify refresh token and return new token pair
export const refreshTokenService = async (refreshToken: string) => {
  const decoded = verifyRefreshToken(refreshToken);
  if (!decoded || !decoded.sub)
    throw new UnauthorizedError("Invalid refresh token");

  const allowedFields: string[] = [
    "id",
    "email",
    "name",
    "roleId",
    "role",
    "mobile",
  ];
  const select: Prisma.UserSelect = allowedFields.reduce(
    (acc, field) => ({ ...acc, [field]: true }),
    {}
  );
  const user = await prisma.user.findUnique({
    where: { id: decoded.sub },
    select,
  });
  if (!user) throw new NotFoundError("User not found");

  const tokens = signTokenPair({ id: user.id, role: user.roleId ?? undefined });
  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.roleId,
    },
    tokens,
  };
};

export const logoutService = async (_userId?: string) => {
  // Without persistent storage for refresh tokens we only clear cookie on client.
  // If token revocation is required, implement a blacklist table or Redis store.
  return true;
};
