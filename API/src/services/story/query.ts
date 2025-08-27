import prisma from "../../config/prismaClient";
import { Story } from "@prisma/client";
import { StorySearchParams } from "../../interfaces/story";
import { PaginatedResponse } from "../../interfaces/_index";

export class StoryQueryService {
  async getStoryById(id: number): Promise<Story | null> {
    const story = await prisma.story.findUnique({
      where: { id, deletedAt: null },
    });

    if (!story) {
      return null;
    }
    return story;
  }

  async getAllStories(
    params: StorySearchParams
  ): Promise<PaginatedResponse<Story>> {
    const {
      page = 1,
      limit = 10,
      title,
      status,
      sortBy = "title",
      sortOrder = "desc",
      keyword,
      includeTags,
      excludeTags,
      includeTagLogic = "or",
      excludeTagLogic = "or",
    } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null,
    };

    if (keyword) {
      where.OR = [
        { title: { contains: keyword, mode: "insensitive" } },
        { content: { contains: keyword, mode: "insensitive" } },
      ];
    }

    if (title && !keyword) {
      where.title = { contains: title, mode: "insensitive" };
    }

    if (status) {
      where.status = status;
    }

    if (includeTags || excludeTags) {
      this.buildTagFilters(where, {
        includeTags,
        excludeTags,
        includeTagLogic,
        excludeTagLogic,
      });
    }

    const orderBy = this.buildOrderBy(sortBy, sortOrder);

    const [totalCount, stories] = await Promise.all([
      prisma.story.count({ where }),
      prisma.story.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
      }),
    ]);

    return {
      data: stories as Story[],
      pagination: {
        currentPage: page,
        totalItems: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1,
      },
    };
  }

  private buildTagFilters(
    where: any,
    tagOptions: {
      includeTags?: string[];
      excludeTags?: string[];
      includeTagLogic: string;
      excludeTagLogic: string;
    }
  ) {
    const { includeTags, excludeTags, includeTagLogic, excludeTagLogic } =
      tagOptions;
    const tagConditions: any[] = [];

    // Handle include tags
    if (includeTags && includeTags.length > 0) {
      if (includeTagLogic === "and") {
        tagConditions.push({
          tags: {
            hasEvery: includeTags,
          },
        });
      } else {
        tagConditions.push({
          tags: {
            hasSome: includeTags,
          },
        });
      }
    }

    // Handle exclude tags
    if (excludeTags && excludeTags.length > 0) {
      if (excludeTagLogic === "and") {
        // All exclude tags must be absent (AND logic for exclusion)
        tagConditions.push({
          NOT: {
            tags: {
              hasSome: excludeTags,
            },
          },
        });
      } else {
        // Any exclude tag must be absent (OR logic for exclusion)
        excludeTags.forEach((tag) => {
          tagConditions.push({
            tags: {
              NOT: {
                has: tag,
              },
            },
          });
        });
      }
    }

    if (tagConditions.length > 0) {
      if (where.AND) {
        where.AND.push(...tagConditions);
      } else {
        where.AND = tagConditions;
      }
    }
  }

  private buildOrderBy(sortBy: string, sortOrder: string) {
    const order: "asc" | "desc" = sortOrder === "asc" ? "asc" : "desc";
    switch (sortBy) {
      case "title":
        return { title: order };
      case "createdAt":
        return { createdAt: order };
      case "updatedAt":
        return { updatedAt: order };
      default:
        return { title: "asc" as const };
    }
  }
}
