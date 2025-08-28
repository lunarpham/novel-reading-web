import { Router, Request, Response } from "express";
import { UserController } from "../controllers/userController";
import {
  validateUserProfileUpdate,
  validateFollowUserId,
  validateUserPasswordChange,
} from "../validators/user";
import {
  handleValidationErrors,
  validatePaginationQuery,
  validateParamId,
} from "../validators/_index";
import {
  authenticate,
  requireAdmin,
  requireSelfOnly,
} from "../middleware/auth";

const router = Router();
const userController = new UserController();

router.get(
  "/",
  validatePaginationQuery,
  handleValidationErrors,
  userController.getAllUsers
);

// Get user profile (public)
router.get(
  "/:id",
  validateParamId,
  handleValidationErrors,
  userController.getUserProfile
);

// Update user profile (self only)
router.put(
  "/:id",
  authenticate,
  requireSelfOnly(),
  validateParamId,
  validateUserProfileUpdate,
  handleValidationErrors,
  userController.updateUserProfile
);

// Update user password (self only)
router.put(
  "/:id/password",
  authenticate,
  requireSelfOnly(),
  validateParamId,
  validateUserPasswordChange,
  handleValidationErrors,
  userController.updateUserPassword
);

// Delete user (admin only)
router.delete(
  "/:id",
  authenticate,
  requireAdmin,
  validateParamId,
  handleValidationErrors,
  userController.deleteUser
);

// Follow user (self only)
router.post(
  "/:id/following",
  authenticate,
  requireSelfOnly(),
  validateParamId,
  validateFollowUserId.followedUserId(),
  handleValidationErrors,
  userController.followUser
);

// Unfollow user (self only)
router.delete(
  "/:id/following",
  authenticate,
  requireSelfOnly(),
  validateParamId,
  validateFollowUserId.followedUserId(),
  handleValidationErrors,
  userController.unfollowUser
);

router.get(
  "/:id/following",
  validateParamId,
  validatePaginationQuery,
  handleValidationErrors,
  userController.getFollowingUsers
);

router.get(
  "/:id/followers",
  validateParamId,
  validatePaginationQuery,
  handleValidationErrors,
  userController.getFollowers
);

export default router;
