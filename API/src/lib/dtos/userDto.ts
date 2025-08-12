import { User, Role, Gender } from "@prisma/client";

export interface UserCreateData {
  email: string;
  username: string;
  displayName: string;
  password: string;
  role?: Role;
  bio?: string;
  dateOfBirth?: Date;
  avatarUrl?: string;
  gender?: Gender;
}

export interface UserUpdateData {
  email?: string;
  displayName?: string;
  bio?: string;
  dateOfBirth?: Date;
  avatarUrl?: string;
  gender?: Gender;
}

export interface UserPublicProfile extends Omit<User, "password"> {}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Add the missing FollowData interface
export interface FollowData {
  followingUserId: number;
  followedUserId: number;
  followedUser: {
    id: number;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
}

// You might also want to add these for completeness
export interface FollowUser {
  followedUserId: number;
}

export interface UserWithoutPassword extends Omit<User, "password"> {}
