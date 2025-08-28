import { Router } from "express";
import { StoryController } from "../controllers/storyController";
import { storySearchValidator, validateStory } from "../validators/story";
import {
  validatePaginationQuery,
  handleValidationErrors,
  validateParamId,
} from "../validators/_index";
import { authenticate } from "../middleware/auth";

const router = Router();
const storyController = new StoryController();

// Get all stories with pagination
router.get(
  "/",
  storySearchValidator,
  validatePaginationQuery,
  handleValidationErrors,
  storyController.getAllStories
);

// Get story by ID
router.get(
  "/:id",
  validateParamId,
  handleValidationErrors,
  storyController.getStoryById
);

router.post(
  "/",
  authenticate,
  validateStory,
  handleValidationErrors,
  storyController.createStory
);

router.put(
  "/:id",
  authenticate,
  validateParamId,
  validateStory,
  handleValidationErrors,
  storyController.updateStory
);

router.delete(
  "/:id",
  authenticate,
  validateParamId,
  handleValidationErrors,
  storyController.deleteStory
);

export default router;
