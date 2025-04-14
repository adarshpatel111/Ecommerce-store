// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app"
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth"
import { getFirestore, collection, doc, setDoc, getDoc, query, where, getDocs } from "firebase/firestore"
import { getStorage } from "firebase/storage"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// Initialize Firebase
let app
if (!getApps().length) {
  app = initializeApp(firebaseConfig)
} else {
  app = getApps()[0]
}

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// User roles
export const ROLES = {
  ADMIN: "admin",
  SUB_ADMIN: "sub-admin",
  USER: "user",
}

// Authentication functions
export const registerUser = async (email: string, password: string, userData: any) => {
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Store additional user data in Firestore
    await setDoc(doc(db, "users", user.uid), {
      ...userData,
      email,
      role: ROLES.USER, // Default role
      createdAt: new Date(),
    })

    return { success: true, user }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid))

    if (userDoc.exists()) {
      return { success: true, user, userData: userDoc.data() }
    } else {
      return { success: false, error: "User data not found" }
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export const logoutUser = async () => {
  try {
    await signOut(auth)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export const getCurrentUser = async (): Promise<{ user: User | null; userData: any | null }> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe()

      if (user) {
        // Get user data from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid))
        if (userDoc.exists()) {
          resolve({ user, userData: userDoc.data() })
        } else {
          resolve({ user, userData: null })
        }
      } else {
        resolve({ user: null, userData: null })
      }
    })
  })
}

// Admin functions
export const createSubAdmin = async (email: string, password: string, userData: any) => {
  try {
    const result = await registerUser(email, password, userData)

    if (result.success && result.user) {
      // Update role to sub-admin
      await setDoc(doc(db, "users", result.user.uid), {
        ...userData,
        email,
        role: ROLES.SUB_ADMIN,
        createdAt: new Date(),
      })

      return { success: true, user: result.user }
    } else {
      return result
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export const getUsersByRole = async (role: string) => {
  try {
    const usersRef = collection(db, "users")
    const q = query(usersRef, where("role", "==", role))
    const querySnapshot = await getDocs(q)

    const users: any[] = []
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() })
    })

    return { success: true, users }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// Initialize admin user if it doesn't exist
export const initializeAdminUser = async () => {
  try {
    // Check if admin exists
    const adminQuery = query(collection(db, "users"), where("role", "==", ROLES.ADMIN))
    const adminSnapshot = await getDocs(adminQuery)

    if (adminSnapshot.empty) {
      // Create admin user
      const adminEmail = "admin@example.com"
      const adminPassword = "admin123"

      try {
        // Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword)
        const user = userCredential.user

        // Store admin data in Firestore
        await setDoc(doc(db, "users", user.uid), {
          firstName: "Admin",
          lastName: "User",
          email: adminEmail,
          role: ROLES.ADMIN,
          createdAt: new Date(),
        })

        console.log("Admin user created successfully")
      } catch (error: any) {
        // If admin already exists in Auth but not in Firestore
        if (error.code === "auth/email-already-in-use") {
          try {
            // Try to sign in
            const userCredential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword)
            const user = userCredential.user

            // Store admin data in Firestore
            await setDoc(doc(db, "users", user.uid), {
              firstName: "Admin",
              lastName: "User",
              email: adminEmail,
              role: ROLES.ADMIN,
              createdAt: new Date(),
            })

            console.log("Admin user created successfully")
          } catch (signInError) {
            console.error("Error creating admin user:", signInError)
          }
        } else {
          console.error("Error creating admin user:", error)
        }
      }
    }
  } catch (error) {
    console.error("Error checking for admin user:", error)
  }
}

export default app
