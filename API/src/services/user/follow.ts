import prisma from "../../prisma-client";
import { FollowData } from "../../lib/dtos/userDto";
import { AppError } from "../../lib/middleware/error";

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

    const isAlreadyFollowing = await this.isUserFollowing(
      followingUserId,
      followedUserId
    );

    if (isAlreadyFollowing) {
      throw new AppError(400, "You are already following this user");
    }

    await prisma.follow.create({
      data: { followingUserId, followedUserId },
    });

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

    const isFollowing = await this.isUserFollowing(
      followingUserId,
      followedUserId
    );

    if (!isFollowing) {
      throw new AppError(400, "You are not following this user");
    }

    await prisma.follow.delete({
      where: {
        followingUserId_followedUserId: {
          followingUserId,
          followedUserId,
        },
      },
    });

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
}
