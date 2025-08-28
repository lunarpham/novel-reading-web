import prisma from "../../config/prismaClient";
import { User } from "@prisma/client";
import { UserUpdateData, UserPublicProfile } from "../../interfaces/user";
import { PaginationParams, PaginatedResponse } from "../../interfaces/_index";
import { AppError } from "../../middleware/error";
import { filterAllowedFields } from "../../utils/filter";

export class UserProfileService {
  async getUserById(id: number): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id, deletedAt: null },
    });

    if (!user) {
      throw new AppError(404, "User not found");
    }

    return user;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email, deletedAt: null },
    });

    return user || null;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { username, deletedAt: null },
    });

    return user || null;
  }

  async updateProfile(
    id: number,
    data: UserUpdateData
  ): Promise<UserPublicProfile> {
    const existingUser = await prisma.user.findUnique({
      where: { id, deletedAt: null },
    });

    if (!existingUser) {
      throw new AppError(404, "User not found");
    }

    const allowedFields: (keyof UserUpdateData)[] = [
      "email",
      "displayName",
      "bio",
      "dateOfBirth",
      "avatarUrl",
      "gender",
    ];

    const filteredData = filterAllowedFields<UserUpdateData>(
      data,
      allowedFields
    );

    if (Object.keys(filteredData).length === 0) {
      throw new AppError(400, "No valid fields provided for update");
    }

    // Check if email is being updated and if it already exists
    if (filteredData.email && filteredData.email !== existingUser.email) {
      const existingEmailUser = await this.getUserByEmail(filteredData.email);
      if (existingEmailUser && existingEmailUser.id !== id) {
        throw new AppError(409, "User with this email already exists");
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: filteredData,
    });

    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  async getAllUsers(
    params: PaginationParams
  ): Promise<PaginatedResponse<UserPublicProfile>> {
    const { page = 1, limit = 10 } = params;
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

    return {
      data: users as UserPublicProfile[],
      pagination: {
        currentPage: page,
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  async deleteUser(id: number): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id, deletedAt: null },
    });

    if (!user) {
      throw new AppError(404, "User not found");
    }

    await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async getUserRole(id: number): Promise<string | null> {
    const user = await prisma.user.findUnique({
      where: { id, deletedAt: null },
      select: { role: true },
    });

    if (!user) {
      throw new AppError(404, "User not found");
    }

    return user.role;
  }
}
