import { UserService } from "../services/user.service";
import { Request, Response, NextFunction } from "express";
import { User } from "@prisma/client";

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

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

  async followUser(req: Request, res: Response): Promise<void> {
    try {
      const followingUserId = Number(req.params.id);
      const followedUserId = Number(req.body.followedUserId);

      if (!req.user || req.user.userId !== followingUserId) {
        res.status(403).json({
          success: false,
          message: "You can only follow users from your own account",
        });
        return;
      }

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
          message: "You cannot follow yourself",
        });
        return;
      }

      const isFollowing = await this.userService.isUserFollowing(
        followingUserId,
        followedUserId
      );

      if (isFollowing) {
        res.status(400).json({
          success: false,
          message: "You are already following this user",
        });
        return;
      }

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

      if (!req.user || req.user.userId !== followingUserId) {
        res.status(403).json({
          success: false,
          message: "You can only follow users from your own account",
        });
        return;
      }

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
