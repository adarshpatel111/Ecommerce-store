import { IndianRupee, Users, ShoppingCart, CreditCard } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsProps {
  stats: {
    totalRevenue: number;
    totalCustomers: number;
    totalProducts: number;
    unpaidInvoices: number;
    revenueGrowth: number;
    customerGrowth: number;
    productGrowth: number;
    unpaidGrowth: number;
  };
}

export function DashboardStats({ stats }: StatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <IndianRupee className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ₹{stats.totalRevenue.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.revenueGrowth > 0 ? "+" : ""}
            {stats.revenueGrowth}% from last month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Customers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalCustomers}</div>
          <p className="text-xs text-muted-foreground">
            {stats.customerGrowth > 0 ? "+" : ""}
            {stats.customerGrowth}% from last month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Products</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalProducts}</div>
          <p className="text-xs text-muted-foreground">
            {stats.productGrowth > 0 ? "+" : ""}
            {stats.productGrowth}% from last month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Unpaid Invoices</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.unpaidInvoices}</div>
          <p className="text-xs text-muted-foreground">
            {stats.unpaidGrowth > 0 ? "+" : ""}
            {stats.unpaidGrowth}% from last month
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
