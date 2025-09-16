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
  // requireSelfOnly, // removed
} from "../middleware/auth";

const router = Router();
const userController = new UserController();

router.get(
  "/",
  validatePaginationQuery,
  handleValidationErrors,
  userController.getAllUsers
);

router.get("/me", authenticate, userController.getCurrentUser);

router.get(
  "/:id",
  validateParamId,
  handleValidationErrors,
  userController.getUserProfile
);

// Update user profile (self via /me)
router.put(
  "/me",
  authenticate,
  validateUserProfileUpdate,
  handleValidationErrors,
  userController.updateUserProfile
);

// Update user password (self via /me)
router.put(
  "/me/password",
  authenticate,
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

// Follow user (self via /me)
router.post(
  "/me/following",
  authenticate,
  validateFollowUserId.followedUserId(),
  handleValidationErrors,
  userController.followUser
);

// Unfollow user (self via /me)
router.delete(
  "/me/following",
  authenticate,
  validateFollowUserId.followedUserId(),
  handleValidationErrors,
  userController.unfollowUser
);

// Read-only follow lists remain by user id
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
