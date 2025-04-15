"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { onAuthStateChanged, type User } from "firebase/auth"
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db, loginUser, logoutUser, registerUser, resetUserPassword, updateUserStatus } from "@/lib/firebase"

type AuthContextType = {
  user: User | null;
  userData: any | null;
  loading: boolean;
  isAdmin: boolean;
  isSubAdmin: boolean;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<any>;
  register: (email: string, password: string, userData: any) => Promise<any>;
  resetPassword: (email: string) => Promise<any>;
  updateStatus: (userId: string, status: string) => Promise<any>;
  editUserEmail: (
    userId: string,
    newEmail: string
  ) => Promise<{ success: boolean; error?: string }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  // Check if user is admin
  const isAdmin = userData?.role === "admin"

  // Check if user is sub-admin
  const isSubAdmin = userData?.role === "sub-admin"

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true)
      if (currentUser) {
        // Get user data from Firestore
        const userDoc = await getDoc(doc(db, "users", currentUser.uid))

        if (userDoc.exists()) {
          const userDataFromFirestore = userDoc.data()

          // Check if user is inactive
          if (userDataFromFirestore.status === "inactive") {
            // Log out inactive users
            await logoutUser()
            setUser(null)
            setUserData(null)
          } else {
            setUser(currentUser)
            setUserData(userDataFromFirestore)
          }
        } else {
          setUser(currentUser)
          setUserData(null)
        }
      } else {
        setUser(null)
        setUserData(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const result = await loginUser(email, password)

      // Check if user is inactive
      if (result.success && result.userData?.status === "inactive") {
        await logoutUser()
        return {
          success: false,
          error: "Your account has been deactivated. Please contact an administrator.",
        }
      }

      return result
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  const logout = async () => {
    try {
      await logoutUser()
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  const register = async (email: string, password: string, userData: any) => {
    try {
      return await registerUser(email, password, userData)
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  const resetPassword = async (email: string) => {
    try {
      return await resetUserPassword(email)
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  const updateStatus = async (userId: string, status: string) => {
    try {
      return await updateUserStatus(userId, status)
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }
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
  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        loading,
        isAdmin,
        isSubAdmin,
        login,
        logout,
        register,
        resetPassword,
        updateStatus,
        editUserEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
