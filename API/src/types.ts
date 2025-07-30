import { JwtPayload } from "./lib/utils/jwt-token";
import { Role } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & { role: Role };
    }
  }
}

export {};
