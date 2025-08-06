import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { Constants } from "../../lib/constants/index";
import { JwtPayload, TokenResponse, TokenUser } from "../../lib/dtos/authDto";
import { AppError } from "../../lib/middleware/error";

export class TokenService {
  generateAccessToken(user: TokenUser): string {
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

  generateRefreshToken(userId: number): string {
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

  generateTokens(user: TokenUser): TokenResponse {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user.id);

    // Parse expiration from constants (e.g., "1h" -> 3600 seconds)
    const expiresIn = this.parseExpirationToSeconds(Constants.JWT_EXPIRATION);

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  verifyAccessToken(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, Constants.JWT_SECRET!, {
        issuer: Constants.JWT_ISSUER,
        audience: Constants.JWT_AUDIENCE,
      }) as JwtPayload;

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError(401, "Access token has expired");
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError(401, "Invalid access token");
      }
      throw new AppError(401, "Token verification failed");
    }
  }

  verifyRefreshToken(token: string): { userId: number } {
    try {
      const decoded = jwt.verify(token, Constants.JWT_REFRESH_SECRET!, {
        issuer: Constants.JWT_ISSUER,
        audience: Constants.JWT_AUDIENCE,
      }) as { userId: number };

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError(401, "Refresh token has expired");
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError(401, "Invalid refresh token");
      }
      throw new AppError(401, "Refresh token verification failed");
    }
  }

  extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return null;
    }

    return parts[1];
  }

  refreshAccessToken(refreshToken: string, user: TokenUser): TokenResponse {
    // Verify refresh token first
    const decoded = this.verifyRefreshToken(refreshToken);

    // Ensure refresh token belongs to the user
    if (decoded.userId !== user.id) {
      throw new AppError(401, "Invalid refresh token for user");
    }

    // Generate new tokens
    return this.generateTokens(user);
  }

  isTokenExpired(token: string): boolean {
    try {
      jwt.verify(token, Constants.JWT_SECRET!);
      return false;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return true;
      }
      return false; // Other errors mean token is invalid, not expired
    }
  }

  decodeToken(token: string): JwtPayload | null {
    try {
      const decoded = jwt.decode(token) as JwtPayload;
      return decoded;
    } catch {
      return null;
    }
  }

  private parseExpirationToSeconds(expiration: string): number {
    const units: { [key: string]: number } = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
    };

    const match = expiration.match(/^(\d+)([smhd])$/);
    if (!match) {
      throw new AppError(400, "Invalid expiration format");
    }

    const [, value, unit] = match;
    return parseInt(value) * units[unit];
  }
}

// Export singleton instance
export const tokenService = new TokenService();
