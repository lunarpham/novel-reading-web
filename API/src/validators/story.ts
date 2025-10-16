import { body, param, query, ValidationChain } from "express-validator";
import { Story, Status, Tag } from "@prisma/client";
import { createStrictValidationChain } from "./_index";

// Type-safe field names for Story model
type StoryField = keyof Pick<
  Story,
  "title" | "description" | "status" | "cover" | "tags" | "publishedAt"
>;

const allowedBodyFields: StoryField[] = [
  "title",
  "description",
  "status",
  "cover",
  "tags",
  "publishedAt",
];

// Safe sanitizer that handles undefined/null values
const safeSanitizer = (value: any) => {
  if (value == null || typeof value !== "string") return value;
  return value.replace(/\s+/g, " ").trim();
};

// Field rule builders
const titleRule = (required: boolean) => {
  const chain = body("title" satisfies StoryField)
    .customSanitizer(safeSanitizer)
    .isLength({ min: 1, max: 200 })
    .withMessage("Title must be between 1 and 200 characters");
  return required
    ? chain.notEmpty().withMessage("Title is required")
    : chain.optional();
};

const descriptionRule = (required: boolean) => {
  const chain = body("description" satisfies StoryField)
    .customSanitizer(safeSanitizer)
    .isLength({ min: 1, max: 2000 })
    .withMessage("Description must be between 1 and 2000 characters");
  return required
    ? chain.notEmpty().withMessage("Description is required")
    : chain.optional();
};

const statusRule = () =>
  body("status" satisfies StoryField)
    .customSanitizer(safeSanitizer)
    .isIn(Object.values(Status))
    .withMessage(`Status must be one of: ${Object.values(Status).join(", ")}`)
    .optional();

const coverRule = () =>
  body("cover" satisfies StoryField)
    .customSanitizer(safeSanitizer)
    .trim()
    .isURL()
    .withMessage("Cover must be a valid URL")
    .optional();

const tagsRule = (required: boolean) => {
  const chain = body("tags" satisfies StoryField)
    .isArray()
    .withMessage("Tags must be an array")
    .custom((tags) => {
      if (!Array.isArray(tags)) {
        throw new Error("Tags must be an array");
      }
      if (tags.length === 0) {
        throw new Error("At least one tag is required");
      }
      if (tags.length > 10) {
        throw new Error("Maximum 10 tags allowed");
      }
      const unique = new Set(tags);
      if (unique.size !== tags.length) {
        throw new Error("Duplicate tags are not allowed");
      }
      const validTags = Object.values(Tag);
      for (const tag of tags) {
        if (!validTags.includes(tag as Tag)) {
          throw new Error(
            `Invalid tag: ${tag}. Must be one of: ${validTags.join(", ")}`
          );
        }
      }
      return true;
    });
  return required ? chain : chain.optional();
};

const publishedAtRule = () =>
  body("publishedAt" satisfies StoryField)
    .isISO8601()
    .withMessage("Published date must be a valid ISO8601 date")
    .custom((value) => {
      if (value) {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          throw new Error("Invalid date format");
        }
        const now = new Date();
        if (date > now) {
          throw new Error("Published date cannot be in the future");
        }
      }
      return true;
    })
    .optional();

// Factory: build chains per operation
const buildStoryValidators = (mode: "create" | "update"): ValidationChain[] => {
  const requireOnCreate = mode === "create";
  const chains: ValidationChain[] = [
    titleRule(requireOnCreate),
    descriptionRule(requireOnCreate),
    statusRule(),
    coverRule(),
    tagsRule(requireOnCreate),
    publishedAtRule(),
  ];

  if (mode === "update") {
    chains.push(
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
  }

  return chains;
};

// Exports for CRUD
export const validateCreateStory = createStrictValidationChain(
  buildStoryValidators("create")
);

export const validateUpdateStory = createStrictValidationChain(
  buildStoryValidators("update")
);

// Path params
export const validateStoryId = createStrictValidationChain([
  param("id")
    .isInt({ min: 1 })
    .withMessage("Story ID must be a positive integer"),
]);

// Query validation for search/filtering
export const validateStorySearch = createStrictValidationChain([
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
    .isLength({ min: 1, max: 100 })
    .withMessage("Title must be between 1 and 100 characters"),
  query("keyword")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Keyword must be between 1 and 100 characters"),

  query("status")
    .optional()
    .isIn(Object.values(Status))
    .withMessage(`Status must be one of: ${Object.values(Status).join(", ")}`),

  query("includeTags")
    .optional()
    .custom((value) => {
      const tags = Array.isArray(value) ? value : [value];
      const validTags = Object.values(Tag);
      if (tags.length > 10) throw new Error("Maximum 10 include tags allowed");
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
      const tags = Array.isArray(value) ? value : [value];
      const validTags = Object.values(Tag);
      if (tags.length > 10) throw new Error("Maximum 10 exclude tags allowed");
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
]);
