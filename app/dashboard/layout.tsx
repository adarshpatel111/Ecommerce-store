"use client";

import type React from "react";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  DashboardSidebar,
  MobileSidebarTrigger,
} from "@/components/dashboard/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/context/auth-context";
import { initializeAdminUser } from "@/lib/firebase";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Initialize admin user if needed
    initializeAdminUser();

    // Redirect to login if not authenticated
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Show loading or redirect if not authenticated
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Wrap both sidebar and content in SidebarProvider */}
      <SidebarProvider defaultOpen={true}>
        <DashboardSidebar />
        <MobileSidebarTrigger />
        <main className="flex-1 p-4 pt-16 md:p-6 md:pt-6">{children}</main>
      </SidebarProvider>
    </div>
  );
}
