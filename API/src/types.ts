import { JwtPayload } from "./interfaces/auth";
import { Role } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & { role: Role };
    }
  }
}

export {};
