import { Request, Response, NextFunction } from "express";
import { tokenService } from "../../services/auth/token";
import { JwtPayload } from "../../lib/dtos/authDto";
import { UserService } from "../../services/user/_index";
import { Role } from "@prisma/client";
import "../../types";

const userService = new UserService();

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    const token = tokenService.extractTokenFromHeader(authHeader);

    // If token is not provided, return 401 Unauthorized
    if (!token) {
      res.status(401).json({
        success: false,
        message: "Access token is missing",
      });
      return;
    }

    // Verify the token and get user information
    const decoded = tokenService.verifyAccessToken(token) as JwtPayload;
    // Fetch user from the database to ensure they are not restricted
    const user = await userService.profile.getUserById(decoded.userId);

    // If user is not found or is restricted, return 401 Unauthorized
    if (!user || user.isRestricted) {
      res.status(401).json({
        success: false,
        message: "User not found or restricted",
      });
      return;
    }

    // Attach user information to the request object
    req.user = { ...decoded, role: user.role };
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
    return;
  }
};

export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Ensure the user is authenticated
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const requestUser = req.user!;

    if (requestUser.role !== Role.admin) {
      res.status(403).json({
        success: false,
        message: "Forbidden: Admin access required",
      });
      return;
    }

    // Double-check the role from database
    const user = await userService.profile.getUserById(requestUser.userId);
    if (!user || user.role !== Role.admin) {
      res.status(403).json({
        success: false,
        message: "Forbidden: Admin access required",
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
    return;
  }
};

export const requireSelfOnly = (resourceParam: string = "id") => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const resourceUserId = Number(req.params[resourceParam]);
    const requestUser = req.user!;

    if (requestUser.userId !== resourceUserId) {
      res.status(403).json({
        success: false,
        message: "You can only perform this action on your own account",
      });
      return;
    }

    next();
  };
};
