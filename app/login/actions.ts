"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

// This is a mock authentication function
// In a real app, you would validate against a database
export async function loginUser(formData: FormData) {
  // Simulate a delay to mimic a real API call
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const email = formData.get("email") as string
  const password = formData.get("password") as string

  // Mock validation - in a real app, check against your database
  if (email === "admin@example.com" && password === "password") {
    // Set a session cookie
    cookies().set("auth-token", "mock-jwt-token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })

    return { success: true }
  }

  return {
    success: false,
    error: "Invalid email or password",
  }
}

// Middleware function to check if user is authenticated
export async function checkAuth() {
  const authToken = cookies().get("auth-token")

  if (!authToken) {
    redirect("/login")
  }

  return true
}
