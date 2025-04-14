"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useStore } from "@/context/store-context";
import { addDays } from "date-fns";

export function UnpaidInvoices() {
  const { invoices, customers, loading } = useStore();
  const [unpaidInvoices, setUnpaidInvoices] = useState<any[]>([]);

  useEffect(() => {
    if (!loading.invoices && !loading.customers) {
      // Get unpaid invoices
      const unpaid = invoices
        .filter((invoice) => invoice.status === "unpaid")
        .sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(a.date);
          const dateB = b.createdAt?.toDate?.() || new Date(b.date);
          return dateA.getTime() - dateB.getTime(); // Oldest first (most urgent)
        })
        .slice(0, 3)
        .map((invoice) => {
          // Find the customer for this invoice
          const customer = customers.find((c) => c.id === invoice.customerId);

          // Calculate due date (for demo purposes - in a real app this would be stored)
          const createdDate =
            invoice.createdAt?.toDate?.() || new Date(invoice.date);
          const dueDate = addDays(createdDate, 30); // Assuming 30 days payment terms
          const daysUntilDue = Math.ceil(
            (dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          );

          let dueDateText = "Overdue";
          if (daysUntilDue > 0) {
            dueDateText =
              daysUntilDue === 1
                ? "Tomorrow"
                : daysUntilDue <= 3
                ? `In ${daysUntilDue} days`
                : `Due ${dueDate.toLocaleDateString()}`;
          }

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
            dueDate: dueDateText,
          };
        });

      setUnpaidInvoices(unpaid);
    }
  }, [invoices, customers, loading]);

  if (loading.invoices || loading.customers) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex items-center gap-4">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-[120px]" />
                <Skeleton className="h-5 w-[60px] rounded-full" />
              </div>
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
      {unpaidInvoices.length > 0 ? (
        unpaidInvoices.map((invoice) => (
          <div key={invoice.id} className="flex items-center gap-4">
            <Avatar className="h-9 w-9">
              <AvatarImage
                src={invoice.customer.avatar || "/placeholder.svg"}
                alt={invoice.customer.name}
              />
              <AvatarFallback>{invoice.customer.initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium leading-none">
                  {invoice.customer.name}
                </p>
                <Badge variant="outline">{invoice.id}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {invoice.customer.email}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">
                ₹{invoice.amount.toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground">{invoice.dueDate}</p>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-4 text-muted-foreground">
          No unpaid invoices found.
        </div>
      )}
    </div>
  );
}
