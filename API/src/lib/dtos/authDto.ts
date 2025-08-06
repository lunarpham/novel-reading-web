export interface JwtPayload {
  userId: number;
  email: string;
  username: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface TokenUser {
  id: number;
  email: string;
  username: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  displayName: string;
  password: string;
  bio?: string;
  dateOfBirth?: string;
  avatarUrl?: string;
  gender?: string;
}

export interface AuthResponse {
  user: {
    id: number;
    email: string;
    username: string;
    displayName: string;
    role: string;
    bio?: string;
    avatarUrl?: string;
  };
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
