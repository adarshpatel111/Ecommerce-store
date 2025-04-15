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
  updateUserStatus,
} from "@/lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

type UserData = {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: Date;
  status?: string;
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
  updateStatus: (
    userId: string,
    status: "active" | "inactive"
  ) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (
    email: string
  ) => Promise<{ success: boolean; error?: string }>;
  editUserEmail: (
    userId: string,
    newEmail: string
  ) => Promise<{ success: boolean; error?: string }>;
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

  const updateStatus = async (
    userId: string,
    status: "active" | "inactive"
  ) => {
    try {
      const result = await updateUserStatus(userId, status);
      return result;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const result = await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const editUserEmail = async (userId: string, newEmail: string) => {
    try {
      // In a real app, you would use Firebase Admin SDK to update the email
      // For now, we'll just update it in Firestore
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { email: newEmail });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const result = await loginUser(email, password);

      if (result.success) {
        // Check if user is active
        if (result.userData?.status === "inactive") {
          await logoutUser();
          return {
            success: false,
            error:
              "Your account has been deactivated. Please contact an administrator.",
          };
        }

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
        updateStatus,
        resetPassword,
        editUserEmail,
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
