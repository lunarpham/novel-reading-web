import prisma from "../../config/prismaClient";
import { User } from "@prisma/client";
import { hashPassword } from "../../utils/bcrypt";
import { UserCreateData } from "../../interfaces/user";
import { AppError } from "../../middleware/error";

export class UserCreateService {
  async createUser(data: UserCreateData): Promise<User> {
    // Prevent race conditions
    return await prisma.$transaction(async (prisma) => {
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
    });
  }
}
