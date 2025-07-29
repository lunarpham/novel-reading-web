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

  async getUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }
  async getUserByUsername(username: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { username },
    });
  }

  async getUserById(id: number): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async getUserRole(id: number): Promise<string | null> {
    const user = await prisma.user.findUnique({
      where: { id },
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
}
