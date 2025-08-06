import { Router, Request, Response } from "express";
import { UserController } from "../controllers/userController";
import {
  userValidationRules,
  validateUserProfileUpdate,
  handleValidationErrors,
  validateFollowUserId,
  validateUserPasswordChange,
  queryPaginationRules,
} from "../lib/middleware/validator";
import {
  authenticate,
  requireAdmin,
  requireSelfOnly,
} from "../lib/middleware/auth";

const router = Router();
const userController = new UserController();

router.get(
  "/",
  queryPaginationRules.pagination(),
  handleValidationErrors,
  userController.getAllUsers
);

// Get user profile (public)
router.get(
  "/:id",
  userValidationRules.userId(),
  handleValidationErrors,
  userController.getUserProfile
);

// Update user profile (self only)
router.put(
  "/:id",
  authenticate,
  requireSelfOnly(),
  userValidationRules.userId(),
  validateUserProfileUpdate,
  handleValidationErrors,
  userController.updateUserProfile
);

// Update user password (self only)
router.put(
  "/:id/password",
  authenticate,
  requireSelfOnly(),
  userValidationRules.userId(),
  validateUserPasswordChange,
  handleValidationErrors,
  userController.updateUserPassword
);

// Delete user (admin only)
router.delete(
  "/:id",
  authenticate,
  requireAdmin,
  userValidationRules.userId(),
  handleValidationErrors,
  userController.deleteUser
);

// Follow user (self only)
router.post(
  "/:id/following",
  authenticate,
  requireSelfOnly(),
  userValidationRules.userId(),
  validateFollowUserId.followedUserId(),
  handleValidationErrors,
  userController.followUser
);

// Unfollow user (self only)
router.delete(
  "/:id/following",
  authenticate,
  requireSelfOnly(),
  userValidationRules.userId(),
  validateFollowUserId.followedUserId(),
  handleValidationErrors,
  userController.unfollowUser
);

export default router;
