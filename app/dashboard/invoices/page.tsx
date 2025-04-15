"use client";

import type React from "react";

import { useState, useMemo } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStore } from "@/context/store-context";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Plus, Search, FileText, Trash2, Merge } from "lucide-react";
import { InvoiceDetail } from "@/components/dashboard/invoice-detail";
import { CreateInvoiceDialog } from "@/components/dashboard/create-invoice-dialog";
import { MergeInvoicesDialog } from "@/components/dashboard/merge-invoices-dialog";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PaymentHistoryDialog } from "@/components/dashboard/payment-history-dialog";

export default function InvoicesPage() {
  const { invoices, customers, loading, markInvoiceAsPaid, deleteInvoice } =
    useStore();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(
    null
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMergeDialogOpen, setIsMergeDialogOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    null
  );
  const [isPaymentHistoryOpen, setIsPaymentHistoryOpen] = useState(false);

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.invoiceId.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === "all") {
      return matchesSearch;
    } else {
      return matchesSearch && invoice.status === activeTab;
    }
  });

  // Group invoices by customer for merge functionality
  const customerWithMultipleUnpaidInvoices = useMemo(() => {
    const unpaidInvoicesByCustomer = invoices
      .filter((invoice) => invoice.status === "unpaid")
      .reduce((acc, invoice) => {
        if (!acc[invoice.customerId]) {
          acc[invoice.customerId] = [];
        }
        acc[invoice.customerId].push(invoice);
        return acc;
      }, {} as Record<string, typeof invoices>);

    return Object.entries(unpaidInvoicesByCustomer)
      .filter(([_, invoices]) => invoices.length > 1)
      .map(([customerId]) => {
        const customer = customers.find((c) => c.id === customerId);
        return {
          id: customerId,
          name: customer
            ? `${customer.firstName} ${customer.lastName}`
            : "Unknown Customer",
        };
      });
  }, [invoices, customers]);

  const handleInvoiceClick = (id: string) => {
    setSelectedInvoiceId(id);
    setIsDetailOpen(true);
  };

  const handleMarkAsPaid = async (id: string) => {
    try {
      await markInvoiceAsPaid(id);
      toast({
        title: "Invoice updated",
        description: "Invoice has been marked as paid.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update invoice status.",
      });
    }
  };

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setInvoiceToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!invoiceToDelete) return;

    setIsDeleting(true);
    try {
      await deleteInvoice(invoiceToDelete);
      setIsDeleteDialogOpen(false);
      toast({
        title: "Invoice deleted",
        description: "Invoice has been deleted successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete invoice.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMergeInvoices = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setIsMergeDialogOpen(true);
  };

  const handlePaymentHistoryClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedInvoiceId(id);
    setIsPaymentHistoryOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">
            Manage your invoices and payments
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          {customerWithMultipleUnpaidInvoices.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Merge className="mr-2 h-4 w-4" />
                  Merge Invoices
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {customerWithMultipleUnpaidInvoices.map((customer) => (
                  <DropdownMenuItem
                    key={customer.id}
                    onClick={() => handleMergeInvoices(customer.id)}
                  >
                    {customer.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Invoice
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="all" className="flex-1 sm:flex-initial">
              All
            </TabsTrigger>
            <TabsTrigger value="paid" className="flex-1 sm:flex-initial">
              Paid
            </TabsTrigger>
            <TabsTrigger value="unpaid" className="flex-1 sm:flex-initial">
              Unpaid
            </TabsTrigger>
          </TabsList>

          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search invoices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-full"
            />
          </div>
        </div>

        <TabsContent value="all" className="mt-0">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>All Invoices</CardTitle>
              <CardDescription>
                View and manage all your invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InvoiceTable
                invoices={filteredInvoices}
                loading={loading.invoices}
                onMarkAsPaid={handleMarkAsPaid}
                onInvoiceClick={handleInvoiceClick}
                onDeleteClick={handleDeleteClick}
                handlePaymentHistoryClick={handlePaymentHistoryClick}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="paid" className="mt-0">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Paid Invoices</CardTitle>
              <CardDescription>View all paid invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <InvoiceTable
                invoices={filteredInvoices}
                loading={loading.invoices}
                onMarkAsPaid={handleMarkAsPaid}
                onInvoiceClick={handleInvoiceClick}
                onDeleteClick={handleDeleteClick}
                handlePaymentHistoryClick={handlePaymentHistoryClick}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unpaid" className="mt-0">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Unpaid Invoices</CardTitle>
              <CardDescription>View all unpaid invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <InvoiceTable
                invoices={filteredInvoices}
                loading={loading.invoices}
                onMarkAsPaid={handleMarkAsPaid}
                onInvoiceClick={handleInvoiceClick}
                onDeleteClick={handleDeleteClick}
                handlePaymentHistoryClick={handlePaymentHistoryClick}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <InvoiceDetail
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        invoiceId={selectedInvoiceId}
      />
      <CreateInvoiceDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
      <MergeInvoicesDialog
        open={isMergeDialogOpen}
        onOpenChange={setIsMergeDialogOpen}
        customerId={selectedCustomerId}
      />
      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Invoice"
        description="Are you sure you want to delete this invoice? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />
      <PaymentHistoryDialog
        open={isPaymentHistoryOpen}
        onOpenChange={setIsPaymentHistoryOpen}
        invoiceId={selectedInvoiceId}
      />
    </div>
  );
}

function InvoiceTable({
  invoices,
  loading,
  onMarkAsPaid,
  onInvoiceClick,
  onDeleteClick,
  handlePaymentHistoryClick,
}: {
  invoices: any[];
  loading: boolean;
  onMarkAsPaid: (id: string) => void;
  onInvoiceClick: (id: string) => void;
  onDeleteClick: (id: string, e: React.MouseEvent) => void;
  handlePaymentHistoryClick: (id: string, e: React.MouseEvent) => void;
}) {
  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice ID</TableHead>
            <TableHead className="hidden md:table-cell">Customer</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead className="hidden sm:table-cell">Date</TableHead>
            <TableHead className="hidden md:table-cell">Paid Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            // Loading skeleton
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={`loading-${index}`}>
                <TableCell>
                  <Skeleton className="h-4 w-[80px]" />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Skeleton className="h-4 w-[150px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[80px]" />
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Skeleton className="h-4 w-[100px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[80px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[100px] ml-auto" />
                </TableCell>
              </TableRow>
            ))
          ) : invoices.length > 0 ? (
            invoices.map((invoice) => (
              <TableRow
                key={invoice.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onInvoiceClick(invoice.id || "")}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground md:hidden" />
                    {invoice.invoiceId}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {invoice.customer}
                </TableCell>
                <TableCell>₹{invoice.amount.toFixed(2)}</TableCell>
                <TableCell className="hidden sm:table-cell">
                  {invoice.date}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {invoice.paidDate ||
                    (invoice.status === "paid" ? "Unknown" : "-")}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      invoice.status === "paid" ? "default" : "destructive"
                    }
                  >
                    {invoice.status === "paid" ? "Paid" : "Unpaid"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) =>
                        handlePaymentHistoryClick(invoice.id || "", e)
                      }
                    >
                      <span className="hidden sm:inline">Payments</span>
                      <span className="sm:hidden">Pay</span>
                    </Button>
                    {invoice.status === "unpaid" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMarkAsPaid(invoice.id || "");
                        }}
                      >
                        <span className="hidden sm:inline">Mark Paid</span>
                        <span className="sm:hidden">Pay</span>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={(e) => onDeleteClick(invoice.id || "", e)}
                    >
                      <span className="hidden sm:inline">Delete</span>
                      <Trash2 className="h-4 w-4 sm:hidden" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No invoices found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
