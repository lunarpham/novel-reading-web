import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { comparePassword } from "../lib/utils/bcrypt";
import {
  generateAccessToken,
  generateRefreshToken,
  TokenResponse,
} from "../lib/utils/jwt-token";
import { User } from "@prisma/client";

export class AuthController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  async register(req: Request, res: Response): Promise<void> {
    try {
      const userData = req.body;

      // Check if user already exists
      const existingEmail = await this.userService.getUserByEmail(
        userData.email
      );
      if (existingEmail) {
        res.status(409).json({
          success: false,
          message: "User with this email already exists",
        });
        return;
      }

      const existingUsername = await this.userService.getUserByUsername(
        userData.username
      );

      if (existingUsername) {
        res.status(409).json({
          success: false,
          message: "User with this username already exists",
        });
        return;
      }

      // Create the new user
      const user = await this.userService.createUser(userData);

      // Remove sensitive data before sending response
      const { password, ...userWithoutPassword } = user;

      // Generate tokens
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user.id);

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          user: userWithoutPassword,
          accessToken,
          refreshToken,
          expiresIn: 3600,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to register user",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await this.userService.getUserByEmail(email);
      if (!user) {
        res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
        return;
      }

      // Verify password
      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
        return;
      }

      // Check if user is restricted
      if (user.isRestricted) {
        res.status(403).json({
          success: false,
          message: "Your account has been restricted. Please contact support.",
        });
        return;
      }

      // Remove sensitive data before sending response
      const { password: _, ...userWithoutPassword } = user;

      // Generate tokens
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user.id);

      res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          user: userWithoutPassword,
          accessToken,
          refreshToken,
          expiresIn: 3600, // 1 hour in seconds
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to login",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
