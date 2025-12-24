// API Request/Response Types
// Based on Admin Authentication API Documentation

export interface LoginRequest {
  email: string;
  password: string;
}

export interface Admin {
  _id: string;
  name: string;
  email: string;
  role: string;
  profile?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponseData {
  admin: Admin;
  accessToken: string;
  refresh_token: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: LoginResponseData;
}

export interface refresh_tokenRequest {
  refresh_token: string;
}

export interface refresh_tokenResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
  };
}

export interface MeResponse {
  success: boolean;
  message: string;
  data: {
    admin: Admin;
  };
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  data?: {
    resetToken?: string; // Only in development mode
  };
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export interface ApiError {
  success: false;
  message: string;
  error?: string; // Only in development mode
}

