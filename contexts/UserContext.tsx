import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";
import i18n from "@/services/i18n";
import { notifyError, notifySuccess } from "@/components/toasts/Toast";
import { apiFetch } from "@/services/instances";
import { CONFIG } from "@/services/config";

/**
 * Transform user data from API response to app format
 * Converts profile_banner path to full URL
 */
const transformUserData = (userData: any): User => {
  const { profile_banner, ...others } = userData;
  return {
    ...others,
    profileBanner: profile_banner
      ? `${CONFIG.apiBaseUrl}/${profile_banner.slice(1)}`
      : null,
  };
};

interface UserContextValue {
  authState: { loading: boolean; authenticated: boolean | null };
  user: User | null;
  loader: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string,
    confirmPassword: string,
  ) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  expireSession: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function useUserContext() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
}

export function UserProvider({ children }: ContextProps) {
  const [authState, setAuthState] = useState<{
    loading: boolean;
    authenticated: boolean | null;
  }>({ loading: true, authenticated: null });
  const [user, setUser] = useState<User | null>(null);
  const [sessionExpired, setSessionExpired] = useState<boolean>(false);
  const [loader, setLoader] = useState<boolean>(false);

  // Load user from SecureStore on mount
  useEffect(() => {
    const loadAuth = async () => {
      try {
        const userStr = await SecureStore.getItemAsync("user");
        if (userStr) {
          setUser(JSON.parse(userStr));
          setAuthState({
            loading: false,
            authenticated: true,
          });
        } else {
          setUser(null);
          setAuthState({
            loading: false,
            authenticated: false,
          });
        }
      } catch (error) {
        console.error("Error loading auth:", error);
        setUser(null);
        setAuthState({
          loading: false,
          authenticated: false,
        });
      }
    };

    if (authState.loading) {
      loadAuth();
    }
  }, [authState.loading]);

  // Handle session expiration
  useEffect(() => {
    if (sessionExpired) {
      router.replace({
        pathname: "/(modal)/login",
        params: { session: "expired" },
      });
    }
  }, [sessionExpired]);

  const register = async (
    username: string,
    email: string,
    password: string,
    confirmPassword: string,
  ) => {
    try {
      setLoader(true);
      await apiFetch("/api/v1/auth/register", {
        method: "POST",
        body: JSON.stringify({
          username,
          email,
          password,
          confirmPassword,
        }),
      });
      // Auto-login after successful registration
      await login(email, password);
    } catch (err: any) {
      console.error("Registration error:", err);
      if (err.message.includes("400")) {
        notifyError(i18n.t("toast.register"));
      } else {
        notifyError(i18n.t("toast.error"));
      }
      setLoader(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoader(true);
      const result = await apiFetch("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (result) {
        const transformedUser = transformUserData(result);
        setAuthState({ loading: true, authenticated: null });
        await SecureStore.setItemAsync("user", JSON.stringify(transformedUser));
        notifySuccess(i18n.t("toast.success.login"));
        router.back(); // Close modal
        setLoader(false);
      }
    } catch (err: any) {
      console.error("Login error:", err);
      if (err.message.includes("401") || err.message.includes("403")) {
        notifyError(i18n.t("toast.login"));
      } else {
        notifyError(i18n.t("toast.error"));
      }
      setLoader(false);
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      setLoader(true);
      await apiFetch("/api/v1/auth/forgotten-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      notifySuccess(i18n.t("toast.success.forgot"));
      setLoader(false);
    } catch (err: any) {
      console.error("Forgot password error:", err);
      notifyError(i18n.t("toast.error"));
      setLoader(false);
    }
  };

  const logout = async () => {
    try {
      await apiFetch("/api/v1/auth/logout");
      setAuthState({ loading: true, authenticated: null });
      await SecureStore.deleteItemAsync("user");
      notifySuccess(i18n.t("toast.success.logout"));
    } catch (err: any) {
      console.error("Logout error:", err);
      notifyError(i18n.t("toast.error"));
    }
  };

  const expireSession = async () => {
    try {
      await apiFetch("/api/v1/auth/logout");
      setSessionExpired(true);
      await SecureStore.deleteItemAsync("user");
    } catch (err: any) {
      console.error("Session expiration error:", err);
      notifyError(i18n.t("toast.error"));
    }
  };

  const refreshUser = async () => {
    try {
      if (!user?.id) return;

      // Fetch updated user data from the API
      const rawUserData = await apiFetch(`/api/v1/users/${user.id}`);

      // Transform the data (convert profile_banner path to full URL)
      const transformedUser = transformUserData(rawUserData);

      // Update local state and SecureStore
      setUser(transformedUser);
      await SecureStore.setItemAsync("user", JSON.stringify(transformedUser));
    } catch (err: any) {
      console.error("Refresh user error:", err);
      // Don't show error to user, silently fail
    }
  };

  const value = {
    authState,
    user,
    loader,
    login,
    register,
    forgotPassword,
    logout,
    expireSession,
    refreshUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
