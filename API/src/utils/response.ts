import { Response } from "express";
import { ApiResponse } from "../interfaces/_index";

export class ResponseUtil {
  static success<T>(
    res: Response,
    data?: T,
    message?: string,
    statusCode = 200
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
    return res.status(statusCode).json(response);
  }

  static error(res: Response, message: string, statusCode = 400): Response {
    const response: ApiResponse = {
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
    };
    return res.status(statusCode).json(response);
  }

  static paginated<T>(
    res: Response,
    data: T[],
    pagination: any,
    message?: string
  ): Response {
    return this.success(res, { data, pagination }, message);
  }
}
