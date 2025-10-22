import { createContext, useContext } from 'react';

export const AuthContext = createContext({
  user: null,
  session: null,
  loading: true,
  isAdmin: false,
  isAuthenticated: false
});

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};