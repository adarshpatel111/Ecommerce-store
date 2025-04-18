"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useStore, type Product, type Invoice } from "@/context/store-context";

interface CreateInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateInvoiceDialog({
  open,
  onOpenChange,
}: CreateInvoiceDialogProps) {
  const { toast } = useToast();
  const { customers, products, addInvoice } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  const [invoiceItems, setInvoiceItems] = useState<
    Array<{
      productId: string;
      productName: string;
      quantity: number;
      price: number;
      subtotal: number;
    }>
  >([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);

  // Filter out products with zero stock
  useEffect(() => {
    setAvailableProducts(products.filter((product) => product.stock > 0));
  }, [products]);

  const handleAddItem = () => {
    setInvoiceItems([
      ...invoiceItems,
      {
        productId: "",
        productName: "",
        quantity: 1,
        price: 0,
        subtotal: 0,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
  };

  const handleProductChange = (index: number, productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const updatedItems = [...invoiceItems];
    updatedItems[index] = {
      productId,
      productName: product.name,
      quantity: 1,
      price: product.price,
      subtotal: product.price,
    };
    setInvoiceItems(updatedItems);
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    const updatedItems = [...invoiceItems];
    const item = updatedItems[index];

    // Find the product to check stock
    const product = products.find((p) => p.id === item.productId);
    if (!product) return;

    // Ensure quantity doesn't exceed stock
    const validQuantity = Math.min(Math.max(1, quantity), product.stock);

    updatedItems[index] = {
      ...item,
      quantity: validQuantity,
      subtotal: item.price * validQuantity,
    };
    setInvoiceItems(updatedItems);
  };

  const calculateTotal = () => {
    return invoiceItems.reduce((total, item) => total + item.subtotal, 0);
  };

  const handleSubmit = async () => {
    // Validation
    if (!selectedCustomer) {
      toast({
        variant: "destructive",
        title: "Customer required",
        description: "Please select a customer for this invoice.",
      });
      return;
    }

    if (
      invoiceItems.length === 0 ||
      invoiceItems.some((item) => !item.productId)
    ) {
      toast({
        variant: "destructive",
        title: "Products required",
        description: "Please add at least one product to the invoice.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const customer = customers.find((c) => c.id === selectedCustomer);
      if (!customer) throw new Error("Customer not found");

      // Generate invoice ID (in a real app, this would be more sophisticated)
      const invoiceId = `INV-${Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0")}`;

      // Create invoice object
      const invoice: Invoice = {
        invoiceId,
        customer: `${customer.firstName} ${customer.lastName}`,
        customerId: selectedCustomer,
        amount: calculateTotal(),
        status: "unpaid",
        paidDate: "",
        date: new Date().toISOString().split("T")[0],
      };

      // Create invoice items
      const items = invoiceItems.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal,
      }));

      // Add invoice to database
      await addInvoice(invoice, items);

      // Reset form
      setSelectedCustomer("");
      setInvoiceItems([]);

      // Close dialog and show success message
      onOpenChange(false);
      toast({
        title: "Invoice created",
        description: `Invoice ${invoiceId} has been created successfully.`,
      });
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create invoice. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Invoice</DialogTitle>
          <DialogDescription>
            Create an invoice for a customer with product details.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Customer Selection */}
          <div className="space-y-2">
            <Label htmlFor="customer">Customer</Label>
            <Select
              value={selectedCustomer}
              onValueChange={setSelectedCustomer}
            >
              <SelectTrigger id="customer">
                <SelectValue placeholder="Select a customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id || ""}>
                    {customer.firstName} {customer.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Invoice Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Invoice Items</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddItem}
              >
                <Plus className="mr-1 h-3 w-3" /> Add Item
              </Button>
            </div>

            {invoiceItems.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No items added. Click "Add Item" to add products to this
                invoice.
              </div>
            ) : (
              <div className="space-y-4">
                {/* Header */}
                <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground px-2">
                  <div className="col-span-5">Product</div>
                  <div className="col-span-2">Quantity</div>
                  <div className="col-span-2">Price</div>
                  <div className="col-span-2">Total</div>
                  <div className="col-span-1"></div>
                </div>

                {/* Items */}
                {invoiceItems.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-2 items-center"
                  >
                    <div className="col-span-5">
                      <Select
                        value={item.productId}
                        onValueChange={(value) =>
                          handleProductChange(index, value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a product" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableProducts.map((product) => (
                            <SelectItem
                              key={product.id}
                              value={product.id || ""}
                            >
                              {product.name} ({product.stock} in stock)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        min="1"
                        max={
                          products.find((p) => p.id === item.productId)
                            ?.stock || 1
                        }
                        value={item.quantity}
                        onChange={(e) =>
                          handleQuantityChange(
                            index,
                            Number.parseInt(e.target.value)
                          )
                        }
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="text"
                        value={`₹${item.price.toFixed(2)}`}
                        disabled
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="text"
                        value={`₹${item.subtotal.toFixed(2)}`}
                        disabled
                      />
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(index)}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                ))}

                {/* Total */}
                <div className="flex justify-end pt-4 border-t">
                  <div className="w-1/3 flex justify-between items-center">
                    <span className="font-medium">Total:</span>
                    <span className="text-lg font-bold">
                      ₹{calculateTotal().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || invoiceItems.length === 0}
          >
            {isLoading ? "Creating..." : "Create Invoice"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
