import { UserService } from "../user/_index";
import { comparePassword } from "../../utils/bcrypt";
import { TokenService } from "./token";
import { AppError } from "../../middleware/error";
import { User } from "@prisma/client";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResult {
  user: Omit<User, "password">;
  tokens: AuthTokens;
}

export class AuthService {
  constructor(
    private userService = new UserService(),
    private tokenService = new TokenService()
  ) {}

  async registerUser(userData: any): Promise<AuthResult> {
    await this.validateUserUniqueness(userData.email, userData.username);

    const user = await this.userService.create.createUser(userData);

    const tokens = this.generateTokens(user);

    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      tokens,
    };
  }

  async loginUser(email: string, password: string): Promise<AuthResult> {
    const user = await this.validateCredentials(email, password);

    const tokens = this.generateTokens(user);

    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      tokens,
    };
  }

  private async validateUserUniqueness(
    email: string,
    username: string
  ): Promise<void> {
    const [existingEmail, existingUsername] = await Promise.all([
      this.userService.profile.getUserByEmail(email),
      this.userService.profile.getUserByUsername(username),
    ]);

    if (existingEmail) {
      throw new AppError(409, "User with this email already exists");
    }

    if (existingUsername) {
      throw new AppError(409, "User with this username already exists");
    }
  }

  private async validateCredentials(email: string, password: string) {
    const user = await this.userService.profile.getUserByEmail(email);

    if (!user) {
      throw new AppError(401, "Invalid email or password");
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new AppError(401, "Invalid email or password");
    }

    if (user.isRestricted) {
      throw new AppError(
        403,
        "Your account has been restricted. Please contact support."
      );
    }

    return user;
  }

  private generateTokens(user: any): AuthTokens {
    return this.tokenService.generateTokens(user);
  }
}
