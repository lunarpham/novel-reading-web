import { Status, Tag, Story } from "@prisma/client";
import {
  PaginationParams,
  PaginatedResponse,
  UserReference,
  CountStats,
} from "./_index";

export interface StorySearchParams extends PaginationParams {
  title?: string;
  authorId?: number;
  status?: Status;
  sortBy?: "publishedAt" | "title" | "updatedAt";
  sortOrder?: "asc" | "desc";
  keyword?: string;
  includeTags?: string[];
  excludeTags?: string[];
  includeTagLogic?: "and" | "or";
  excludeTagLogic?: "and" | "or";
}

// Base interface using Prisma Story but excluding internal fields
export interface StoryBase extends Omit<Story, "authorId" | "deletedAt"> {
  author: UserReference;
  _count: CountStats;
  averageRating?: number;
}

export interface StoryListItem extends StoryBase {}

export interface StoryDetail extends StoryBase {
  chapters?: {
    id: number;
    title: string;
    chapterNumber: number;
    publishedAt: Date | null;
  }[];
}

export interface StoryCreationData
  extends Pick<
    Story,
    | "title"
    | "description"
    | "authorId"
    | "cover"
    | "tags"
    | "status"
    | "wordCount"
    | "publishedAt"
  > {}

export interface StoryUpdateData extends Partial<StoryCreationData> {
  id: number;
}

export type PaginatedStoryResponse = PaginatedResponse<StoryListItem>;
