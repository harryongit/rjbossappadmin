"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { login as apiLogin, logout as apiLogout, isAuthenticated } from "@/lib/admin";

interface AuthContextValue {
  authenticated: boolean;
  loading: boolean;
  username: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const ok = isAuthenticated();
    setAuthenticated(ok);
    if (ok) {
      try {
        const token = localStorage.getItem("satta_admin_token") || "";
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUsername(payload.sub ? String(payload.sub) : null);
      } catch {
        // ignore
      }
    }
    setLoading(false);
  }, []);

  async function login(username: string, password: string) {
    await apiLogin(username, password);
    setAuthenticated(true);
    setUsername(username);
  }

  function logout() {
    apiLogout();
    setAuthenticated(false);
    setUsername(null);
    window.location.href = "/login";
  }

  return (
    <AuthContext.Provider value={{ authenticated, loading, username, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
