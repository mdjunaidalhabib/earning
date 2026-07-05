import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axiosInstance, { setAccessToken } from "@/api/axiosInstance";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const bootstrapSession = useCallback(async () => {
    try {
      const { data } = await axiosInstance.post("/auth/refresh");
      const token = data?.data?.accessToken;
      setAccessToken(token);

      const meRes = await axiosInstance.get("/auth/me");
      setUser(meRes.data.data.user);
    } catch {
      setUser(null);
      setAccessToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    bootstrapSession();
  }, [bootstrapSession]);

  useEffect(() => {
    function handleSessionExpired() {
      setUser(null);
      setAccessToken(null);
    }
    window.addEventListener("auth:session-expired", handleSessionExpired);
    return () =>
      window.removeEventListener("auth:session-expired", handleSessionExpired);
  }, []);

  const login = useCallback(async ({ email, password, portal = "user" }) => {
    setAuthError(null);
    const { data } = await axiosInstance.post("/auth/login", { email, password, portal });
    setAccessToken(data.data.accessToken);
    setUser(data.data.user);
    return data.data.user;
  }, []);

  const register = useCallback(async (payload) => {
    setAuthError(null);
    const { data } = await axiosInstance.post("/auth/register", payload);
    setAccessToken(data.data.accessToken);
    setUser(data.data.user);
    return data.data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await axiosInstance.post("/auth/logout");
    } finally {
      setUser(null);
      setAccessToken(null);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const { data } = await axiosInstance.get("/auth/me");
    setUser(data.data.user);
    return data.data.user;
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    isLoading,
    authError,
    setAuthError,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
