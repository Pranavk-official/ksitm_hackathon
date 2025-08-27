import * as jwt from "jsonwebtoken";
import { UnauthorizedError, InternalServerError } from "@shared/error";

const ACCESS_TOKEN_EXPIRES = process.env.JWT_ACCESS_EXPIRES || "15m";
const REFRESH_TOKEN_EXPIRES = process.env.JWT_EXPIRES_IN || "7d";
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "change-me";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "change-me";

export type JwtPayload = {
  id: string;
  role?: string;
  email?: string;
  mobile?: string;
} & Record<string, any>;

export const signAccessToken = (payload: JwtPayload) => {
  try {
    return (jwt as any).sign(payload, ACCESS_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRES,
    });
  } catch (e: any) {
    throw new InternalServerError("Failed to sign access token");
  }
};

export const signRefreshToken = (payload: JwtPayload) => {
  try {
    return (jwt as any).sign(payload, REFRESH_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRES,
    });
  } catch (e: any) {
    throw new InternalServerError("Failed to sign refresh token");
  }
};

export const verifyAccessToken = (token: string): JwtPayload => {
  try {
    return (jwt as any).verify(token, ACCESS_SECRET) as JwtPayload;
  } catch (e: any) {
    throw new UnauthorizedError("Invalid access token");
  }
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  try {
    return (jwt as any).verify(token, REFRESH_SECRET) as JwtPayload;
  } catch (e: any) {
    throw new UnauthorizedError("Invalid refresh token");
  }
};
