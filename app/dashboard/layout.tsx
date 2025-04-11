import type React from "react"

import { DashboardSidebar, MobileSidebarTrigger } from "@/components/dashboard/sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { checkAuth } from "../login/actions"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check if user is authenticated
  await checkAuth()

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Wrap both sidebar and content in SidebarProvider */}
      <SidebarProvider defaultOpen={true}>
        <DashboardSidebar />
        <MobileSidebarTrigger />
        <main className="flex-1 p-4 pt-16 md:p-6 md:pt-6">{children}</main>
      </SidebarProvider>
    </div>
  )
}
