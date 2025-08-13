import { Status, Tag, Story, User, Chapter } from "@prisma/client";

export interface StoryCreateData {
  title: string;
  description?: string;
  cover?: string;
  tags?: Tag[];
  status?: Status;
}

export interface StoryUpdateData {
  title?: string;
  description?: string;
  cover?: string;
  tags?: Tag[];
  status?: Status;
}

export interface StoryPublicProfile extends Omit<Story, "deletedAt"> {
  author: {
    id: number;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
  _count?: {
    chapters: number;
    comments: number;
    votes: number;
    libraries: number;
  };
  averageRating?: number;
}

export interface StoryWithDetails extends StoryPublicProfile {
  chapters: Chapter[];
  recentComments?: {
    id: number;
    content: string;
    createdAt: Date;
    user: {
      id: number;
      username: string;
      displayName: string | null;
      avatarUrl: string | null;
    };
  }[];
}

export interface StorySearchParams {
  title?: string;
  authorId?: number;
  status?: Status;
  tags?: Tag[];
  sortBy?: "createdAt" | "publishedAt" | "wordCount" | "title";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
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
  author: Omit<User, "password" | "deletedAt">;
  _count: {
    chapters: number;
    votes: number;
  };
  averageRating?: number;
}

export interface PaginatedStoryResponse {
  data: StoryListItem[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
