import { UserService } from "../services/user.service";
import { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import "../types";
import { comparePassword, hashPassword } from "../lib/utils/bcrypt";

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  // Get all users with pagination
  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const { users, total } = await this.userService.getAllUsers(page, limit);

      res.status(200).json({
        success: true,
        data: {
          users,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalUsers: total,
            hasNext: page * limit < total,
            hasPrev: page > 1,
          },
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get user profile by ID
  async getUserProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = Number(req.params.id);
      const user = await this.userService.getUserById(userId);

      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      // Remove sensitive data before sending response
      const { password, ...userWithoutPassword } = user;

      res.status(200).json({
        success: true,
        data: userWithoutPassword,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Update user profile
  async updateUserProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = Number(req.params.id);

      const existingUser = await this.userService.getUserById(userId);
      if (!existingUser) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      // Validate that the user is not trying to update restricted fields
      const updatedData = req.body;
      const {
        password,
        id,
        role,
        isRestricted,
        createdAt,
        updatedAt,
        ...allowedUpdates
      } = updatedData;

      // Check if email already exists
      if (allowedUpdates.email && allowedUpdates.email !== existingUser.email) {
        const existingEmailUser = await this.userService.getUserByEmail(
          allowedUpdates.email
        );
        if (existingEmailUser && existingEmailUser.id !== userId) {
          res.status(409).json({
            success: false,
            message: "User with this email already exists",
          });
          return;
        }
      }

      const updatedUser = await this.userService.updateUser(
        userId,
        allowedUpdates
      );

      // Remove sensitive data before sending response
      const { password: _, ...userWithoutPassword } = updatedUser;
      res.status(200).json({
        success: true,
        message: "User profile updated successfully",
        data: userWithoutPassword,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  async updateUserPassword(req: Request, res: Response): Promise<void> {
    try {
      const userId = Number(req.params.id);
      const { password, newPassword } = req.body;

      const user = await this.userService.getUserById(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      const isPasswordValid = await comparePassword(password, user.password);

      if (!isPasswordValid) {
        res.status(400).json({
          success: false,
          message: "Current password is incorrect",
        });
        return;
      }

      try {
        const hashedPassword = await hashPassword(newPassword);
        const updatedUser = await this.userService.updateUser(userId, {
          password: hashedPassword,
        });

        // Remove sensitive data before sending response
        const { password: _, ...userWithoutPassword } = updatedUser;
        res.status(200).json({
          success: true,
          message: "Password updated successfully",
          data: userWithoutPassword,
        });
      } catch (hashError) {
        res.status(500).json({
          success: false,
          message: "Error hashing new password",
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Delete user account - Admin only (handled by middleware)
  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = Number(req.params.id);

      const user = await this.userService.getUserById(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      await this.userService.updateUser(userId, {
        deletedAt: new Date(),
      });

      res.status(200).json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  async followUser(req: Request, res: Response): Promise<void> {
    try {
      // Get the user IDs from the request parameters and body
      const followingUserId = Number(req.params.id);
      const followedUserId = Number(req.body.followedUserId);

      // Validate followedUserId
      if (!followedUserId || isNaN(followedUserId)) {
        res.status(400).json({
          success: false,
          message: "Invalid followed user ID",
        });
        return;
      }

      // Check if both users exist
      const followingUser = await this.userService.getUserById(followingUserId);
      const followedUser = await this.userService.getUserById(followedUserId);

      if (!followingUser || !followedUser) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      // Prevent self-following
      if (followingUserId === followedUserId) {
        res.status(400).json({
          success: false,
          message: "You cannot follow yourself",
        });
        return;
      }

      // Check if the user is already following the followed user
      const isFollowing = await this.userService.isUserFollowing(
        followingUserId,
        followedUserId
      );

      // If already following, return an error
      if (isFollowing) {
        res.status(400).json({
          success: false,
          message: "You are already following this user",
        });
        return;
      }

      // Proceed to follow the user
      await this.userService.followUser(followingUserId, followedUserId);

      res.status(201).json({
        success: true,
        message: "Successfully followed user",
        data: {
          followingUserId,
          followedUserId,
          followedUser: {
            id: followedUser.id,
            username: followedUser.username,
            displayName: followedUser.displayName,
            avatarUrl: followedUser.avatarUrl,
          },
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  async unfollowUser(req: Request, res: Response): Promise<void> {
    try {
      const followingUserId = Number(req.params.id);
      const followedUserId = Number(req.body.followedUserId);

      if (!followedUserId || isNaN(followedUserId)) {
        res.status(400).json({
          success: false,
          message: "Invalid followed user ID",
        });
        return;
      }

      const followingUser = await this.userService.getUserById(followingUserId);
      const followedUser = await this.userService.getUserById(followedUserId);

      if (!followingUser || !followedUser) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      if (followingUserId === followedUserId) {
        res.status(400).json({
          success: false,
          message: "You cannot unfollow yourself",
        });
        return;
      }

      const isFollowing = await this.userService.isUserFollowing(
        followingUserId,
        followedUserId
      );

      if (!isFollowing) {
        res.status(400).json({
          success: false,
          message: "You are not following this user",
        });
        return;
      }

      await this.userService.unfollowUser(followingUserId, followedUserId);

      res.status(200).json({
        success: true,
        message: "Successfully unfollowed user",
        data: {
          followingUserId,
          followedUserId,
          unfollowedUser: {
            id: followedUser.id,
            username: followedUser.username,
            displayName: followedUser.displayName,
            avatarUrl: followedUser.avatarUrl,
          },
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}
