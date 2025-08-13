import prisma from "../../config/prismaClient";
import { Story } from "@prisma/client";

export class StorySearchService {
  async getStoryById(id: number): Promise<Story | null> {
    const story = await prisma.story.findUnique({
      where: { id, deletedAt: null },
    });

    if (!story) {
      return null;
    }
    return story;
  }
}
