// filepath: e:\Documents\NAPA\novel-reading-web\API\src\controllers\user.controller.ts
import { Request, Response } from "express";
import { UserService } from "../services/user/_index";
import { ApiResponse } from "../lib/utils/response";
import { PaginationParams } from "../lib/dtos/userDto";
import { asyncHandler } from "../lib/middleware/error";

export class UserController {
  constructor(private userService = new UserService()) {}

  getAllUsers = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const params: PaginationParams = {
        page: parseInt(req.query.page as string, 10) || 1,
        limit: parseInt(req.query.limit as string, 10) || 10,
      };

      const result = await this.userService.profile.getAllUsers(params);

      const response: ApiResponse = {
        success: true,
        message: "Users retrieved successfully",
        data: result,
      };

      res.status(200).json(response);
    }
  );

  getUserProfile = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userId = Number(req.params.id);
      const userWithoutPassword = await this.userService.profile.getUserById(
        userId
      );

      const response: ApiResponse = {
        success: true,
        message: "User profile retrieved successfully",
        data: userWithoutPassword,
      };

      res.status(200).json(response);
    }
  );

  updateUserProfile = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userId = Number(req.params.id);
      const updateData = req.body;

      const userWithoutPassword = await this.userService.profile.updateProfile(
        userId,
        updateData
      );

      const response: ApiResponse = {
        success: true,
        message: "User profile updated successfully",
        data: userWithoutPassword,
      };

      res.status(200).json(response);
    }
  );

  updateUserPassword = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userId = Number(req.params.id);
      const { password, newPassword } = req.body;

      const userWithoutPassword =
        await this.userService.password.updatePassword(
          userId,
          password,
          newPassword
        );

      const response: ApiResponse = {
        success: true,
        message: "Password updated successfully",
        data: userWithoutPassword,
      };

      res.status(200).json(response);
    }
  );

  followUser = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const followingUserId = Number(req.params.id);
      const { followedUserId } = req.body;

      const result = await this.userService.follow.followUser(
        followingUserId,
        followedUserId
      );

      const response: ApiResponse = {
        success: true,
        message: "Successfully followed user",
        data: result,
      };

      res.status(201).json(response);
    }
  );

  unfollowUser = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const followingUserId = Number(req.params.id);
      const { followedUserId } = req.body;

      const result = await this.userService.follow.unfollowUser(
        followingUserId,
        followedUserId
      );

      const response: ApiResponse = {
        success: true,
        message: "Successfully unfollowed user",
        data: result,
      };

      res.status(200).json(response);
    }
  );

  deleteUser = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userId = Number(req.params.id);
      await this.userService.profile.deleteUser(userId);

      const response: ApiResponse = {
        success: true,
        message: "User deleted successfully",
      };

      res.status(200).json(response);
    }
  );

  getFollowingUsers = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userId = Number(req.params.id);
      const params: PaginationParams = {
        page: parseInt(req.query.page as string, 10) || 1,
        limit: parseInt(req.query.limit as string, 10) || 10,
      };

      const result = await this.userService.follow.getFollowingUsers(
        userId,
        params
      );

      const response: ApiResponse = {
        success: true,
        message: "Following users retrieved successfully",
        data: result,
      };

      res.status(200).json(response);
    }
  );

  getFollowers = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userId = Number(req.params.id);
      const params: PaginationParams = {
        page: parseInt(req.query.page as string, 10) || 1,
        limit: parseInt(req.query.limit as string, 10) || 10,
      };

      const result = await this.userService.follow.getFollowers(userId, params);

      const response: ApiResponse = {
        success: true,
        message: "Followers retrieved successfully",
        data: result,
      };

      res.status(200).json(response);
    }
  );
}
