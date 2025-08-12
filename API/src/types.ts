import { JwtPayload } from "./lib/dtos/authDto";
import { Role } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & { role: Role };
    }
  }
}

export {};
