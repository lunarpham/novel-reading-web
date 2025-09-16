import { Router } from "express";
import { ChapterController } from "../controllers/chapterController";
import {
  chapterQueryValidator,
  validateCreateChapter,
  validateUpdateChapter,
  validateGetChapterById,
} from "../validators/chapter";
import {
  validatePaginationQuery,
  handleValidationErrors,
  validateParamId,
} from "../validators/_index";
import { authenticate } from "../middleware/auth";

const router = Router();
const chapterController = new ChapterController();

router.get(
  "/",
  chapterQueryValidator,
  validatePaginationQuery,
  handleValidationErrors,
  chapterController.getAllChapters
);

// Get chapter by ID
router.get(
  "/:id",
  validateParamId,
  validateGetChapterById,
  handleValidationErrors,
  chapterController.getChapterById
);

router.post(
  "/",
  authenticate,
  validateCreateChapter,
  handleValidationErrors,
  chapterController.createChapter
);

router.put(
  "/:id",
  authenticate,
  validateParamId,
  validateUpdateChapter,
  handleValidationErrors,
  chapterController.updateChapter
);

router.delete(
  "/:id",
  authenticate,
  handleValidationErrors,
  chapterController.deleteChapter
);

export default router;
