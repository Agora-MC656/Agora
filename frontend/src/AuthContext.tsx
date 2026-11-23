import { useMemo, useState, type ReactNode } from "react";

import {
  AuthContext,
  type AuthContextValue,
  type AuthUser,
} from "./authContextStore";

const STORAGE_KEY = "agora-auth-user";

function readStoredUser(): AuthUser | null {
  const value = localStorage.getItem(STORAGE_KEY);
  return value ? { nameEmail: value } : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(readStoredUser);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      login: (nameEmail) => {
        localStorage.setItem(STORAGE_KEY, nameEmail);
        setUser({ nameEmail });
      },
      logout: () => {
        localStorage.removeItem(STORAGE_KEY);
        setUser(null);
      },
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
