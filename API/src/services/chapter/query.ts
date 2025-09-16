import prisma from "../../config/prismaClient";
import { PaginatedResponse } from "../../interfaces/_index";
import {
  ChapterBasic,
  ChapterDetail,
  ChapterSearchParams,
} from "../../interfaces/chapter";
import { AppError } from "../../middleware/error";

export class ChapterQueryService {
  async getChapterById(
    id: number,
    showContent: boolean
  ): Promise<ChapterDetail | null> {
    const chapter = await prisma.chapter.findUnique({
      where: { id, deletedAt: null },
      select: {
        id: true,
        sortIndex: true,
        title: true,
        wordCount: true,
        createdAt: true,
        storyId: true,
        authorId: true,
        updatedAt: true,
        content: showContent ? true : false,
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        story: { select: { id: true, title: true } },
      },
    });

    if (!chapter) {
      return null;
    }

    return chapter as ChapterDetail;
  }

  async getAllChapters(
    params: ChapterSearchParams = {}
  ): Promise<PaginatedResponse<ChapterBasic>> {
    const {
      page = 1,
      limit = 10,
      storyId,
      authorId,
      sortBy = "sortIndex",
      sortOrder = "desc",
    } = params;

    if (storyId && authorId) {
      throw new AppError(
        400,
        "Cannot filter by both storyId and authorId simultaneously"
      );
    }

    const skip = (page - 1) * limit;
    const where: any = { deletedAt: null };

    if (storyId) {
      where.storyId = storyId;
    } else if (authorId) {
      where.authorId = authorId;
    }

    const orderBy = this.buildOrderBy(sortBy, sortOrder);

    const [totalItems, chapters] = await Promise.all([
      prisma.chapter.count({ where }),
      prisma.chapter.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          sortIndex: true,
          title: true,
          wordCount: true,
          createdAt: true,
          updatedAt: true,
          storyId: true,
          authorId: true,
          story: { select: { id: true, title: true } },
        },
      }),
    ]);

    return {
      data: chapters as ChapterBasic[],
      pagination: {
        currentPage: page,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        hasNext: page < Math.ceil(totalItems / limit),
        hasPrev: page > 1,
      },
    };
  }

  private buildOrderBy(sortBy: string, sortOrder: string) {
    const order: "asc" | "desc" = sortOrder === "asc" ? "asc" : "desc";
    switch (sortBy) {
      case "sortIndex":
        return { sortIndex: order };
      case "createdAt":
        return { createdAt: order };
      case "updatedAt":
        return { updatedAt: order };
      default:
        return { sortIndex: "desc" as const };
    }
  }
}
