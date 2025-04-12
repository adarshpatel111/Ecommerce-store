"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useStore, type Invoice, type Customer } from "@/context/store-context";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface InvoiceDetailProps {
  invoiceId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InvoiceDetail({
  invoiceId,
  open,
  onOpenChange,
}: InvoiceDetailProps) {
  const { invoices, customers, products, markInvoiceAsPaid } = useStore();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [invoiceItems, setInvoiceItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoiceDetails = async () => {
      if (!invoiceId) return;

      setLoading(true);

      try {
        // Find the invoice in our store
        const foundInvoice = invoices.find((inv) => inv.id === invoiceId);

        if (foundInvoice) {
          setInvoice(foundInvoice);

          // Find the customer
          const foundCustomer = customers.find(
            (c) => c.id === foundInvoice.customerId
          );
          if (foundCustomer) {
            setCustomer(foundCustomer);
          } else {
            // Try to fetch from Firestore directly if not in store
            const customerDoc = await getDoc(
              doc(db, "customers", foundInvoice.customerId)
            );
            if (customerDoc.exists()) {
              setCustomer({
                id: customerDoc.id,
                ...customerDoc.data(),
              } as Customer);
            }
          }

          // Fetch invoice items
          const invoiceItemsRef = doc(db, "invoiceItems", invoiceId);
          const invoiceItemsDoc = await getDoc(invoiceItemsRef);

          if (invoiceItemsDoc.exists()) {
            const items = invoiceItemsDoc.data()?.items || [];

            // Enrich with product details
            const enrichedItems = items.map((item: any) => {
              const product = products.find((p) => p.id === item.productId);
              return {
                ...item,
                productName: product?.name || "Unknown Product",
                productPrice: product?.price || 0,
              };
            });

            setInvoiceItems(enrichedItems);
          } else {
            // For demo purposes, create some sample items
            setInvoiceItems([
              {
                id: "1",
                productId: "sample-1",
                productName: "Product 1",
                quantity: 2,
                price: 49.99,
                total: 99.98,
              },
              {
                id: "2",
                productId: "sample-2",
                productName: "Product 2",
                quantity: 1,
                price: 149.99,
                total: 149.99,
              },
            ]);
          }
        }
      } catch (error) {
        console.error("Error fetching invoice details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoiceDetails();
  }, [invoiceId, invoices, customers, products]);

  const handleMarkAsPaid = async () => {
    if (invoice?.id) {
      await markInvoiceAsPaid(invoice.id);
      setInvoice({ ...invoice, status: "paid" });
    }
  };

  if (!invoice) {
    return null;
  }

  // Calculate totals
  const subtotal = invoiceItems.reduce(
    (sum, item) => sum + (item.total || 0),
    0
  );
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  // Generate invoice number (in a real app, this would come from the database)
  const invoiceNumber =
    invoice.invoiceId || `INV-${Math.floor(100000 + Math.random() * 900000)}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Invoice {invoiceNumber}</DialogTitle>
          <DialogDescription>
            {new Date(invoice.date).toLocaleDateString()} -
            <Badge
              variant={invoice.status === "paid" ? "default" : "destructive"}
              className="ml-2"
            >
              {invoice.status === "paid" ? "Paid" : "Unpaid"}
            </Badge>
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center p-6">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  From
                </h3>
                <div className="mt-1">
                  <p className="font-medium">BusinessPro Inc.</p>
                  <p className="text-sm text-muted-foreground">
                    123 Business Street
                  </p>
                  <p className="text-sm text-muted-foreground">
                    New York, NY 10001
                  </p>
                  <p className="text-sm text-muted-foreground">
                    contact@businesspro.com
                  </p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Bill To
                </h3>
                <div className="mt-1">
                  <p className="font-medium">
                    {customer
                      ? `${customer.firstName} ${customer.lastName}`
                      : invoice.customer}
                  </p>
                  {customer && (
                    <>
                      <p className="text-sm text-muted-foreground">
                        {customer.email}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {customer.phone || "No phone provided"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {customer.address || "No address provided"}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Invoice Details */}
            <div>
              <h3 className="mb-3 font-medium">Invoice Details</h3>
              <div className="rounded-md border">
                <table className="min-w-full divide-y divide-border">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                        Item
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        Qty
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        Price
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {invoiceItems.map((item, index) => (
                      <tr key={item.id || index}>
                        <td className="px-4 py-3 text-sm">
                          {item.productName}
                        </td>
                        <td className="px-4 py-3 text-right text-sm">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-right text-sm">
                          ${item.price?.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right text-sm">
                          ${item.total?.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td
                        colSpan={3}
                        className="px-4 py-2 text-right text-sm font-medium"
                      >
                        Subtotal
                      </td>
                      <td className="px-4 py-2 text-right text-sm">
                        ${subtotal.toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td
                        colSpan={3}
                        className="px-4 py-2 text-right text-sm font-medium"
                      >
                        Tax (10%)
                      </td>
                      <td className="px-4 py-2 text-right text-sm">
                        ${tax.toFixed(2)}
                      </td>
                    </tr>
                    <tr className="bg-muted/50">
                      <td
                        colSpan={3}
                        className="px-4 py-2 text-right text-sm font-bold"
                      >
                        Total
                      </td>
                      <td className="px-4 py-2 text-right text-sm font-bold">
                        ${total.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <div>
                  <h3 className="text-sm font-medium">Payment Details</h3>
                  <p className="text-sm text-muted-foreground">
                    Payment due by:{" "}
                    {format(new Date(invoice.date), "MMM dd, yyyy")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    Invoice #: {invoiceNumber}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Date: {format(new Date(invoice.date), "MMM dd, yyyy")}
                  </p>
                </div>
              </div>

              <div className="rounded-md bg-muted/50 p-4 text-sm">
                <p className="font-medium">Thank you for your business!</p>
                <p className="text-muted-foreground">
                  This is a computer-generated invoice. No signature is
                  required.
                </p>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="flex items-center justify-between">
          <Button variant="outline" onClick={() => window.print()}>
            Print Invoice
          </Button>

          {invoice.status === "unpaid" && (
            <Button onClick={handleMarkAsPaid}>Mark as Paid</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
