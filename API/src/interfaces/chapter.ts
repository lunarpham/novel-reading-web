import { Chapter } from "@prisma/client";

export interface ChapterBasic extends Omit<Chapter, "content" | "deletedAt"> {}

export interface ChapterDetail extends ChapterBasic {
  content: string;
  author: {
    id: number;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
  story: {
    id: number;
    title: string;
  };
}

export interface ChapterSearchParams {
  page?: number;
  limit?: number;
  storyId?: number;
  authorId?: number;
  sortBy?: string;
  sortOrder?: string;
}

export interface ChapterCreationData {
  title: string;
  content: string;
  storyId: number;
  sortIndex: number;
  wordCount?: number;
}

export interface ChapterUpdateData {
  title?: string;
  content?: string;
  sortIndex?: number;
  wordCount?: number;
}
