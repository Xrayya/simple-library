import { useApiQuery } from "@/hooks/api";
import { LoaderCircle } from "lucide-react";
import React, { useContext } from "react";

type AuthProviderType = {
  username: string;
  email: string;
  role: string;
};

const initialState: AuthProviderType | undefined = undefined;

const AuthContextProvider = React.createContext<AuthProviderType | undefined>(
  initialState,
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isPending, error, data } = useApiQuery<AuthProviderType>(
    ["authMe"],
    "/auth/me",
    {},
    true,
  );

  if (isPending) {
    return <LoaderCircle className="animate-spin" />;
  }

  if (error) {
    return <div>{error.message}</div>;
  }

  return (
    <AuthContextProvider.Provider value={data}>
      {children}
    </AuthContextProvider.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContextProvider);
};
