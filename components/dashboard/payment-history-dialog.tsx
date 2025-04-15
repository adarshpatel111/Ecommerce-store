"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useStore } from "@/context/store-context";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PaymentHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: string | null;
}

export function PaymentHistoryDialog({
  open,
  onOpenChange,
  invoiceId,
}: PaymentHistoryDialogProps) {
  const { toast } = useToast();
  const {
    invoices,
    addPayment,
    getPaymentHistory,
    customers,
    updateWalletBalance,
  } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [payments, setPayments] = useState<any[]>([]);
  const [invoice, setInvoice] = useState<any>(null);
  const [remainingAmount, setRemainingAmount] = useState(0);
  const [formData, setFormData] = useState({
    amount: "",
    method: "cash",
    reference: "",
    notes: "",
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    if (open && invoiceId) {
      loadData();
    } else {
      // Reset form when dialog closes
      setFormData({
        amount: "",
        method: "cash",
        reference: "",
        notes: "",
        date: new Date().toISOString().split("T")[0],
      });
    }
  }, [open, invoiceId]);

  const loadData = async () => {
    if (!invoiceId) return;

    setIsLoading(true);
    try {
      // Get invoice details
      const inv = invoices.find((i) => i.id === invoiceId);
      setInvoice(inv);

      // Get payment history
      const paymentHistory = await getPaymentHistory(invoiceId);
      setPayments(paymentHistory);

      // Calculate remaining amount
      const totalPaid = paymentHistory.reduce(
        (sum, payment) => sum + payment.amount,
        0
      );
      const remaining = inv ? inv.amount - totalPaid : 0;
      setRemainingAmount(remaining);

      // Set default amount to remaining amount
      setFormData((prev) => ({
        ...prev,
        amount: remaining > 0 ? remaining.toString() : "",
      }));
    } catch (error) {
      console.error("Error loading payment data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load payment history.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMethodChange = (value: string) => {
    setFormData((prev) => ({ ...prev, method: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!invoiceId) throw new Error("Invoice ID is missing");

      const amount = Number.parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Please enter a valid amount");
      }

      // If payment method is wallet, check if customer has enough balance
      if (formData.method === "wallet") {
        const customer = customers.find((c) => c.id === invoice.customerId);
        if (!customer) throw new Error("Customer not found");

        const walletBalance = customer.walletBalance || 0;
        if (walletBalance < amount) {
          throw new Error(
            `Insufficient wallet balance. Available: ₹${walletBalance.toFixed(
              2
            )}`
          );
        }

        // Deduct from wallet balance
        await updateWalletBalance(invoice.customerId, -amount);
      }

      // Add payment
      await addPayment({
        invoiceId,
        amount,
        method: formData.method,
        reference: formData.reference,
        notes: formData.notes,
        date: formData.date,
      });

      // Reload data
      await loadData();

      toast({
        title: "Payment added",
        description: "Payment has been recorded successfully.",
      });

      // Reset form except date
      setFormData((prev) => ({
        ...prev,
        amount: remainingAmount > 0 ? remainingAmount.toString() : "",
        reference: "",
        notes: "",
      }));
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add payment.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Payment History</DialogTitle>
          <DialogDescription>
            {invoice ? (
              <>
                Invoice #{invoice.invoiceId} - {invoice.customer} - ₹
                {invoice.amount.toFixed(2)}
              </>
            ) : (
              "Loading invoice details..."
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Payment History Table */}
          <div>
            <h3 className="text-lg font-medium">Payment History</h3>
            <div className="mt-2 rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Reference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.length > 0 ? (
                    payments.map((payment, index) => (
                      <TableRow key={payment.id || index}>
                        <TableCell>{payment.date}</TableCell>
                        <TableCell>₹{payment.amount.toFixed(2)}</TableCell>
                        <TableCell className="capitalize">
                          {payment.method}
                        </TableCell>
                        <TableCell>{payment.reference || "-"}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4">
                        No payments recorded yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {remainingAmount > 0 && (
              <p className="mt-2 text-sm text-muted-foreground">
                Remaining amount:{" "}
                <span className="font-medium">
                  ₹{remainingAmount.toFixed(2)}
                </span>
              </p>
            )}
          </div>

          {/* Add Payment Form */}
          {invoice?.status === "unpaid" && (
            <form onSubmit={handleSubmit} className="space-y-4 border-t pt-4">
              <h3 className="text-lg font-medium">Add Payment</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Payment Date</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="method">Payment Method</Label>
                <Select
                  value={formData.method}
                  onValueChange={handleMethodChange}
                >
                  <SelectTrigger id="method">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="wallet">Wallet Balance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reference">Reference Number (Optional)</Label>
                <Input
                  id="reference"
                  name="reference"
                  placeholder="Transaction ID, Cheque Number, etc."
                  value={formData.reference}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Additional information about this payment"
                  value={formData.notes}
                  onChange={handleChange}
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading || remainingAmount <= 0}
              >
                {isLoading ? "Adding Payment..." : "Add Payment"}
              </Button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
