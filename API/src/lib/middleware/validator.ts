import {
  body,
  param,
  query,
  validationResult,
  ValidationChain,
} from "express-validator";
import e, { Request, Response, NextFunction } from "express";
import { Role, User } from "@prisma/client";

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

const passwordFormatValidation = (fieldName: string) => {
  return body(fieldName)
    .trim()
    .notEmpty()
    .customSanitizer((value) => {
      return value.replace(/\s+/g, "");
    })
    .isLength({ min: 8, max: 128 })
    .withMessage(`${fieldName} must be between 8 and 128 characters`)
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      `${fieldName} must contain at least one lowercase letter, one uppercase letter, one number, and one special character`
    );
};

// Reusable validation rules
export const userValidationRules = {
  // Validation field in request body
  username: (required = true): ValidationChain => {
    const rule = body("username")
      .trim()
      .customSanitizer((value) => {
        return value.replace(/\s+/g, "");
      })
      .isLength({ min: 3, max: 20 })
      .withMessage("Username must be between 3 and 20 characters")
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage(
        "Username can only contain letters, numbers, and underscores"
      );

    return required
      ? rule.notEmpty().withMessage("Username is required")
      : rule.optional();
  },

  email: (required = true): ValidationChain => {
    const rule = body("email")
      .trim()
      .isEmail()
      .withMessage("Invalid email format")
      .normalizeEmail();

    return required
      ? rule.notEmpty().withMessage("Email is required")
      : rule.optional();
  },

  displayName: (required = true): ValidationChain => {
    const rule = body("displayName")
      .trim()
      .customSanitizer((value) => {
        return value.replace(/\s+/g, " ").trim();
      })
      .isLength({ min: 2, max: 50 })
      .withMessage("Display name must be between 2 and 50 characters");

    return required
      ? rule.notEmpty().withMessage("Display name is required")
      : rule.optional();
  },

  password: (required = true): ValidationChain => {
    const rule = passwordFormatValidation("password");
    return required
      ? rule.notEmpty().withMessage("Password is required")
      : rule.optional();
  },

  newPassword: (required = true): ValidationChain => {
    const rule = passwordFormatValidation("newPassword");
    return required
      ? rule.notEmpty().withMessage("New password is required")
      : rule.optional();
  },

  role: (required = false): ValidationChain => {
    const rule = body("role")
      .isIn(Object.values(Role))
      .withMessage("Invalid role");

    return required
      ? rule.notEmpty().withMessage("Role is required")
      : rule.optional();
  },

  bio: (): ValidationChain =>
    body("bio")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Bio must not exceed 500 characters"),

  dateOfBirth: (required = false): ValidationChain => {
    const rule = body("dateOfBirth")
      .isISO8601()
      .withMessage("Invalid date format")
      .custom((value) => {
        if (value) {
          const date = new Date(value);
          const now = new Date();
          const age = now.getFullYear() - date.getFullYear();
          if (age < 13 || age > 120) {
            throw new Error("Age must be between 13 and 120 years");
          }
        }
        return true;
      });

    return required
      ? rule.notEmpty().withMessage("Date of birth is required")
      : rule.optional();
  },

  gender: (): ValidationChain =>
    body("gender")
      .optional()
      .isIn(["male", "female", "prefer_not_to_say"])
      .withMessage("Gender must be one of: male, female, prefer_not_to_say"),

  avatarUrl: (): ValidationChain =>
    body("avatarUrl")
      .optional()
      .isURL()
      .withMessage("Avatar URL must be a valid URL"),

  userId: (): ValidationChain =>
    param("id")
      .isInt({ min: 1 })
      .withMessage("User ID must be a positive integer"),

  confirmPassword: (): ValidationChain =>
    body("confirmPassword")
      .notEmpty()
      .withMessage("Password confirmation is required")
      .custom((value, { req }) => {
        if (value !== req.body.newPassword) {
          throw new Error("Password confirmation does not match new password");
        }
        return true;
      }),
};

export const queryPaginationRules = {
  pagination: () => [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
  ],
};

// Preset validation combinations
export const validateUserRegistration: ValidationChain[] = [
  userValidationRules.email(),
  userValidationRules.username(),
  userValidationRules.displayName(),
  userValidationRules.password(),
  userValidationRules.bio(),
  userValidationRules.dateOfBirth(),
  userValidationRules.gender(),
  userValidationRules.avatarUrl(),
];

export const validateUserLogin: ValidationChain[] = [
  userValidationRules.email(),
  userValidationRules.password(),
];

export const validateUserProfileUpdate: ValidationChain[] = [
  userValidationRules.email(false),
  userValidationRules.displayName(false),
  userValidationRules.bio(),
  userValidationRules.dateOfBirth(false),
  userValidationRules.gender(),
  userValidationRules.avatarUrl(),
];

export const validateUserPasswordChange: ValidationChain[] = [
  userValidationRules.password(),
  userValidationRules.newPassword(),
];

export const validateFollowUserId = {
  followedUserId: () =>
    body("followedUserId")
      .isInt({ min: 1 })
      .withMessage("Valid followed user ID is required"),
  followingUserId: () =>
    body("followingUserId")
      .isInt({ min: 1 })
      .withMessage("Valid following user ID is required"),
};

export const createUserValidation = (
  fields: (keyof typeof userValidationRules)[],
  options: { [key: string]: boolean } = {}
) => {
  return fields.map((field) => {
    const required = options[field] !== false;
    return userValidationRules[field](required);
  });
};
