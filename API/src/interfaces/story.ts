import { Status, Tag, Story } from "@prisma/client";
import {
  PaginationParams,
  PaginatedResponse,
  UserReference,
  CountStats,
} from "./_index";
import e from "express";

export interface StorySearchParams extends PaginationParams {
  title?: string;
  authorId?: number;
  status?: Status;
  sortBy?: "publishedAt" | "title" | "updatedAt";
  sortOrder?: "asc" | "desc";
  keyword?: string;
  tagMode?: "include" | "exclude";
  tagLogic?: "and" | "or";
  includeTags?: string[];
  excludeTags?: string[];
  includeTagLogic?: "and" | "or";
  excludeTagLogic?: "and" | "or";
}

export interface StoryListItem {
  id: number;
  title: string;
  description: string | null;
  cover: string | null;
  tags: Tag[];
  status: Status;
  wordCount: number;
  publishedAt: Date | null;
  createdAt: Date;
  author: UserReference;
  _count: CountStats;
  averageRating?: number;
}

export interface StoryDetail extends StoryListItem {
  updatedAt: Date;
  chapters?: {
    id: number;
    title: string;
    chapterNumber: number;
    publishedAt: Date | null;
  }[];
}

export interface StoryCreationData {
  title: string;
  description: string | null;
  authorId: number;
  cover: string | null;
  tags: Tag[];
  status: Status;
  wordCount: number;
  publishedAt: Date | null;
}

export interface StoryUpdateData extends Partial<StoryCreationData> {
  id: number;
}

export type PaginatedStoryResponse = PaginatedResponse<StoryListItem>;
