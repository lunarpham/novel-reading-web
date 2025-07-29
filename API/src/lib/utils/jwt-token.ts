import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { Constants } from "../constants/index";
import { User } from "@prisma/client";

export interface JwtPayload {
  userId: number;
  email: string;
  username: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export function generateAccessToken(
  user: Pick<User, "id" | "email" | "username" | "role">
): string {
  const payload: Omit<JwtPayload, "iat" | "exp"> = {
    userId: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
  };

  return jwt.sign(
    payload,
    Constants.JWT_SECRET as Secret,
    {
      expiresIn: Constants.JWT_EXPIRATION,
      issuer: Constants.JWT_ISSUER,
      audience: Constants.JWT_AUDIENCE,
    } as SignOptions
  );
}

export function generateRefreshToken(userId: number): string {
  return jwt.sign(
    { userId },
    Constants.JWT_REFRESH_SECRET as Secret,
    {
      expiresIn: Constants.JWT_REFRESH_EXPIRATION,
      issuer: Constants.JWT_ISSUER,
      audience: Constants.JWT_AUDIENCE,
    } as SignOptions
  );
}

export function verifyAccessToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, Constants.JWT_SECRET!, {
      issuer: Constants.JWT_ISSUER,
      audience: Constants.JWT_AUDIENCE,
    }) as JwtPayload;

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Access token has expired");
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("Invalid access token");
    }
    throw new Error("Token verification failed");
  }
}

export function verifyRefreshToken(token: string): { userId: number } {
  try {
    const decoded = jwt.verify(token, Constants.JWT_REFRESH_SECRET!, {
      issuer: Constants.JWT_ISSUER,
      audience: Constants.JWT_AUDIENCE,
    }) as { userId: number };

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Refresh token has expired");
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("Invalid refresh token");
    }
    throw new Error("Refresh token verification failed");
  }
}

export function extractTokenFromHeader(
  authHeader: string | undefined
): string | null {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }

  return parts[1];
}
