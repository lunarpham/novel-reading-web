import prisma from "../../config/prismaClient";
import { AppError } from "../../middleware/error";
import {
  ChapterCreationData,
  ChapterDetail,
  ChapterUpdateData,
} from "../../interfaces/chapter";
import { calculateWordCount } from "../../utils/wordcount";

export class ChapterUploadService {
  async createChapter(
    data: ChapterCreationData,
    authorId: number
  ): Promise<ChapterDetail> {
    const { title, content, storyId, sortIndex } = data;

    const story = await prisma.story.findUnique({
      where: {
        id: storyId,
        deletedAt: null,
      },
    });

    if (!story) {
      throw new AppError(404, "Story not found");
    }

    if (story.authorId !== authorId) {
      throw new AppError(
        403,
        "Forbidden: You are not the author of this story"
      );
    }

    const existingChapter = await prisma.chapter.findFirst({
      where: {
        storyId,
        sortIndex,
        deletedAt: null,
      },
    });

    if (existingChapter) {
      throw new AppError(
        400,
        `Chapter with sort index ${sortIndex} already exists for this story`
      );
    }

    const calculatedWordCount = calculateWordCount(content);

    const chapter = await prisma.chapter.create({
      data: {
        title,
        content,
        storyId,
        authorId,
        sortIndex,
        wordCount: calculatedWordCount,
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
        story: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return chapter as ChapterDetail;
  }

  async updateChapter(
    chapterId: number,
    data: ChapterUpdateData,
    authorId: number
  ): Promise<ChapterDetail> {
    return await prisma.$transaction(async (prisma) => {
      const user = await prisma.user.findUnique({
        where: { id: authorId, deletedAt: null },
      });

      if (!user) {
        throw new AppError(404, "User not found");
      }

      const existingChapter = await prisma.chapter.findUnique({
        where: { id: chapterId, deletedAt: null },
        include: { story: true },
      });

      if (!existingChapter) {
        throw new AppError(404, "Chapter not found");
      }

      if (existingChapter.authorId !== authorId) {
        throw new AppError(
          403,
          "Forbidden: You are not the author of this chapter"
        );
      }

      if (data.sortIndex && data.sortIndex !== existingChapter.sortIndex) {
        const chapterWithSameIndex = await prisma.chapter.findFirst({
          where: {
            storyId: existingChapter.storyId,
            sortIndex: data.sortIndex,
            deletedAt: null,
            id: { not: chapterId },
          },
        });

        if (chapterWithSameIndex) {
          throw new AppError(
            400,
            `Chapter with sort index ${data.sortIndex} already exists for this story`
          );
        }
      }

      const updatedData: ChapterUpdateData = { ...data };
      if (data.content) {
        updatedData.wordCount = calculateWordCount(data.content);
      }

      const updatedChapter = await prisma.chapter.update({
        where: { id: chapterId },
        data: updatedData,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
          story: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      });

      return updatedChapter as ChapterDetail;
    });
  }

  async deleteChapter(chapterId: number, authorId: number): Promise<void> {
    return await prisma.$transaction(async (prisma) => {
      const existingChapter = await prisma.chapter.findUnique({
        where: { id: chapterId, deletedAt: null },
      });

      if (!existingChapter) {
        throw new AppError(404, "Chapter not found");
      }

      if (existingChapter.authorId !== authorId) {
        throw new AppError(
          403,
          "Forbidden: You are not the author of this chapter"
        );
      }

      await prisma.chapter.update({
        where: { id: chapterId },
        data: { deletedAt: new Date() },
      });
    });
  }

  private updateWordCount(content: string): number {
    return calculateWordCount(content);
  }
}
