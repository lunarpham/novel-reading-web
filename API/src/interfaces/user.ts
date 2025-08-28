import { User, Role, Gender } from "@prisma/client";
import { PaginationParams, PaginatedResponse, UserReference } from "./_index";

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

export interface FollowData {
  followingUserId: number;
  followedUserId: number;
  followedUser: UserReference;
}

export interface FollowUser {
  followedUserId: number;
}

export interface UserWithoutPassword extends Omit<User, "password"> {}
