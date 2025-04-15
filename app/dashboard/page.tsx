"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardStats } from "@/components/dashboard/stats";
import { RecentOrders } from "@/components/dashboard/recent-orders";
import { UnpaidInvoices } from "@/components/dashboard/unpaid-invoices";
import { useStore } from "@/context/store-context";
import { useAuth } from "@/context/auth-context";
import { Wallet } from "lucide-react";

export default function DashboardPage() {
  const { products, customers, invoices, loading } = useStore();
  const { userData, isAdmin, isSubAdmin } = useAuth();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalCustomers: 0,
    totalProducts: 0,
    unpaidInvoices: 0,
    revenueGrowth: 0,
    customerGrowth: 0,
    productGrowth: 0,
    unpaidGrowth: 0,
  });

  useEffect(() => {
    if (!loading.invoices && !loading.customers && !loading.products) {
      // Calculate total revenue (from paid invoices)
      const totalRevenue = invoices
        .filter((invoice) => invoice.status === "paid")
        .reduce((sum, invoice) => sum + invoice.amount, 0);

      // Count unpaid invoices
      const unpaidInvoices = invoices.filter(
        (invoice) => invoice.status === "unpaid"
      ).length;

      // Set stats with actual data
      setStats({
        totalRevenue,
        totalCustomers: customers.length,
        totalProducts: products.length,
        unpaidInvoices,
        // These growth percentages would ideally be calculated by comparing with previous period
        // For now, we'll use placeholder values
        revenueGrowth: 20.1,
        customerGrowth: 15.5,
        productGrowth: 8.3,
        unpaidGrowth: 12.7,
      });
    }
  }, [loading, invoices, customers, products]);

  // If user is a regular user, show a simplified dashboard
  if (!isAdmin && !isSubAdmin) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {userData?.firstName}!
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Wallet Balance
              </CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{userData?.walletBalance?.toFixed(2) || "0.00"}
              </div>
              <p className="text-xs text-muted-foreground">
                {(userData?.walletBalance || 0) > 0
                  ? "Available credit"
                  : (userData?.walletBalance || 0) < 0
                  ? "Outstanding balance"
                  : "No balance"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Purchases
              </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userData?.totalPurchases || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Lifetime purchases
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Amount Spent
              </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <rect width="20" height="14" x="2" y="5" rx="2" />
                <path d="M2 10h20" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{userData?.totalSpent?.toFixed(2) || "0.00"}
              </div>
              <p className="text-xs text-muted-foreground">Lifetime spending</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Invoices
              </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userData?.pendingInvoices || 0}
              </div>
              <p className="text-xs text-muted-foreground">Unpaid invoices</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Recent Purchases</CardTitle>
              <CardDescription>Your recent product purchases</CardDescription>
            </CardHeader>
            <CardContent>
              {/* We'll implement this component later */}
              <p>Your recent purchases will appear here.</p>
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Unpaid Invoices</CardTitle>
              <CardDescription>Invoices that require payment</CardDescription>
            </CardHeader>
            <CardContent>
              {/* We'll implement this component later */}
              <p>Your unpaid invoices will appear here.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Admin/Sub-admin dashboard
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your business and recent activities
        </p>
      </div>

      <DashboardStats stats={stats} />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Your most recent customer orders</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentOrders />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Unpaid Invoices</CardTitle>
            <CardDescription>Invoices that require attention</CardDescription>
          </CardHeader>
          <CardContent>
            <UnpaidInvoices />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
