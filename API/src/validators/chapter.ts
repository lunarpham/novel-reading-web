import { body, param, query, ValidationChain } from "express-validator";
import { Chapter } from "@prisma/client";
import { createStrictValidationChain } from "./_index";

// Type-safe field names for Chapter model
type ChapterField = keyof Pick<
  Chapter,
  "title" | "content" | "storyId" | "sortIndex"
>;

const allowedBodyFields: ChapterField[] = [
  "title",
  "content",
  "storyId",
  "sortIndex",
];

// Safe sanitizer that handles undefined/null values
const safeSanitizer = (value: any) => {
  if (value == null || typeof value !== "string") return value;
  return value.replace(/\s+/g, " ").trim();
};

// Field rule builders (same approach as story validator)
const titleRule = (required: boolean) => {
  const chain = body("title" satisfies ChapterField)
    .customSanitizer(safeSanitizer)
    .isLength({ min: 1, max: 200 })
    .withMessage("Chapter title must be between 1 and 200 characters");
  return required
    ? chain.notEmpty().withMessage("Title is required")
    : chain.optional();
};

const contentRule = (required: boolean) => {
  const chain = body("content" satisfies ChapterField)
    .customSanitizer(safeSanitizer)
    .isLength({ min: 1 })
    .withMessage("Chapter content cannot be empty");
  return required
    ? chain.notEmpty().withMessage("Chapter content is required")
    : chain.optional();
};

const storyIdRule = (required: boolean) => {
  const chain = body("storyId" satisfies ChapterField)
    .isInt({ min: 1 })
    .withMessage("Valid story ID is required");
  return required
    ? chain.notEmpty().withMessage("Story ID is required")
    : chain.optional();
};

const sortIndexRule = (required: boolean) => {
  const chain = body("sortIndex" satisfies ChapterField)
    .isFloat({ min: 0 })
    .withMessage("Sort index must be a non-negative number");
  return required
    ? chain.notEmpty().withMessage("Sort index is required")
    : chain.optional();
};

// Factory: build chains per operation (create/update)
const buildChapterValidators = (
  mode: "create" | "update"
): ValidationChain[] => {
  const requireOnCreate = mode === "create";
  const chains: ValidationChain[] = [
    titleRule(false),
    contentRule(requireOnCreate),
    storyIdRule(requireOnCreate),
    sortIndexRule(requireOnCreate),
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

// Create/Update validators (new)
export const validateCreateChapter = createStrictValidationChain(
  buildChapterValidators("create")
);
export const validateUpdateChapter = createStrictValidationChain(
  buildChapterValidators("update")
);

// Query validation for chapter search/filtering
export const chapterQueryValidator = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be between 1 and 50"),

  query("storyId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Story ID must be a positive integer"),

  query("authorId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Author ID must be a positive integer"),

  query("sortBy")
    .optional()
    .isIn(["sortIndex", "createdAt", "updatedAt", "title"])
    .withMessage(
      "Sort field must be one of: sortIndex, createdAt, updatedAt, title"
    ),

  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("Sort order must be 'asc' or 'desc'"),
];

export const validateChapterQuery = createStrictValidationChain(
  chapterQueryValidator
);

// Parameter validation
export const chapterIdValidator = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("Chapter ID must be a positive integer"),
];
export const storyIdValidator = [
  param("storyId")
    .isInt({ min: 1 })
    .withMessage("Story ID must be a positive integer"),
];

export const validateGetChapterById = createStrictValidationChain([
  query("showContent")
    .optional()
    .isBoolean()
    .withMessage("showContent must be a boolean")
    .toBoolean(),
]);

export const validateChapterId =
  createStrictValidationChain(chapterIdValidator);
export const validateStoryId = createStrictValidationChain(storyIdValidator);
