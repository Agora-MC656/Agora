import { createContext } from "react";

export type AuthUser = {
  nameEmail: string;
};

export type AuthContextValue = {
  user: AuthUser | null;
  login: (nameEmail: string) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
