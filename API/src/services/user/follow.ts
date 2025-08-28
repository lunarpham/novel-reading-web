import prisma from "../../config/prismaClient";
import { FollowData } from "../../interfaces/user";
import { PaginationParams, PaginatedResponse } from "../../interfaces/_index";
import { AppError } from "../../middleware/error";

export class FollowService {
  async followUser(
    followingUserId: number,
    followedUserId: number
  ): Promise<FollowData> {
    if (followingUserId === followedUserId) {
      throw new AppError(400, "You cannot follow yourself");
    }

    const [followingUser, followedUser] = await Promise.all([
      prisma.user.findUnique({
        where: { id: followingUserId, deletedAt: null },
      }),
      prisma.user.findUnique({
        where: { id: followedUserId, deletedAt: null },
      }),
    ]);

    if (!followingUser) {
      throw new AppError(404, "Following user not found");
    }

    if (!followedUser) {
      throw new AppError(404, "User to follow not found");
    }

    try {
      await prisma.follow.create({ data: { followingUserId, followedUserId } });
    } catch (error: any) {
      if (error.code === "P2002") {
        // Prisma unique constraint violation
        throw new AppError(400, "You are already following this user");
      }
      throw error;
    }

    return {
      followingUserId,
      followedUserId,
      followedUser: {
        id: followedUser.id,
        username: followedUser.username,
        displayName: followedUser.displayName,
        avatarUrl: followedUser.avatarUrl,
      },
    };
  }

  async unfollowUser(
    followingUserId: number,
    followedUserId: number
  ): Promise<FollowData> {
    if (followingUserId === followedUserId) {
      throw new AppError(400, "You cannot unfollow yourself");
    }

    const [followingUser, followedUser] = await Promise.all([
      prisma.user.findUnique({
        where: { id: followingUserId, deletedAt: null },
      }),
      prisma.user.findUnique({
        where: { id: followedUserId, deletedAt: null },
      }),
    ]);

    if (!followingUser) {
      throw new AppError(404, "Following user not found");
    }

    if (!followedUser) {
      throw new AppError(404, "User to unfollow not found");
    }

    const deleted = await prisma.follow.deleteMany({
      where: {
        followingUserId,
        followedUserId,
      },
    });

    if (deleted.count === 0) {
      throw new AppError(400, "You are not following this user");
    }

    return {
      followingUserId,
      followedUserId,
      followedUser: {
        id: followedUser.id,
        username: followedUser.username,
        displayName: followedUser.displayName,
        avatarUrl: followedUser.avatarUrl,
      },
    };
  }

  async isUserFollowing(
    followingUserId: number,
    followedUserId: number
  ): Promise<boolean> {
    const follow = await prisma.follow.findUnique({
      where: {
        followingUserId_followedUserId: {
          followingUserId,
          followedUserId,
        },
      },
    });

    return !!follow;
  }

  async getFollowingUsers(
    userId: number,
    params: PaginationParams = { page: 1, limit: 10 }
  ): Promise<PaginatedResponse<FollowData>> {
    const { page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
    });

    if (!user) {
      throw new AppError(404, "User not found");
    }

    const [follows, total] = await Promise.all([
      prisma.follow.findMany({
        where: { followingUserId: userId },
        skip,
        take: limit,
        include: {
          followedUser: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.follow.count({
        where: { followingUserId: userId },
      }),
    ]);

    const followData: FollowData[] = follows.map((follow) => ({
      followingUserId: follow.followingUserId,
      followedUserId: follow.followedUserId,
      followedUser: {
        id: follow.followedUser.id,
        username: follow.followedUser.username,
        displayName: follow.followedUser.displayName,
        avatarUrl: follow.followedUser.avatarUrl,
      },
    }));

    return {
      data: followData,
      pagination: {
        currentPage: page,
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  async getFollowers(
    userId: number,
    params: PaginationParams = { page: 1, limit: 10 }
  ): Promise<PaginatedResponse<FollowData>> {
    const { page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
    });

    if (!user) {
      throw new AppError(404, "User not found");
    }

    const [follows, total] = await Promise.all([
      prisma.follow.findMany({
        where: { followedUserId: userId },
        skip,
        take: limit,
        include: {
          followingUser: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.follow.count({
        where: { followedUserId: userId },
      }),
    ]);

    const followData: FollowData[] = follows.map((follow) => ({
      followingUserId: follow.followingUserId,
      followedUserId: follow.followedUserId,
      followedUser: {
        id: follow.followingUser.id,
        username: follow.followingUser.username,
        displayName: follow.followingUser.displayName,
        avatarUrl: follow.followingUser.avatarUrl,
      },
    }));

    return {
      data: followData,
      pagination: {
        currentPage: page,
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }
}
