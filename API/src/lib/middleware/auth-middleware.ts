import { Request, Response, NextFunction } from "express";
import {
  verifyAccessToken,
  verifyRefreshToken,
  extractTokenFromHeader,
  JwtPayload,
} from "../utils/jwt-token";
import { UserService } from "../../services/user.service";
import { Role } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export class AuthMiddleware {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  async authenticate(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      const token = extractTokenFromHeader(authHeader);

      if (!token) {
        res.status(401).json({
          success: false,
          message: "No token provided!",
        });
        return;
      }

      // Verify the access token
      const decodedToken = verifyAccessToken(token);

      const user = await this.userService.getUserById(decodedToken.userId);
      if (!user) {
        res.status(401).json({
          success: false,
          message: "Invalid token or user does not exist",
        });
        return;
      }

      // Prevent access if the user is restricted by admin
      if (user.isRestricted) {
        res.status(403).json({
          success: false,
          message: "User is restricted from accessing this resource",
        });
        return;
      }

      req.user = decodedToken;
      next();
    } catch (error) {
      console.error("Authentication error:", error);
      res.status(401).json({
        success: false,
        message: error instanceof Error ? error.message : "Invalid token",
      });
    }
  }

  requireOwnership = (getResourceId: (req: Request) => Promise<number>) => {
    return async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        if (!req.user) {
          res.status(401).json({
            success: false,
            message: "Unauthorized access",
          });
          return;
        }

        // Check if the user has the required role or is the owner of the resource
        const resourceOwnerId = await getResourceId(req);
        const userRole = await this.userService.getUserRole(req.user.userId);

        if (userRole === Role.admin || resourceOwnerId === req.user.userId) {
          next();
          return;
        }
        res.status(403).json({
          success: false,
          message: "You do not have permission to access this resource",
        });
      } catch (error) {
        console.error("Ownership check error:", error);
        res.status(500).json({
          success: false,
          message: "Internal server error",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    };
  };

  requireSelfOrAdmin = () => {
    return async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        if (!req.user) {
          res.status(401).json({
            success: false,
            message: "Unauthorized access",
          });
          return;
        }

        const requestedUserId = Number(req.params.id);
        const userRole = await this.userService.getUserRole(req.user.userId);

        // Allow if user is admin or accessing their own resources
        if (userRole === Role.admin || req.user.userId === requestedUserId) {
          next();
          return;
        }

        res.status(403).json({
          success: false,
          message: "You can only access your own resources",
        });
      } catch (error) {
        console.error("Authorization check error:", error);
        res.status(500).json({
          success: false,
          message: "Internal server error",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    };
  };

  requireAdmin = () => {
    return async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        if (!req.user) {
          res.status(401).json({
            success: false,
            message: "Unauthorized access",
          });
          return;
        }

        const userRole = await this.userService.getUserRole(req.user.userId);

        if (userRole === Role.admin) {
          next();
          return;
        }

        res.status(403).json({
          success: false,
          message: "Admin access required",
        });
      } catch (error) {
        console.error("Admin check error:", error);
        res.status(500).json({
          success: false,
          message: "Internal server error",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    };
  };
}
