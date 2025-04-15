// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app"
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
  sendPasswordResetEmail,
} from "firebase/auth"
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore"
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
      const userData = userDoc.data()

      // Check device limits
      const { success, devices } = await getUserDevices(user.uid)

      if (success && devices.length >= 2) {
        // Get current device info
        const deviceInfo = {
          browser: navigator.userAgent,
          os: navigator.platform,
          location: "Unknown", // In a real app, you might use geolocation or IP-based location
          name: `${navigator.platform} - ${navigator.userAgent.split(")")[0].split("(")[1]}`,
        }

        // Check if this device is already registered
        const currentDeviceId = localStorage.getItem("deviceId")
        const existingDevice = currentDeviceId ? devices.find((d) => d.deviceId === currentDeviceId) : null

        if (existingDevice) {
          // Update last active time
          await updateDeviceLastActive(user.uid, currentDeviceId)
          return { success: true, user, userData }
        } else {
          // Too many devices, need to remove one
          return {
            success: false,
            error: "MAX_DEVICES_REACHED",
            user,
            userData,
            devices,
          }
        }
      } else {
        // Register this device
        const deviceInfo = {
          browser: navigator.userAgent,
          os: navigator.platform,
          location: "Unknown",
          name: `${navigator.platform} - ${navigator.userAgent.split(")")[0].split("(")[1]}`,
        }

        await addUserDevice(user.uid, deviceInfo)
        return { success: true, user, userData }
      }
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

// Add these new functions after the existing functions

export const resetUserPassword = async (email: string) => {
  try {
    // Send password reset email
    await sendPasswordResetEmail(auth, email)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export const updateUserStatus = async (userId: string, status: "active" | "inactive") => {
  try {
    const userRef = doc(db, "users", userId)
    await setDoc(userRef, { status }, { merge: true })
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export const deleteUser = async (userId: string) => {
  try {
    // Delete user from Firestore
    const userRef = doc(db, "users", userId)
    await deleteDoc(userRef)

    // In a real application, you would also delete the user from Firebase Auth
    // This requires admin SDK which is not available in client-side code
    // You would need to create a server function to handle this

    return { success: true }
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

// Add these functions for device management

export const addUserDevice = async (userId: string, deviceInfo: any) => {
  try {
    // Generate a unique device ID
    const deviceId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

    // Add device to user's devices collection
    await setDoc(doc(db, "users", userId, "devices", deviceId), {
      ...deviceInfo,
      deviceId,
      lastActive: serverTimestamp(),
      createdAt: serverTimestamp(),
    })

    // Store device ID in local storage
    localStorage.setItem("deviceId", deviceId)

    return { success: true, deviceId }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export const getUserDevices = async (userId: string) => {
  try {
    const devicesRef = collection(db, "users", userId, "devices")
    const querySnapshot = await getDocs(devicesRef)

    const devices: any[] = []
    querySnapshot.forEach((doc) => {
      devices.push({ id: doc.id, ...doc.data() })
    })

    return { success: true, devices }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export const removeUserDevice = async (userId: string, deviceId: string) => {
  try {
    await deleteDoc(doc(db, "users", userId, "devices", deviceId))
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export const updateDeviceLastActive = async (userId: string, deviceId: string) => {
  try {
    const deviceRef = doc(db, "users", userId, "devices", deviceId)
    await updateDoc(deviceRef, {
      lastActive: serverTimestamp(),
    })
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export default app
