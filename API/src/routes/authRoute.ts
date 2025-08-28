import { Router } from "express";
import { AuthController } from "../controllers/authController";
import {
  validateUserRegistration,
  validateUserLogin,
} from "../validators/user";
import { handleValidationErrors } from "../validators/_index";

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
