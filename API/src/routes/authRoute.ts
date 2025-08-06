import { Router } from "express";
import { AuthController } from "../controllers/authController";
import {
  validateUserRegistration,
  validateUserLogin,
  handleValidationErrors,
} from "../lib/middleware/validator";

const router = Router();
const authController = new AuthController();

router.post(
  "/register",
  validateUserRegistration,
  handleValidationErrors,
  authController.register
);

router.post(
  "/login",
  validateUserLogin,
  handleValidationErrors,
  authController.login
);

export default router;
