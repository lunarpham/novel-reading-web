import prisma from "../../config/prismaClient";
import { User } from "@prisma/client";
import { hashPassword, comparePassword } from "../../lib/utils/bcrypt";
import { AppError } from "../../lib/middleware/error";

export class PasswordService {
  async updatePassword(
    userId: number,
    currentPassword: string,
    newPassword: string
  ): Promise<User> {
    const user = await prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
    });

    if (!user) {
      throw new AppError(404, "User not found");
    }

    const isCurrentPasswordValid = await comparePassword(
      currentPassword,
      user.password
    );

    if (!isCurrentPasswordValid) {
      throw new AppError(400, "Current password is incorrect");
    }

    const hashedNewPassword = await hashPassword(newPassword);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword as User;
  }

  async hashPassword(password: string): Promise<string> {
    return hashPassword(password);
  }

  async verifyPassword(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    return comparePassword(plainPassword, hashedPassword);
  }
}
