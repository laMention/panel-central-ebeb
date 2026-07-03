import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import * as PlatformStateRepository from "@/repositories/PlatformStateRepository";
import type { AdminResume } from "@/repositories/PlatformStateRepository";

const STORAGE_KEY = "control-panel-token";

interface AuthContextValue {
  token: string | null;
  admin: AdminResume | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem(STORAGE_KEY));
  const [admin, setAdmin] = useState<AdminResume | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    const result = await PlatformStateRepository.login(email, password);
    const bearer = result.token.replace(/^Bearer\s+/i, "");
    sessionStorage.setItem(STORAGE_KEY, bearer);
    setToken(bearer);
    setAdmin(result.admin);
  }, []);

  const logout = useCallback(async () => {
    if (token) {
      try {
        await PlatformStateRepository.logout(token);
      } catch {
        // le jeton est déjà invalide côté serveur — on nettoie quand même localement
      }
    }
    sessionStorage.removeItem(STORAGE_KEY);
    setToken(null);
    setAdmin(null);
  }, [token]);

  return (
    <AuthContext.Provider value={{ token, admin, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans un AuthProvider");
  return ctx;
}
