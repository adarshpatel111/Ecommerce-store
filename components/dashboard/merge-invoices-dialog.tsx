"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  useStore,
  type Invoice,
  type Customer,
  type InvoiceItem,
} from "@/context/store-context";

interface MergeInvoicesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string | null;
}

export function MergeInvoicesDialog({
  open,
  onOpenChange,
  customerId,
}: MergeInvoicesDialogProps) {
  const { toast } = useToast();
  const { invoices, customers, getInvoiceItems, addInvoice, deleteInvoice } =
    useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [customerInvoices, setCustomerInvoices] = useState<Invoice[]>([]);
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [invoiceItems, setInvoiceItems] = useState<
    Record<string, InvoiceItem[]>
  >({});
  const [customer, setCustomer] = useState<Customer | null>(null);

  // Load customer and their unpaid invoices
  useEffect(() => {
    const loadData = async () => {
      if (!open || !customerId) return;

      setIsLoading(true);
      try {
        // Find customer
        const foundCustomer = customers.find((c) => c.id === customerId);
        setCustomer(foundCustomer || null);

        // Find all unpaid invoices for this customer
        const unpaidInvoices = invoices.filter(
          (invoice) =>
            invoice.customerId === customerId && invoice.status === "unpaid"
        );
        setCustomerInvoices(unpaidInvoices);

        // Reset selected invoices
        setSelectedInvoices([]);

        // Load invoice items for each invoice
        const items: Record<string, InvoiceItem[]> = {};
        for (const invoice of unpaidInvoices) {
          if (invoice.id) {
            items[invoice.id] = await getInvoiceItems(invoice.id);
          }
        }
        setInvoiceItems(items);
      } catch (error) {
        console.error("Error loading customer invoices:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [open, customerId, customers, invoices, getInvoiceItems]);

  const handleInvoiceSelect = (invoiceId: string) => {
    setSelectedInvoices((prev) => {
      if (prev.includes(invoiceId)) {
        return prev.filter((id) => id !== invoiceId);
      } else {
        return [...prev, invoiceId];
      }
    });
  };

  const calculateTotal = () => {
    return selectedInvoices.reduce((total, invoiceId) => {
      const invoice = customerInvoices.find((inv) => inv.id === invoiceId);
      return total + (invoice?.amount || 0);
    }, 0);
  };

  const handleMergeInvoices = async () => {
    if (selectedInvoices.length < 2 || !customer) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select at least two invoices to merge.",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Generate new invoice ID
      const invoiceId = `INV-M${Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0")}`;

      // Collect all items from selected invoices
      const allItems: InvoiceItem[] = [];
      for (const id of selectedInvoices) {
        if (invoiceItems[id]) {
          allItems.push(...invoiceItems[id]);
        }
      }

      // Create merged invoice
      const mergedInvoice: Invoice = {
        invoiceId,
        customer: `${customer.firstName} ${customer.lastName}`,
        customerId: customer.id || "",
        amount: calculateTotal(),
        status: "unpaid",
        date: new Date().toISOString().split("T")[0],
      };

      // Add merged invoice
      await addInvoice(
        mergedInvoice,
        allItems.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.subtotal,
        }))
      );

      // Delete old invoices
      for (const id of selectedInvoices) {
        await deleteInvoice(id);
      }

      // Close dialog and show success message
      onOpenChange(false);
      toast({
        title: "Invoices merged",
        description: `${selectedInvoices.length} invoices have been merged successfully.`,
      });
    } catch (error) {
      console.error("Error merging invoices:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to merge invoices. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!customer) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Merge Invoices</DialogTitle>
          <DialogDescription>
            Select multiple unpaid invoices for {customer.firstName}{" "}
            {customer.lastName} to merge them into a single invoice.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {customerInvoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              This customer has no unpaid invoices to merge.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm font-medium">
                Select invoices to merge:
              </div>

              {customerInvoices.map((invoice) => (
                <div key={invoice.id} className="border rounded-md p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id={invoice.id}
                      checked={selectedInvoices.includes(invoice.id || "")}
                      onCheckedChange={() =>
                        handleInvoiceSelect(invoice.id || "")
                      }
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor={invoice.id}
                        className="font-medium cursor-pointer"
                      >
                        {invoice.invoiceId} - ₹{invoice.amount.toFixed(2)}
                      </Label>
                      <div className="text-sm text-muted-foreground">
                        Date: {format(new Date(invoice.date), "MMMM dd, yyyy")}
                      </div>

                      {/* Show invoice items */}
                      {invoice.id && invoiceItems[invoice.id] && (
                        <div className="mt-2 text-sm">
                          <div className="font-medium">Items:</div>
                          <ul className="list-disc list-inside text-muted-foreground">
                            {invoiceItems[invoice.id].map((item, idx) => (
                              <li key={idx}>
                                {item.productName} x {item.quantity} (₹
                                {item.subtotal.toFixed(2)})
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {selectedInvoices.length > 0 && (
                <div className="mt-6 border-t pt-4">
                  <div className="flex justify-between font-medium">
                    <span>Selected Invoices:</span>
                    <span>{selectedInvoices.length}</span>
                  </div>
                  <div className="flex justify-between font-bold mt-2">
                    <span>Total Amount:</span>
                    <span>₹{calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleMergeInvoices}
            disabled={isLoading || selectedInvoices.length < 2}
          >
            {isLoading ? "Processing..." : "Merge Invoices"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
