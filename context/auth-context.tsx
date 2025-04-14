"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User } from "firebase/auth";
import { useRouter } from "next/navigation";
import {
  auth,
  getCurrentUser,
  loginUser,
  logoutUser,
  ROLES,
} from "@/lib/firebase";

type UserData = {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: Date;
};

type AuthContextType = {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isSubAdmin: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { user, userData } = await getCurrentUser();
        setUser(user);
        setUserData(userData);
      } catch (error) {
        console.error("Auth error:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Set up auth state listener
    const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
      if (authUser) {
        setUser(authUser);
        // Get user data from Firestore
        const { userData } = await getCurrentUser();
        setUserData(userData);
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const result = await loginUser(email, password);

      if (result.success) {
        setUser(result.user);
        setUserData(result.userData);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await logoutUser();
      setUser(null);
      setUserData(null);
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = userData?.role === ROLES.ADMIN;
  const isSubAdmin = userData?.role === ROLES.SUB_ADMIN;

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        loading,
        login,
        logout,
        isAdmin,
        isSubAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
