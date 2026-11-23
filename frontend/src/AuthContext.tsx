import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type AuthUser = {
  nameEmail: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  login: (nameEmail: string) => void;
  logout: () => void;
};

const STORAGE_KEY = "agora-auth-user";

const AuthContext = createContext<AuthContextValue | null>(null);

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

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  }
  return context;
}
