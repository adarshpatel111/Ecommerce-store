// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
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
// const firebaseConfig = {
//   apiKey: "AIzaSyDyo36olbEe5IMEZ0mre7kBzNb7xNXmQ5Y",
//   authDomain: "vasulibhai-77e12.firebaseapp.com",
//   projectId: "vasulibhai-77e12",
//   storageBucket: "vasulibhai-77e12.firebasestorage.app",
//   messagingSenderId: "754992731505",
//   appId: "1:754992731505:web:dec3f4bf67b65ded7892d0",
//   measurementId: "G-J73LCQN2RW"
// };

// Initialize Firebase
let app
if (!getApps().length) {
  app = initializeApp(firebaseConfig)
} else {
  app = getApps()[0] // if already initialized, use that one
}

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// Enable Firestore persistence for offline support
// This can help with connection issues
if (typeof window !== "undefined") {
  import("firebase/firestore").then(({ enableIndexedDbPersistence }) => {
    enableIndexedDbPersistence(db).catch((err) => {
      if (err.code === "failed-precondition") {
        console.warn("Persistence failed: multiple tabs open")
      } else if (err.code === "unimplemented") {
        console.warn("Persistence not available in this browser")
      }
    })
  })
}

export default app
