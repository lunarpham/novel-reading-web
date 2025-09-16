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

const allowedBodyFields: UserField[] = [
  "username",
  "displayName",
  "password",
  "bio",
  "dateOfBirth",
  "gender",
  "avatarUrl",
];

// Safe sanitizer that handles undefined/null values
const safeSanitizer = (value: any) => {
  if (value == null || typeof value !== "string") return value;
  return value.replace(/\s+/g, " ").trim();
};

// Field rule builders
const usernameRule = (required: boolean) => {
  const chain = body("username" satisfies UserField)
    .customSanitizer((value) => {
      if (value == null || typeof value !== "string") return value;
      return value.replace(/\s+/g, "");
    })
    .isLength({ min: 3, max: 20 })
    .withMessage("Username must be between 3 and 20 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores");
  return required
    ? chain.notEmpty().withMessage("Username is required")
    : chain.optional();
};

const emailRule = (required: boolean) => {
  const chain = body("email" satisfies UserField)
    .customSanitizer(safeSanitizer)
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail();
  return required
    ? chain.notEmpty().withMessage("Email is required")
    : chain.optional();
};

const displayNameRule = (required: boolean) => {
  const chain = body("displayName" satisfies UserField)
    .customSanitizer(safeSanitizer)
    .isLength({ min: 2, max: 50 })
    .withMessage("Display name must be between 2 and 50 characters");
  return required
    ? chain.notEmpty().withMessage("Display name is required")
    : chain.optional();
};

const passwordRule = (required: boolean) => {
  const chain = body("password" satisfies UserField)
    .customSanitizer((value) => {
      if (value == null || typeof value !== "string") return value;
      return value.replace(/\s+/g, "");
    })
    .isLength({ min: 8, max: 128 })
    .withMessage("Password must be between 8 and 128 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character"
    );
  return required
    ? chain.notEmpty().withMessage("Password is required")
    : chain.optional();
};

const bioRule = () =>
  body("bio" satisfies UserField)
    .customSanitizer(safeSanitizer)
    .isLength({ max: 500 })
    .withMessage("Bio cannot exceed 500 characters")
    .optional();

const dateOfBirthRule = () =>
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
    .optional();

const genderRule = () =>
  body("gender" satisfies UserField)
    .isIn(Object.values(Gender))
    .withMessage(`Gender must be one of: ${Object.values(Gender).join(", ")}`)
    .optional();

const avatarUrlRule = () =>
  body("avatarUrl" satisfies UserField)
    .customSanitizer(safeSanitizer)
    .isURL()
    .withMessage("Avatar must be a valid URL")
    .optional();

// Factory: build chains per operation
const buildUserValidators = (
  mode: "register" | "login" | "update" | "passwordChange"
): ValidationChain[] => {
  const chains: ValidationChain[] = [];

  switch (mode) {
    case "register":
      chains.push(
        usernameRule(true),
        emailRule(true),
        displayNameRule(true),
        passwordRule(true),
        bioRule(),
        dateOfBirthRule(),
        genderRule(),
        avatarUrlRule()
      );
      break;

    case "login":
      chains.push(emailRule(true), passwordRule(true));
      break;

    case "update":
      chains.push(
        displayNameRule(false),
        bioRule(),
        dateOfBirthRule(),
        genderRule(),
        avatarUrlRule(),
        body().custom((_, { req }) => {
          const provided = Object.keys(req.body).filter((k) =>
            (allowedBodyFields as string[]).includes(k)
          );
          if (provided.length === 0) {
            throw new Error("At least one updatable field must be provided");
          }
          return true;
        })
      );
      break;

    case "passwordChange":
      chains.push(
        passwordRule(true),
        body("newPassword")
          .notEmpty()
          .withMessage("New password is required")
          .customSanitizer((value) => {
            if (value == null || typeof value !== "string") return value;
            return value.replace(/\s+/g, "");
          })
          .isLength({ min: 8, max: 128 })
          .withMessage("New password must be between 8 and 128 characters")
          .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
          )
          .withMessage(
            "New password must contain at least one lowercase letter, one uppercase letter, one number, and one special character"
          )
      );
      break;
  }

  return chains;
};

// Create validators using the factory
export const validateUserRegistration = createStrictValidationChain(
  buildUserValidators("register")
);

export const validateUserLogin = createStrictValidationChain(
  buildUserValidators("login")
);

export const validateUserProfileUpdate = createStrictValidationChain(
  buildUserValidators("update")
);

export const validateUserPasswordChange = createStrictValidationChain(
  buildUserValidators("passwordChange")
);

// Additional validators for user follow functionality
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

// Parameter validation
export const validateUserId = createStrictValidationChain([
  param("id")
    .isInt({ min: 1 })
    .withMessage("User ID must be a positive integer"),
]);
