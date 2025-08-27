import prisma from "../../config/prismaClient";
import { Story } from "@prisma/client";
import { StoryCreationData, StoryUpdateData } from "../../interfaces/story";
import { AppError } from "../../middleware/error";

export class StoryMutationService {
  async createStory(data: StoryCreationData, authorId: number): Promise<Story> {
    if (!authorId || typeof authorId !== "number") {
      throw new AppError(401, "Unauthorized: User not found");
    }
    return await prisma.$transaction(async (prisma) => {
      const user = await prisma.user.findUnique({
        where: { id: authorId, deletedAt: null },
      });

      if (!user) {
        throw new AppError(404, "User not found");
      }

      const { authorId: _, ...storyData } = data;

      return prisma.story.create({
        data: {
          ...storyData,
          authorId: user.id,
        },
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
      });
    });
  }

  async updateStory(
    storyId: number,
    data: StoryUpdateData,
    authorId: number
  ): Promise<Story> {
    return await prisma.$transaction(async (prisma) => {
      const user = await prisma.user.findUnique({
        where: { id: authorId, deletedAt: null },
      });

      if (!user) {
        throw new AppError(404, "User not found");
      }

      const existingStory = await prisma.story.findUnique({
        where: {
          id: storyId,
          deletedAt: null,
        },
      });

      if (!existingStory) {
        throw new AppError(404, "Story not found");
      }

      if (existingStory.authorId !== authorId) {
        throw new AppError(
          403,
          "Forbidden: You are not the author of this story"
        );
      }

      const { authorId: _, ...storyData } = data;

      return prisma.story.update({
        where: { id: storyId },
        data: {
          ...storyData,
          authorId: user.id,
        },
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
      });
    });
  }

  async deleteStory(storyId: number, authorId: number): Promise<Story> {
    return await prisma.$transaction(async (prisma) => {
      const user = await prisma.user.findUnique({
        where: { id: authorId, deletedAt: null },
      });

      if (!user) {
        throw new AppError(404, "User not found");
      }

      const existingStory = await prisma.story.findUnique({
        where: {
          id: storyId,
          deletedAt: null,
        },
      });

      if (!existingStory) {
        throw new AppError(404, "Story not found");
      }

      if (existingStory.authorId !== authorId) {
        throw new AppError(
          403,
          "Forbidden: You are not the author of this story"
        );
      }

      return prisma.story.update({
        where: { id: storyId },
        data: { deletedAt: new Date() },
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
      });
    });
  }
}
