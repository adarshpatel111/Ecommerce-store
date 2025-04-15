"use client";

import { useState, useEffect } from "react";
import { Search, FileText, ExternalLink } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/auth-context";
import { useStore } from "@/context/store-context";
import { Skeleton } from "@/components/ui/skeleton";
import { InvoiceDetail } from "@/components/dashboard/invoice-detail";

export default function MyPurchasesPage() {
  const { user, userData } = useAuth();
  const { invoices, customers, loading } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [userInvoices, setUserInvoices] = useState<any[]>([]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(
    null
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Fetch user's invoices
  useEffect(() => {
    if (!loading.invoices && !loading.customers && user) {
      // Find customer by email
      const customer = customers.find((c) => c.email === user.email);

      if (customer) {
        // Find invoices for this customer
        const userInvoices = invoices.filter(
          (invoice) => invoice.customerId === customer.id
        );
        setUserInvoices(userInvoices);
      }
    }
  }, [loading, invoices, customers, user]);

  const filteredInvoices = userInvoices.filter((invoice) =>
    invoice.invoiceId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInvoiceClick = (id: string) => {
    setSelectedInvoiceId(id);
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Purchases</h1>
        <p className="text-muted-foreground">
          View your purchase history and invoices
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Purchase History</CardTitle>
            <CardDescription>
              View all your purchases and invoices
            </CardDescription>
          </div>
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search invoices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-full"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading.invoices || loading.customers ? (
                  // Loading skeleton
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={`loading-${index}`}>
                      <TableCell>
                        <Skeleton className="h-4 w-[80px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-[100px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-[80px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-[80px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-[100px] ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredInvoices.length > 0 ? (
                  filteredInvoices.map((invoice) => (
                    <TableRow
                      key={invoice.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleInvoiceClick(invoice.id || "")}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          {invoice.invoiceId}
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(invoice.date), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>₹{invoice.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            invoice.status === "paid"
                              ? "default"
                              : "destructive"
                          }
                        >
                          {invoice.status === "paid" ? "Paid" : "Unpaid"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInvoiceClick(invoice.id || "");
                          }}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No purchases found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <InvoiceDetail
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        invoiceId={selectedInvoiceId}
      />
    </div>
  );
}
