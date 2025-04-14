"use client";

import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { useReactToPrint } from "react-to-print";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  useStore,
  type Invoice,
  type Customer,
  type InvoiceItem,
} from "@/context/store-context";
import { Printer } from "lucide-react";

interface InvoiceDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: string | null;
}

export function InvoiceDetail({
  open,
  onOpenChange,
  invoiceId,
}: InvoiceDetailProps) {
  const { invoices, customers, getInvoiceItems, markInvoiceAsPaid } =
    useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [invoiceDetails, setInvoiceDetails] = useState<{
    invoice: Invoice | null;
    customer: Customer | null;
    items: InvoiceItem[];
  }>({
    invoice: null,
    customer: null,
    items: [],
  });

  const componentRef = useRef<HTMLDivElement>(null);

  // Fetch invoice data
  useEffect(() => {
    const fetchInvoiceDetails = async () => {
      if (!invoiceId) return;

      setIsLoading(true);
      try {
        const invoice = invoices.find((inv) => inv.id === invoiceId);
        if (!invoice) return;

        const customer = customers.find((c) => c.id === invoice.customerId);
        const items = await getInvoiceItems(invoiceId);

        setInvoiceDetails({
          invoice,
          customer: customer || null,
          items,
        });
      } catch (error) {
        console.error("Error fetching invoice details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoiceDetails();
  }, [invoiceId, invoices, customers, getInvoiceItems]);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Invoice-${invoiceDetails.invoice?.invoiceId || ""}`,
    onAfterPrint: () => console.log("Printed successfully"),
  });

  const handleMarkAsPaid = async () => {
    if (invoiceId) {
      setIsLoading(true);
      try {
        await markInvoiceAsPaid(invoiceId);
        // Update local state
        if (invoiceDetails.invoice) {
          setInvoiceDetails({
            ...invoiceDetails,
            invoice: {
              ...invoiceDetails.invoice,
              status: "paid",
            },
          });
        }
      } catch (error) {
        console.error("Error marking invoice as paid:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!invoiceDetails.invoice || !invoiceDetails.customer) {
    return null;
  }

  const { invoice, customer, items } = invoiceDetails;
  const subtotal = items.reduce((total, item) => total + item.subtotal, 0);
  const tax = subtotal * 0.18; // 18% GST
  const total = subtotal + tax;

  // Format date properly
  const invoiceDate = format(new Date(invoice.date), "MMMM dd, yyyy");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl overflow-auto max-h-[95vh]">
        <DialogHeader className="no-print">
          <DialogTitle>Invoice #{invoice.invoiceId}</DialogTitle>
          <DialogDescription>Generated on {invoiceDate}</DialogDescription>
        </DialogHeader>

        <div ref={componentRef} className="invoice-container py-4">
          {/* Header */}
          <div className="flex justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">INVOICE</h2>
              <p className="text-muted-foreground">{invoiceDate}</p>
            </div>
            <div className="text-right">
              <div className="font-bold text-lg">BusinessPro Inc.</div>
              <p className="text-sm text-muted-foreground">
                123 Commerce St.
                <br />
                Business City, BZ 12345
                <br />
                contact@businesspro.com
              </p>
            </div>
          </div>

          {/* Invoice ID and Status */}
          <div className="flex justify-between mb-6">
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Invoice Number
              </div>
              <div className="font-medium">{invoice.invoiceId}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-muted-foreground">
                Status
              </div>
              <div
                className={`font-medium ${
                  invoice.status === "paid" ? "text-green-600" : "text-red-600"
                }`}
              >
                {invoice.status === "paid" ? "Paid" : "Unpaid"}
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="mb-8 p-4 border rounded-md bg-muted/20 print:bg-transparent print:border-none">
            <div className="text-sm font-medium mb-2">Bill To:</div>
            <div className="font-bold text-lg">
              {customer.firstName} {customer.lastName}
            </div>
            <div className="text-muted-foreground">{customer.email}</div>
            {customer.phone && (
              <div className="text-muted-foreground">{customer.phone}</div>
            )}
            {customer.address && (
              <div className="text-muted-foreground">{customer.address}</div>
            )}
          </div>

          {/* Invoice Items */}
          <div className="mb-8">
            <div className="grid grid-cols-12 font-medium bg-muted p-2 rounded-t-md print:bg-transparent print:border-b">
              <div className="col-span-6">Item</div>
              <div className="col-span-2 text-right">Quantity</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-2 text-right">Total</div>
            </div>
            <div className="border-x border-b rounded-b-md print:border-x-0">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 p-3 border-b last:border-b-0"
                >
                  <div className="col-span-6">
                    <div className="font-medium">{item.productName}</div>
                  </div>
                  <div className="col-span-2 text-right">{item.quantity}</div>
                  <div className="col-span-2 text-right">
                    ₹{item.price.toFixed(2)}
                  </div>
                  <div className="col-span-2 text-right font-medium">
                    ₹{item.subtotal.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-64">
              <div className="flex justify-between py-2">
                <div className="text-muted-foreground">Subtotal</div>
                <div className="font-medium">₹{subtotal.toFixed(2)}</div>
              </div>
              <div className="flex justify-between py-2">
                <div className="text-muted-foreground">GST (18%)</div>
                <div className="font-medium">₹{tax.toFixed(2)}</div>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between py-2 font-bold">
                <div>Total</div>
                <div>₹{total.toFixed(2)}</div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-4 text-sm text-muted-foreground">
            <p className="font-medium mb-1">Notes:</p>
            <p>Thank you for your business. Payment is due within 30 days.</p>
            <p>
              This is a computer-generated invoice, no signature is required.
            </p>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 no-print">
          {invoice.status === "unpaid" && (
            <Button
              onClick={handleMarkAsPaid}
              className="w-full sm:w-auto"
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Mark as Paid"}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handlePrint}
            className="w-full sm:w-auto"
          >
            <Printer className="mr-2 h-4 w-4" />
            Print Invoice
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
