import { Request, Response } from "express";
import { StoryService } from "../services/story/_index";
import { ApiResponse, PaginationParams } from "../interfaces/_index";
import {
  StoryCreationData,
  StorySearchParams,
  StoryUpdateData,
} from "../interfaces/story";
import { AppError, asyncHandler } from "../middleware/error";
import { Status } from "@prisma/client";

export class StoryController {
  constructor(private storyService = new StoryService()) {}

  getAllStories = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      // Handle array parameters for tags (multiple query params with same name)
      const includeTags = req.query.includeTags
        ? Array.isArray(req.query.includeTags)
          ? (req.query.includeTags as string[])
          : [req.query.includeTags as string]
        : undefined;

      const excludeTags = req.query.excludeTags
        ? Array.isArray(req.query.excludeTags)
          ? (req.query.excludeTags as string[])
          : [req.query.excludeTags as string]
        : undefined;

      const searchParams: StorySearchParams = {
        page: parseInt(req.query.page as string, 10) || 1,
        limit: parseInt(req.query.limit as string, 10) || 10,
        title: req.query.title as string,
        keyword: req.query.keyword as string,
        status: req.query.status ? (req.query.status as Status) : undefined,
        includeTags,
        excludeTags,
        includeTagLogic: (req.query.includeTagLogic as "and" | "or") || "or",
        excludeTagLogic: (req.query.excludeTagLogic as "and" | "or") || "or",
        sortBy:
          (req.query.sortBy as "title" | "publishedAt" | "updatedAt") ||
          "title",
        sortOrder: (req.query.sortOrder as "asc" | "desc") || "desc",
      };

      const result = await this.storyService.getAllStories(searchParams);

      const response: ApiResponse = {
        success: true,
        message: "Stories retrieved successfully",
        data: result,
      };

      res.status(200).json(response);
    }
  );

  getStoryById = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const storyId = Number(req.params.id);
      const story = await this.storyService.getStoryById(storyId);

      if (!story) {
        throw new AppError(404, "Story not found");
      }

      const response: ApiResponse = {
        success: true,
        message: "Story retrieved successfully",
        data: story,
      };

      res.status(200).json(response);
    }
  );

  createStory = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      if (!req.user || !req.user.userId) {
        throw new AppError(401, "Unauthorized: User not found");
      }

      const newStory = await this.storyService.createStory(
        req.body,
        req.user.userId
      );

      const response: ApiResponse = {
        success: true,
        message: "Story created successfully",
        data: newStory,
      };

      res.status(201).json(response);
    }
  );

  updateStory = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      if (!req.user || !req.user.userId) {
        throw new AppError(401, "Unauthorized: User not found");
      }

      const storyId = Number(req.params.id);
      const updateData: StoryUpdateData = req.body;

      const updatedStory = await this.storyService.updateStory(
        storyId,
        updateData,
        req.user.userId
      );

      const response: ApiResponse = {
        success: true,
        message: "Story updated successfully",
        data: updatedStory,
      };

      res.status(200).json(response);
    }
  );

  deleteStory = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const storyId = Number(req.params.id);
      const authorId = req.user?.userId;

      if (!authorId) {
        throw new AppError(401, "Unauthorized: User not found");
      }

      const deletedStory = await this.storyService.deleteStory(
        storyId,
        authorId
      );

      const response: ApiResponse = {
        success: true,
        message: "Story deleted successfully",
        data: deletedStory,
      };

      res.status(200).json(response);
    }
  );
}
