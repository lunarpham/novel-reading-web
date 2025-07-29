import { Router, Request, Response } from "express";
import { AuthController } from "../controllers/auth.controller";
import {
  validateUserRegistration,
  validateUserLogin,
  handleValidationErrors,
} from "../lib/middleware/user-validator";

const router = Router();
const authController = new AuthController();

router.post(
  "/register",
  validateUserRegistration,
  handleValidationErrors,
  (req: Request, res: Response) => authController.register(req, res)
);

router.post(
  "/login",
  validateUserLogin,
  handleValidationErrors,
  (req: Request, res: Response) => authController.login(req, res)
);

export default router;
