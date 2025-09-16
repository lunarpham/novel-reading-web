import { Request, Response } from "express";
import { ChapterService } from "../services/chapter/index";
import { ApiResponse, PaginationParams } from "../interfaces/_index";
import {
  ChapterCreationData,
  ChapterSearchParams,
  ChapterUpdateData,
} from "../interfaces/chapter";
import { AppError, asyncHandler } from "../middleware/error";

export class ChapterController {
  constructor(private chapterService = new ChapterService()) {}

  getAllChapters = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const searchParams: ChapterSearchParams = {
        page: parseInt(req.query.page as string, 10) || 1,
        limit: parseInt(req.query.limit as string, 10) || 10,
        storyId: req.query.storyId
          ? parseInt(req.query.storyId as string, 10)
          : undefined,
        authorId: req.query.authorId
          ? parseInt(req.query.authorId as string, 10)
          : undefined,
        sortBy: (req.query.sortBy as string) || "sortIndex",
        sortOrder: (req.query.sortOrder as "asc" | "desc") || "desc",
      };

      const result = await this.chapterService.getAllChapters(searchParams);

      const response: ApiResponse = {
        success: true,
        message: "Chapters retrieved successfully",
        data: result,
      };

      res.status(200).json(response);
    }
  );

  getChapterById = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const chapterId = Number(req.params.id);
      const showContent = req.query.showContent === "true";

      const chapter = await this.chapterService.getChapterById(
        chapterId,
        showContent
      );

      if (!chapter) {
        throw new AppError(404, "Chapter not found");
      }

      const response: ApiResponse = {
        success: true,
        message: "Chapter retrieved successfully",
        data: chapter,
      };

      res.status(200).json(response);
    }
  );

  getChaptersByStoryId = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const storyId = Number(req.params.storyId);

      // Use getAllChapters instead
      const result = await this.chapterService.getAllChapters({
        storyId,
        sortBy: "sortIndex",
        sortOrder: "desc",
        limit: 1000,
      });

      const response: ApiResponse = {
        success: true,
        message: "Story chapters retrieved successfully",
        data: result.data,
      };

      res.status(200).json(response);
    }
  );

  createChapter = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      if (!req.user || !req.user.userId) {
        throw new AppError(401, "Unauthorized");
      }

      const chapterData: ChapterCreationData = req.body;
      const authorId = req.user.userId;

      const newChapter = await this.chapterService.createChapter(
        chapterData,
        authorId
      );

      const response: ApiResponse = {
        success: true,
        message: "Chapter created successfully",
        data: newChapter,
      };

      res.status(201).json(response);
    }
  );

  updateChapter = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      if (!req.user || !req.user.userId) {
        throw new AppError(401, "Unauthorized");
      }

      const chapterId = Number(req.params.id);
      const updateData: ChapterUpdateData = req.body;
      const authorId = req.user.userId;

      const updatedChapter = await this.chapterService.upload.updateChapter(
        chapterId,
        updateData,
        authorId
      );

      const response: ApiResponse = {
        success: true,
        message: "Chapter updated successfully",
        data: updatedChapter,
      };

      res.status(200).json(response);
    }
  );

  deleteChapter = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      if (!req.user || !req.user.userId) {
        throw new AppError(401, "Unauthorized");
      }

      const chapterId = Number(req.params.id);
      const authorId = req.user.userId;

      await this.chapterService.upload.deleteChapter(chapterId, authorId);

      const response: ApiResponse = {
        success: true,
        message: "Chapter deleted successfully",
      };

      res.status(200).json(response);
    }
  );
}
