import { Router, Request, Response } from "express";
import { UserController } from "../controllers/user.controller";
import {
  userValidationRules,
  handleValidationErrors,
} from "../lib/middleware/user-validator";
import { AuthMiddleware } from "../lib/middleware/auth-middleware";

const router = Router();
const userController = new UserController();
const authMiddleware = new AuthMiddleware();

router.get(
  "/:id",
  userValidationRules.userId(),
  handleValidationErrors,
  (req: Request, res: Response) => userController.getUserProfile(req, res)
);

router.post(
  "/:id/following",
  userValidationRules.userId(),
  handleValidationErrors,
  (req: Request, res: Response) =>
    authMiddleware.authenticate(req, res, () =>
      authMiddleware.requireSelfOrAdmin()(req, res, () =>
        userController.followUser(req, res)
      )
    )
);

router.delete(
  "/:id/following",
  userValidationRules.userId(),
  handleValidationErrors,
  (req: Request, res: Response) =>
    authMiddleware.authenticate(req, res, () =>
      authMiddleware.requireSelfOrAdmin()(req, res, () =>
        userController.unfollowUser(req, res)
      )
    )
);

export default router;
