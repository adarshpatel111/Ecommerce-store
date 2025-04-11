import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardStats } from "@/components/dashboard/stats"
import { RecentOrders } from "@/components/dashboard/recent-orders"
import { UnpaidInvoices } from "@/components/dashboard/unpaid-invoices"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your business and recent activities</p>
      </div>

      <DashboardStats />

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
  )
}
