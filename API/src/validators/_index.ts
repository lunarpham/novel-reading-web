import {
  body,
  param,
  query,
  validationResult,
  ValidationChain,
  checkExact,
} from "express-validator";
import { Request, Response, NextFunction } from "express";

// Error handler for validation
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  next();
};

// General query validation rules
export const validatePaginationQuery = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
];

export const validateParamId = [
  param("id").isInt({ min: 1 }).withMessage("ID must be a positive integer"),
];

export const createStrictValidationChain = (
  validationChains: ValidationChain[]
) => {
  return [...validationChains, checkExact()];
};
