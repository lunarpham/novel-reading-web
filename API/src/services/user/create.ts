import prisma from "../../config/prismaClient";
import { User } from "@prisma/client";
import { hashPassword } from "../../lib/utils/bcrypt";
import { UserCreateData } from "../../lib/dtos/userDto";
import { AppError } from "../../lib/middleware/error";

export class UserCreateService {
  async createUser(data: UserCreateData): Promise<User> {
    // Validate required fields
    await this.validateUserData(data);

    // Check if user already exists by email
    const existingEmail = await prisma.user.findUnique({
      where: { email: data.email, deletedAt: null },
    });

    if (existingEmail) {
      throw new AppError(409, "User with this email already exists");
    }

    // Check if username already exists
    const existingUsername = await prisma.user.findUnique({
      where: { username: data.username, deletedAt: null },
    });

    if (existingUsername) {
      throw new AppError(409, "User with this username already exists");
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(data.password);

    return prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });
  }

  async validateUserData(data: UserCreateData): Promise<void> {
    // Additional validation logic
    if (!data.email || !data.username || !data.password) {
      throw new AppError(400, "Required fields are missing");
    }

    if (data.email.length === 0) {
      throw new AppError(400, "Email cannot be empty");
    }

    if (data.username.length === 0) {
      throw new AppError(400, "Username cannot be empty");
    }

    if (data.password.length === 0) {
      throw new AppError(400, "Password cannot be empty");
    }
  }
}
