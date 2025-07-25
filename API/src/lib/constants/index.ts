import dotenv from "dotenv";
dotenv.config();

export class Constants {
  static readonly PORT = process.env.PORT || 3000;
  static readonly JWT_SECRET = process.env.JWT_SECRET || "";
  static readonly JWT_EXPIRATION = process.env.JWT_EXPIRATION || "";
  static readonly JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "";
  static readonly JWT_REFRESH_EXPIRATION =
    process.env.JWT_REFRESH_EXPIRATION || "";
  static readonly JWT_ISSUER = process.env.JWT_ISSUER || "";
  static readonly JWT_AUDIENCE = process.env.JWT_AUDIENCE || "";
}
