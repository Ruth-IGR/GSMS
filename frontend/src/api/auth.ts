import api, { setCredentialHeaders } from "./client";
import type { AuthResponse } from "../types/api";

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest extends LoginRequest {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export const login = async (payload: LoginRequest): Promise<AuthResponse> => {
  // Credentials are set in AuthContext before this call
  const { data } = await api.post<AuthResponse>("/api/auth/login", payload);
  return data;
};

export const register = async (
  payload: RegisterRequest
): Promise<AuthResponse> => {
  // Registration is a public endpoint - don't send auth headers
  // Create a temporary axios instance without auth headers for registration
  const { data } = await api.post<AuthResponse>("/api/auth/register", payload, {
    headers: {
      // Explicitly don't include X-User-Email and X-User-Password for registration
    }
  });
  return data;
};

export const changePassword = async (payload: {
  currentPassword: string;
  newPassword: string;
}) => {
  const { data } = await api.post("/api/auth/change-password", payload);
  return data;
};

