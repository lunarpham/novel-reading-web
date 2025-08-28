import { body, param, query, ValidationChain } from "express-validator";
import { Story, Status, Tag } from "@prisma/client";
import { createStrictValidationChain } from "./_index";

// Type-safe field names for Story model
type StoryField = keyof Pick<
  Story,
  "title" | "description" | "status" | "cover" | "tags" | "publishedAt"
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

export const storyValidationRules = {
  title: validateChain(
    body("title" satisfies StoryField)
      .notEmpty()
      .withMessage("Title is required")
      .customSanitizer((value) => value.replace(/\s+/g, " ").trim())
      .isLength({ min: 1, max: 200 })
      .withMessage("Title must be between 1 and 200 characters")
  ),

  description: validateChain(
    body("description" satisfies StoryField)
      .notEmpty()
      .withMessage("Description is required")
      .customSanitizer((value) => value.replace(/\s+/g, " ").trim())
      .isLength({ max: 2000 })
      .withMessage("Description cannot exceed 2000 characters")
  ),

  status: validateChain(
    body("status" satisfies StoryField)
      .customSanitizer((value) => value.replace(/\s+/g, " ").trim())
      .isIn(Object.values(Status))
      .withMessage(`Status must be one of: ${Object.values(Status).join(", ")}`)
  ).optional(),

  cover: validateChain(
    body("cover" satisfies StoryField)
      .trim()
      .isURL()
      .withMessage("Cover must be a valid URL")
  ).optional(),

  tags: validateChain(
    body("tags" satisfies StoryField)
      .isArray()
      .withMessage("Tags must be an array")
      .custom((tags) => {
        if (tags.length === 0) {
          throw new Error("At least one tag is required");
        }

        if (tags.length > 10) {
          throw new Error("Maximum 10 tags allowed");
        }
        for (const tag of tags) {
          if (!Object.values(Tag).includes(tag)) {
            throw new Error(
              `Invalid tag: ${tag}. Must be one of: ${Object.values(Tag).join(
                ", "
              )}`
            );
          }
        }
        return true;
      })
      .bail()
  ).optional(),

  publishedAt: validateChain(
    body("publishedAt" satisfies StoryField)
      .isISO8601()
      .withMessage("Published date must be a valid ISO8601 date")
      .custom((value) => {
        if (value) {
          const date = new Date(value);
          const now = new Date();
          if (date > now) {
            throw new Error("Published date cannot be in the future");
          }
        }
        return true;
      })
  ).optional(),
};

export const validateStoryQuery = {
  title: query("title")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Title must be between 1 and 100 characters"),

  sort: (allowedFields: string[]) =>
    query("sort")
      .optional()
      .isIn(allowedFields)
      .withMessage(`Sort must be one of: ${allowedFields.join(", ")}`),

  order: query("order")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("Order must be either 'asc' or 'desc'"),
};

// Single validation array that works for all methods
const createStoryValidation: ValidationChain[] = [
  storyValidationRules.title,
  storyValidationRules.description,
  storyValidationRules.status,
  storyValidationRules.cover,
  storyValidationRules.tags,
  storyValidationRules.publishedAt,
];

export const validateStory = createStrictValidationChain(createStoryValidation);

export const storySearchValidator = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be between 1 and 50"),

  query("title")
    .optional()
    .isString()
    .trim()
    .withMessage("Title must be a string"),

  query("keyword")
    .optional()
    .isString()
    .trim()
    .withMessage("Keyword must be a string"),

  query("status")
    .optional()
    .isIn(Object.values(Status))
    .withMessage(`Status must be one of: ${Object.values(Status).join(", ")}`),

  query("includeTags")
    .optional()
    .custom((value) => {
      // Handle array of tags from multiple query parameters
      const tags = Array.isArray(value) ? value : [value];
      const validTags = Object.values(Tag);

      for (const tag of tags) {
        if (!validTags.includes(tag as Tag)) {
          throw new Error(
            `Invalid include tag: ${tag}. Valid tags are: ${validTags.join(
              ", "
            )}`
          );
        }
      }
      return true;
    }),

  query("excludeTags")
    .optional()
    .custom((value) => {
      // Handle array of tags from multiple query parameters
      const tags = Array.isArray(value) ? value : [value];
      const validTags = Object.values(Tag);

      for (const tag of tags) {
        if (!validTags.includes(tag as Tag)) {
          throw new Error(
            `Invalid exclude tag: ${tag}. Valid tags are: ${validTags.join(
              ", "
            )}`
          );
        }
      }
      return true;
    }),

  query("includeTagLogic")
    .optional()
    .isIn(["and", "or"])
    .withMessage("Include tag logic must be 'and' or 'or'"),

  query("excludeTagLogic")
    .optional()
    .isIn(["and", "or"])
    .withMessage("Exclude tag logic must be 'and' or 'or'"),

  query("sortBy")
    .optional()
    .isIn(["title", "updatedAt", "createdAt", "publishedAt"])
    .withMessage("Invalid sort field"),

  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("Sort order must be 'asc' or 'desc'"),
];

export const storyCreateValidator = [
  storyValidationRules.title,
  storyValidationRules.description,
  storyValidationRules.cover,
  storyValidationRules.tags,
];

export const storyIdValidator = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("Story ID must be a positive integer"),
];
