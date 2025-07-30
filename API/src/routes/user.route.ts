import { Router, Request, Response } from "express";
import { UserController } from "../controllers/user.controller";
import {
  userValidationRules,
  validateUserProfileUpdate,
  handleValidationErrors,
  validateFollowUserId,
  validateUserPasswordChange,
} from "../lib/middleware/user-validator";
import {
  authenticate,
  requireAdmin,
  requireSelfOnly,
} from "../lib/middleware/auth-middleware";

const router = Router();
const userController = new UserController();

router.get("/", (req: Request, res: Response) =>
  userController.getAllUsers(req, res)
);

// Get user profile (public)
router.get(
  "/:id",
  userValidationRules.userId(),
  handleValidationErrors,
  (req: Request, res: Response) => userController.getUserProfile(req, res)
);

// Update user profile (self only)
router.put(
  "/:id",
  authenticate,
  requireSelfOnly(),
  userValidationRules.userId(),
  validateUserProfileUpdate,
  handleValidationErrors,
  (req: Request, res: Response) => userController.updateUserProfile(req, res)
);

// Update user password (self only)
router.put(
  "/:id/password",
  authenticate,
  requireSelfOnly(),
  userValidationRules.userId(),
  validateUserPasswordChange,
  handleValidationErrors,
  (req: Request, res: Response) => userController.updateUserPassword(req, res)
);

// Delete user (admin only)
router.delete(
  "/:id",
  authenticate,
  requireAdmin,
  userValidationRules.userId(),
  handleValidationErrors,
  (req: Request, res: Response) => userController.deleteUser(req, res)
);

// Follow user (self only)
router.post(
  "/:id/following",
  authenticate,
  requireSelfOnly(),
  userValidationRules.userId(),
  validateFollowUserId.followedUserId(),
  handleValidationErrors,
  (req: Request, res: Response) => userController.followUser(req, res)
);

// Unfollow user (self only)
router.delete(
  "/:id/following",
  authenticate,
  requireSelfOnly(),
  userValidationRules.userId(),
  validateFollowUserId.followedUserId(),
  handleValidationErrors,
  (req: Request, res: Response) => userController.unfollowUser(req, res)
);

export default router;
