import { Request, Response } from "express";
import { AuthService } from "../services/auth/authenticate";
import { ApiResponse } from "../lib/utils/response";
import { asyncHandler } from "../lib/middleware/error";

export class AuthController {
  constructor(private authService = new AuthService()) {}

  register = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userData = req.body;
      const result = await this.authService.registerUser(userData);

      const response: ApiResponse = {
        success: true,
        message: "User registered successfully",
        data: {
          user: result.user,
          ...result.tokens,
        },
      };

      res.status(201).json(response);
    }
  );

  login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    const result = await this.authService.loginUser(email, password);

    const response: ApiResponse = {
      success: true,
      message: "Login successful",
      data: {
        user: result.user,
        ...result.tokens,
      },
    };

    res.status(200).json(response);
  });
}
