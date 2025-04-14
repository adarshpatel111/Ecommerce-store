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

export default function DashboardPage() {
  const { products, customers, invoices, loading } = useStore();
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
