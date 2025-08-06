export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  errors?: any[];
}

export const createSuccessResponse = <T>(
  data: T,
  message = "Success",
  pagination?: any
): ApiResponse<T> => ({
  success: true,
  message,
  data,
  ...(pagination && { pagination }),
});

export const createErrorResponse = (
  message: string,
  errors?: any[]
): ApiResponse => ({
  success: false,
  message,
  ...(errors && { errors }),
});
