"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useStore } from "@/context/store-context";
import { formatDistanceToNow } from "date-fns";

export function RecentOrders() {
  const { invoices, customers, loading } = useStore();
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    if (!loading.invoices && !loading.customers) {
      // Get the 4 most recent invoices
      const recent = [...invoices]
        .sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(a.date);
          const dateB = b.createdAt?.toDate?.() || new Date(b.date);
          return dateB.getTime() - dateA.getTime();
        })
        .slice(0, 4)
        .map((invoice) => {
          // Find the customer for this invoice
          const customer = customers.find((c) => c.id === invoice.customerId);

          return {
            id: invoice.invoiceId,
            customer: {
              name: customer
                ? `${customer.firstName} ${customer.lastName}`
                : invoice.customer,
              email: customer?.email || "Unknown",
              avatar: "/placeholder.svg?height=32&width=32",
              initials: customer
                ? `${customer.firstName[0]}${customer.lastName[0]}`
                : "??",
            },
            amount: invoice.amount,
            status: invoice.status,
            date: invoice.createdAt?.toDate?.()
              ? formatDistanceToNow(invoice.createdAt.toDate(), {
                  addSuffix: true,
                })
              : formatDistanceToNow(new Date(invoice.date), {
                  addSuffix: true,
                }),
          };
        });

      setRecentOrders(recent);
    }
  }, [invoices, customers, loading]);

  if (loading.invoices || loading.customers) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex items-center gap-4">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-3 w-[180px]" />
            </div>
            <div className="text-right">
              <Skeleton className="h-4 w-[60px] ml-auto" />
              <Skeleton className="h-3 w-[80px] ml-auto mt-1" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {recentOrders.length > 0 ? (
        recentOrders.map((order) => (
          <div key={order.id} className="flex items-center gap-4">
            <Avatar className="h-9 w-9">
              <AvatarImage
                src={order.customer.avatar || "/placeholder.svg"}
                alt={order.customer.name}
              />
              <AvatarFallback>{order.customer.initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">
                {order.customer.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {order.customer.email}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">₹{order.amount.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">{order.date}</p>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-4 text-muted-foreground">
          No recent orders found.
        </div>
      )}
    </div>
  );
}
