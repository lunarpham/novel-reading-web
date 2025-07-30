import prisma from "../prisma-client";
import { User } from "@prisma/client";
import { hashPassword } from "../lib/utils/bcrypt";

export class UserService {
  async createUser(data: Omit<User, "id">): Promise<User> {
    const hashedPassword = await hashPassword(data.password);
    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });
    return user;
  }

  async getAllUsers(
    page: number = 1,
    limit: number = 10
  ): Promise<{ users: Partial<User>[]; total: number }> {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: { deletedAt: null },
        skip,
        take: limit,
        orderBy: { id: "asc" },
        select: {
          id: true,
          email: true,
          username: true,
          displayName: true,
          bio: true,
          avatarUrl: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.user.count({
        where: { deletedAt: null },
      }),
    ]);

    return { users, total };
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email, deletedAt: null },
    });
  }
  async getUserByUsername(username: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { username, deletedAt: null },
    });
  }

  async getUserById(id: number): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id, deletedAt: null },
    });
  }

  async getUserRole(id: number): Promise<string | null> {
    const user = await prisma.user.findUnique({
      where: { id, deletedAt: null },
      select: { role: true },
    });
    return user?.role || null;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async followUser(
    followingUserId: number,
    followedUserId: number
  ): Promise<void> {
    await prisma.follow.create({
      data: {
        followingUserId,
        followedUserId,
      },
    });
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

  async unfollowUser(
    followingUserId: number,
    followedUserId: number
  ): Promise<void> {
    await prisma.follow.delete({
      where: {
        followingUserId_followedUserId: {
          followingUserId,
          followedUserId,
        },
      },
    });
  }
}
