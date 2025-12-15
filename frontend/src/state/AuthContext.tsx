import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { login as apiLogin, register as apiRegister } from "../api/auth";
import { setCredentialHeaders } from "../api/client";
import type { AuthResponse, UserResponse } from "../types/api";

type AuthState = {
  user?: UserResponse;
  email?: string;
  password?: string;
  token?: string | null;
};

type AuthContextValue = {
  user?: UserResponse;
  email?: string;
  token?: string | null;
  isAuthed: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (
    payload: Parameters<typeof apiRegister>[0]
  ) => Promise<AuthResponse>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const storageKey = "cfa_auth";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<AuthState>(() => {
    const cached = localStorage.getItem(storageKey);
    if (cached) {
      const parsed: AuthState = JSON.parse(cached);
      if (parsed.email && parsed.password) {
        setCredentialHeaders(parsed.email, parsed.password);
      }
      return parsed;
    }
    return {};
  });

  const persist = (next: AuthState) => {
    setState(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
    if (next.email && next.password) {
      setCredentialHeaders(next.email, next.password);
    } else {
      setCredentialHeaders(undefined, undefined);
    }
  };

  useEffect(() => {
    if (state.email && state.password) {
      setCredentialHeaders(state.email, state.password);
    }
  }, [state.email, state.password]);

  const handleLogin = async (email: string, password: string) => {
    // Set credentials BEFORE making the login call so they're available for subsequent requests
    setCredentialHeaders(email, password);
    const resp = await apiLogin({ email, password });
    persist({ email, password, user: resp.user, token: resp.token });
    return resp;
  };

  const handleRegister: AuthContextValue["register"] = async (payload) => {
    // DON'T set credentials before registration - it's a public endpoint
    // The axios interceptor will skip auth headers for /api/auth/register
    const resp = await apiRegister(payload);
    // Now set credentials for subsequent authenticated requests
    setCredentialHeaders(payload.email, payload.password);
    persist({
      email: payload.email,
      password: payload.password,
      user: resp.user,
      token: resp.token,
    });
    return resp;
  };

  const logout = () => {
    persist({});
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user: state.user,
      email: state.email,
      token: state.token ?? null,
      isAuthed: Boolean(state.user && state.email && state.password),
      login: handleLogin,
      register: handleRegister,
      logout,
    }),
    [state.user, state.email, state.token, state.password]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

