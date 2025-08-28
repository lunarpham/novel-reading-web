import { body, param, ValidationChain } from "express-validator";
import { User, Role, Gender } from "@prisma/client";
import { createStrictValidationChain } from "./_index";

// Type-safe field names for User model
type UserField = keyof Pick<
  User,
  | "email"
  | "username"
  | "displayName"
  | "password"
  | "bio"
  | "dateOfBirth"
  | "gender"
  | "role"
  | "avatarUrl"
>;

const validateChain = (rule: ValidationChain): ValidationChain => {
  return rule.if((value, { req }) => {
    // For PUT/PATCH, make it optional (only validate if provided)
    if (req.method === "PUT" || req.method === "PATCH") {
      return value !== undefined;
    }
    // For POST and other methods, always validate
    return true;
  });
};

export const userValidationRules = {
  username: validateChain(
    body("username" satisfies UserField)
      .notEmpty()
      .withMessage("Username is required")
      .trim()
      .customSanitizer((value) => value.replace(/\s+/g, ""))
      .isLength({ min: 3, max: 20 })
      .withMessage("Username must be between 3 and 20 characters")
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage(
        "Username can only contain letters, numbers, and underscores"
      )
  ),

  email: validateChain(
    body("email" satisfies UserField)
      .notEmpty()
      .withMessage("Email is required")
      .trim()
      .isEmail()
      .withMessage("Invalid email format")
      .normalizeEmail()
  ),

  displayName: validateChain(
    body("displayName" satisfies UserField)
      .notEmpty()
      .withMessage("Display name is required")
      .trim()
      .customSanitizer((value) => value.replace(/\s+/g, " ").trim())
      .isLength({ min: 2, max: 50 })
      .withMessage("Display name must be between 2 and 50 characters")
  ),

  password: validateChain(
    body("password" satisfies UserField)
      .notEmpty()
      .withMessage("Password is required")
      .trim()
      .customSanitizer((value) => value.replace(/\s+/g, ""))
      .isLength({ min: 8, max: 128 })
      .withMessage("Password must be between 8 and 128 characters")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
      )
      .withMessage(
        "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character"
      )
  ),

  role: validateChain(
    body("role" satisfies UserField)
      .isIn(Object.values(Role))
      .withMessage(`Role must be one of: ${Object.values(Role).join(", ")}`)
  ).optional(),

  bio: validateChain(
    body("bio" satisfies UserField)
      .trim()
      .isLength({ max: 500 })
      .withMessage("Bio cannot exceed 500 characters")
  ).optional(),

  dateOfBirth: validateChain(
    body("dateOfBirth" satisfies UserField)
      .isISO8601()
      .withMessage("Date of birth must be a valid ISO8601 date")
      .custom((value) => {
        if (value) {
          const date = new Date(value);
          const now = new Date();
          let age = now.getFullYear() - date.getFullYear();
          const monthDiff = now.getMonth() - date.getMonth();
          if (
            monthDiff < 0 ||
            (monthDiff === 0 && now.getDate() < date.getDate())
          ) {
            age--;
          }
          if (age < 13 || age > 120) {
            throw new Error("Age must be between 13 and 120 years");
          }
        }
        return true;
      })
  ).optional(),

  gender: validateChain(
    body("gender" satisfies UserField)
      .isIn(Object.values(Gender))
      .withMessage(`Gender must be one of: ${Object.values(Gender).join(", ")}`)
  ).optional(),

  avatarUrl: validateChain(
    body("avatarUrl" satisfies UserField)
      .isURL()
      .withMessage("Avatar must be a valid URL")
  ).optional(),
};

// Additional rules for non-model fields (e.g., password change)
export const newPasswordRule = validateChain(
  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .trim()
    .customSanitizer((value) => value.replace(/\s+/g, ""))
    .isLength({ min: 8, max: 128 })
    .withMessage("New password must be between 8 and 128 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      "New password must contain at least one lowercase letter, one uppercase letter, one number, and one special character"
    )
);

export const confirmPasswordRule = body("confirmPassword")
  .notEmpty()
  .withMessage("Password confirmation is required")
  .custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error("Password confirmation does not match new password");
    }
    return true;
  });

export const validateFollowUserId = {
  followedUserId: () =>
    createStrictValidationChain([
      body("followedUserId")
        .isInt({ min: 1 })
        .withMessage("Valid followed user ID is required"),
    ]),
  followingUserId: () =>
    createStrictValidationChain([
      body("followingUserId")
        .isInt({ min: 1 })
        .withMessage("Valid following user ID is required"),
    ]),
};

export const validateUserRegistration = createStrictValidationChain([
  userValidationRules.username,
  userValidationRules.email,
  userValidationRules.displayName,
  userValidationRules.password,
  userValidationRules.bio,
  userValidationRules.dateOfBirth,
  userValidationRules.gender,
  userValidationRules.avatarUrl,
]);

export const validateUserLogin = createStrictValidationChain([
  userValidationRules.email,
  userValidationRules.password,
]);

export const validateUserProfileUpdate = createStrictValidationChain([
  userValidationRules.displayName,
  userValidationRules.bio,
  userValidationRules.dateOfBirth,
  userValidationRules.gender,
  userValidationRules.avatarUrl,
]);

export const validateUserPasswordChange = createStrictValidationChain([
  userValidationRules.password,
  newPasswordRule,
  confirmPasswordRule,
]);
