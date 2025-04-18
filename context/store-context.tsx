"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  onSnapshot,
  Timestamp,
  increment as firestoreIncrement,
  serverTimestamp,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// Define types for our data
export type Product = {
  id?: string;
  name: string;
  price: number;
  stock: number;
  status: string;
  description?: string;
  image?: string;
  createdAt?: Timestamp;
};

// Add wallet balance to the Customer type
export type Customer = {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  orders?: number;
  totalSpent?: number;
  walletBalance?: number;
  createdAt?: Timestamp;
};

export type Invoice = {
  id?: string;
  invoiceId: string;
  customer: string;
  customerId: string;
  amount: number;
  status: "paid" | "unpaid";
  date: string;
  paidDate: string;
  createdAt?: Timestamp;
};

export type InvoiceItem = {
  id?: string;
  invoiceId: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
  createdAt?: Timestamp;
};

// Add these types to the existing types
export type Payment = {
  id?: string;
  invoiceId: string;
  amount: number;
  method: string;
  reference?: string;
  notes?: string;
  date: string;
  createdAt?: Timestamp;
};

// Define the context type
type StoreContextType = {
  products: Product[];
  customers: Customer[];
  invoices: Invoice[];
  invoiceItems: InvoiceItem[];
  loading: {
    products: boolean;
    customers: boolean;
    invoices: boolean;
    invoiceItems: boolean;
    payments: boolean;
  };
  addProduct: (product: Product) => Promise<string>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addCustomer: (customer: Customer) => Promise<string>;
  updateCustomer: (id: string, customer: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  addInvoice: (
    invoice: Invoice,
    items: Omit<InvoiceItem, "invoiceId" | "createdAt">[]
  ) => Promise<string>;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  markInvoiceAsPaid: (id: string, paidDate: string) => Promise<void>;
  getInvoiceItems: (invoiceId: string) => Promise<InvoiceItem[]>;
  getCustomerInvoices: (customerId: string) => Promise<Invoice[]>;
  getRecentInvoices: (limit?: number) => Invoice[];
  getUnpaidInvoices: (limit?: number) => Invoice[];
  getLowStockProducts: (threshold?: number) => Product[];
  // Add these functions to the StoreContextType interface
  addPayment: (payment: Omit<Payment, "createdAt">) => Promise<string>;
  updateWalletBalance: (
    customerId: string,
    amount: number
  ) => Promise<{ success: boolean }>;
};

// Create the context
const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Create a provider component
export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  // Add these state variables to the StoreProvider component
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState({
    products: true,
    customers: true,
    invoices: true,
    invoiceItems: true,
    payments: true,
  });

  // Fetch data on mount
  useEffect(() => {
    // For demo purposes, let's add some initial data if collections are empty
    const initializeData = async () => {
      try {
        // Check if products collection is empty
        const productsSnapshot = await getDocs(collection(db, "products"));
        if (productsSnapshot.empty) {
          // Add some demo products
          const demoProducts: Product[] = [
            {
              name: "Wireless Headphones",
              price: 129.99,
              stock: 45,
              status: "In Stock",
              description:
                "Premium wireless headphones with noise cancellation",
              image: "/placeholder.svg?height=40&width=40",
              createdAt: Timestamp.now(),
            },
            {
              name: "Smart Watch",
              price: 199.99,
              stock: 12,
              status: "Low Stock",
              description: "Fitness tracker with heart rate monitoring",
              image: "/placeholder.svg?height=40&width=40",
              createdAt: Timestamp.now(),
            },
            {
              name: "Bluetooth Speaker",
              price: 79.99,
              stock: 0,
              status: "Out of Stock",
              description:
                "Portable waterproof speaker with 20-hour battery life",
              image: "/placeholder.svg?height=40&width=40",
              createdAt: Timestamp.now(),
            },
            {
              name: "Laptop Stand",
              price: 49.99,
              stock: 35,
              status: "In Stock",
              description:
                "Adjustable aluminum laptop stand for better ergonomics",
              image: "/placeholder.svg?height=40&width=40",
              createdAt: Timestamp.now(),
            },
            {
              name: "Wireless Charger",
              price: 29.99,
              stock: 8,
              status: "Low Stock",
              description:
                "Fast wireless charging pad compatible with all Qi devices",
              image: "/placeholder.svg?height=40&width=40",
              createdAt: Timestamp.now(),
            },
          ];

          for (const product of demoProducts) {
            await addDoc(collection(db, "products"), product);
          }
        }

        // Check if customers collection is empty
        const customersSnapshot = await getDocs(collection(db, "customers"));
        if (customersSnapshot.empty) {
          // Add some demo customers
          const demoCustomers: Customer[] = [
            {
              firstName: "John",
              lastName: "Doe",
              email: "john.doe@example.com",
              phone: "+1 (555) 123-4567",
              address: "123 Main St, Anytown, CA 12345",
              orders: 12,
              totalSpent: 1245.89,
              walletBalance: 100,
              createdAt: Timestamp.now(),
            },
            {
              firstName: "Jane",
              lastName: "Smith",
              email: "jane.smith@example.com",
              phone: "+1 (555) 987-6543",
              address: "456 Oak Ave, Somewhere, NY 67890",
              orders: 8,
              totalSpent: 879.5,
              walletBalance: 50,
              createdAt: Timestamp.now(),
            },
            {
              firstName: "Robert",
              lastName: "Johnson",
              email: "robert.j@example.com",
              phone: "+1 (555) 456-7890",
              address: "789 Pine Rd, Nowhere, TX 54321",
              orders: 5,
              totalSpent: 432.25,
              walletBalance: 25,
              createdAt: Timestamp.now(),
            },
          ];

          const customerRefs = [];
          for (const customer of demoCustomers) {
            const docRef = await addDoc(collection(db, "customers"), customer);
            customerRefs.push({
              id: docRef.id,
              name: `${customer.firstName} ${customer.lastName}`,
            });
          }

          // Check if invoices collection is empty
          const invoicesSnapshot = await getDocs(collection(db, "invoices"));
          if (invoicesSnapshot.empty && customerRefs.length > 0) {
            // Add some demo invoices
            const demoInvoices = [
              {
                invoiceId: "INV-001",
                customer: customerRefs[0].name,
                customerId: customerRefs[0].id,
                amount: 249.99,
                status: "paid",
                date: new Date().toISOString().split("T")[0],
                createdAt: Timestamp.now(),
              },
              {
                invoiceId: "INV-002",
                customer: customerRefs[1].name,
                customerId: customerRefs[1].id,
                amount: 189.5,
                status: "unpaid",
                date: new Date().toISOString().split("T")[0],
                createdAt: Timestamp.now(),
              },
              {
                invoiceId: "INV-003",
                customer: customerRefs[2].name,
                customerId: customerRefs[2].id,
                amount: 99.99,
                status: "paid",
                date: new Date().toISOString().split("T")[0],
                createdAt: Timestamp.now(),
              },
            ];

            // Get product IDs
            const productsQuery = await getDocs(collection(db, "products"));
            const productDocs = productsQuery.docs.map((doc) => ({
              id: doc.id,
              ...(doc.data() as Product),
            }));

            for (const invoice of demoInvoices) {
              // Add invoice
              const invoiceRef = await addDoc(
                collection(db, "invoices"),
                invoice
              );

              // Add invoice items (2-3 random products per invoice)
              const numItems = Math.floor(Math.random() * 2) + 2; // 2-3 items
              const shuffledProducts = [...productDocs].sort(
                () => 0.5 - Math.random()
              );
              const selectedProducts = shuffledProducts.slice(0, numItems);

              let totalAmount = 0;

              for (const product of selectedProducts) {
                const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 quantity
                const subtotal = product.price * quantity;
                totalAmount += subtotal;

                // Add invoice item
                await addDoc(collection(db, "invoiceItems"), {
                  invoiceId: invoiceRef.id,
                  productId: product.id,
                  productName: product.name,
                  quantity: quantity,
                  price: product.price,
                  subtotal: subtotal,
                  createdAt: Timestamp.now(),
                });

                // Update product stock
                if (product.id) {
                  const productRef = doc(db, "products", product.id);
                  await updateDoc(productRef, {
                    stock: Math.max(0, product.stock - quantity),
                  });
                }
              }

              // Update invoice with correct total
              await updateDoc(doc(db, "invoices"), {
                amount: totalAmount,
              });
            }
          }
        }
      } catch (error) {
        console.error("Error initializing data:", error);
      }
    };

    initializeData();

    // Set up real-time listeners
    const productsQuery = query(collection(db, "products"));
    const customersQuery = query(collection(db, "customers"));
    const invoicesQuery = query(
      collection(db, "invoices"),
      orderBy("createdAt", "desc")
    );
    const invoiceItemsQuery = query(collection(db, "invoiceItems"));

    // Add this to the useEffect that sets up listeners
    const paymentsQuery = query(
      collection(db, "payments"),
      orderBy("createdAt", "desc")
    );

    const unsubscribeProducts = onSnapshot(productsQuery, (snapshot) => {
      const productsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];
      setProducts(productsData);
      setLoading((prev) => ({ ...prev, products: false }));
    });

    const unsubscribeCustomers = onSnapshot(customersQuery, (snapshot) => {
      const customersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Customer[];
      setCustomers(customersData);
      setLoading((prev) => ({ ...prev, customers: false }));
    });

    const unsubscribeInvoices = onSnapshot(invoicesQuery, (snapshot) => {
      const invoicesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Invoice[];
      setInvoices(invoicesData);
      setLoading((prev) => ({ ...prev, invoices: false }));
    });

    const unsubscribeInvoiceItems = onSnapshot(
      invoiceItemsQuery,
      (snapshot) => {
        const invoiceItemsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as InvoiceItem[];
        setInvoiceItems(invoiceItemsData);
        setLoading((prev) => ({ ...prev, invoiceItems: false }));
      }
    );

    const unsubscribePayments = onSnapshot(paymentsQuery, (snapshot) => {
      const paymentsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Payment[];
      setPayments(paymentsData);
      setLoading((prev) => ({ ...prev, payments: false }));
    });

    // Add this to the return statement in the useEffect
    return () => {
      unsubscribeProducts();
      unsubscribeCustomers();
      unsubscribeInvoices();
      unsubscribeInvoiceItems();
      unsubscribePayments();
    };
  }, []);

  // Product CRUD operations
  const addProduct = async (product: Product) => {
    const docRef = await addDoc(collection(db, "products"), {
      ...product,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  };

  const updateProduct = async (id: string, product: Partial<Product>) => {
    const productRef = doc(db, "products", id);
    await updateDoc(productRef, product);
  };

  const deleteProduct = async (id: string) => {
    // Check if product is used in any invoice items
    const invoiceItemsRef = collection(db, "invoiceItems");
    const q = query(invoiceItemsRef, where("productId", "==", id));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      throw new Error("Cannot delete product that is used in invoices");
    }

    const productRef = doc(db, "products", id);
    await deleteDoc(productRef);
  };

  // Customer CRUD operations
  const addCustomer = async (customer: Customer) => {
    const docRef = await addDoc(collection(db, "customers"), {
      ...customer,
      orders: 0,
      totalSpent: 0,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  };

  const updateCustomer = async (id: string, customer: Partial<Customer>) => {
    const customerRef = doc(db, "customers", id);
    await updateDoc(customerRef, customer);
  };

  const deleteCustomer = async (id: string) => {
    // Check if customer has any invoices
    const invoicesRef = collection(db, "invoices");
    const q = query(invoicesRef, where("customerId", "==", id));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      throw new Error("Cannot delete customer with existing invoices");
    }

    const customerRef = doc(db, "customers", id);
    await deleteDoc(customerRef);
  };

  // Invoice CRUD operations
  const addInvoice = async (
    invoice: Invoice,
    items: Omit<InvoiceItem, "invoiceId" | "createdAt">[]
  ) => {
    // Start a transaction to ensure all operations succeed or fail together
    try {
      // 1. Create the invoice
      const invoiceRef = await addDoc(collection(db, "invoices"), {
        ...invoice,
        createdAt: serverTimestamp(),
      });

      // 2. Add all invoice items
      for (const item of items) {
        await addDoc(collection(db, "invoiceItems"), {
          ...item,
          invoiceId: invoiceRef.id,
          createdAt: serverTimestamp(),
        });

        // 3. Update product stock
        const productRef = doc(db, "products", item.productId);
        await updateDoc(productRef, {
          stock: firestoreIncrement(-item.quantity),
        });
      }

      // 4. Update customer's orders and totalSpent
      if (invoice.customerId) {
        const customerRef = doc(db, "customers", invoice.customerId);
        await updateDoc(customerRef, {
          orders: firestoreIncrement(1),
          totalSpent: firestoreIncrement(invoice.amount),
        });
      }

      return invoiceRef.id;
    } catch (error) {
      console.error("Error creating invoice:", error);
      throw error;
    }
  };

  const updateInvoice = async (id: string, invoice: Partial<Invoice>) => {
    const invoiceRef = doc(db, "invoices", id);
    await updateDoc(invoiceRef, invoice);
  };

  const deleteInvoice = async (id: string) => {
    try {
      // 1. Get all invoice items
      const itemsQuery = query(
        collection(db, "invoiceItems"),
        where("invoiceId", "==", id)
      );
      const itemsSnapshot = await getDocs(itemsQuery);

      // 2. For each item, restore the product stock
      for (const itemDoc of itemsSnapshot.docs) {
        const item = itemDoc.data() as InvoiceItem;

        // Restore product stock
        const productRef = doc(db, "products", item.productId);
        await updateDoc(productRef, {
          stock: firestoreIncrement(item.quantity),
        });

        // Delete the invoice item
        await deleteDoc(itemDoc.ref);
      }

      // 3. Get the invoice to update customer data
      const invoiceRef = doc(db, "invoices", id);
      const invoiceSnap = await getDocs(
        query(collection(db, "invoices"), where("id", "==", id))
      );
      const invoice = invoiceSnap.docs[0]?.data() as Invoice;

      // 4. Update customer data if invoice exists
      if (invoice && invoice.customerId) {
        const customerRef = doc(db, "customers", invoice.customerId);
        await updateDoc(customerRef, {
          orders: firestoreIncrement(-1),
          totalSpent: firestoreIncrement(-invoice.amount),
        });
      }

      // 5. Delete the invoice
      await deleteDoc(invoiceRef);
    } catch (error) {
      console.error("Error deleting invoice:", error);
      throw error;
    }
  };

  const markInvoiceAsPaid = async (id: string, paidDate: string) => {
    const invoiceRef = doc(db, "invoices", id);

    await updateDoc(invoiceRef, {
      status: "paid",
      paidDate: paidDate,
    });
  };

  // Add these functions to the StoreProvider component
  const addPayment = async (payment: Omit<Payment, "createdAt">) => {
    try {
      // Add payment to database
      const docRef = await addDoc(collection(db, "payments"), {
        ...payment,
        createdAt: serverTimestamp(),
      });

      // Check if invoice is fully paid
      const invoice = invoices.find((inv) => inv.id === payment.invoiceId);
      if (invoice) {
        // Get all payments for this invoice
        const invoicePayments = payments.filter(
          (p) => p.invoiceId === payment.invoiceId
        );
        const totalPaid =
          invoicePayments.reduce((sum, p) => sum + p.amount, 0) +
          payment.amount;

        // If total paid equals or exceeds invoice amount, mark as paid
        if (totalPaid >= invoice.amount) {
          await updateInvoice(payment.invoiceId, { status: "paid" });
        }
      }

      return docRef.id;
    } catch (error) {
      console.error("Error adding payment:", error);
      throw error;
    }
  };

  // Helper functions
  const getInvoiceItems = async (invoiceId: string): Promise<InvoiceItem[]> => {
    // First check if we already have the items in state
    const cachedItems = invoiceItems.filter(
      (item) => item.invoiceId === invoiceId
    );

    if (cachedItems.length > 0) {
      return cachedItems;
    }

    // If not in state, fetch from database
    const itemsQuery = query(
      collection(db, "invoiceItems"),
      where("invoiceId", "==", invoiceId)
    );
    const itemsSnapshot = await getDocs(itemsQuery);

    return itemsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as InvoiceItem[];
  };

  const getCustomerInvoices = async (
    customerId: string
  ): Promise<Invoice[]> => {
    // First check if we already have the invoices in state
    const cachedInvoices = invoices.filter(
      (invoice) => invoice.customerId === customerId
    );

    if (cachedInvoices.length > 0) {
      return cachedInvoices;
    }

    // If not in state, fetch from database
    const invoicesQuery = query(
      collection(db, "invoices"),
      where("customerId", "==", customerId)
    );
    const invoicesSnapshot = await getDocs(invoicesQuery);

    return invoicesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Invoice[];
  };

  const getRecentInvoices = (limit = 5): Invoice[] => {
    return [...invoices]
      .sort((a, b) => {
        const dateA = a.createdAt?.toMillis() || 0;
        const dateB = b.createdAt?.toMillis() || 0;
        return dateB - dateA;
      })
      .slice(0, limit);
  };

  const getUnpaidInvoices = (limit = 5): Invoice[] => {
    return [...invoices]
      .filter((invoice) => invoice.status === "unpaid")
      .sort((a, b) => {
        const dateA = a.createdAt?.toMillis() || 0;
        const dateB = b.createdAt?.toMillis() || 0;
        return dateB - dateA;
      })
      .slice(0, limit);
  };

  const getLowStockProducts = (threshold = 10): Product[] => {
    return products
      .filter((product) => product.stock > 0 && product.stock <= threshold)
      .sort((a, b) => a.stock - b.stock);
  };

  // Add a function to update wallet balance
  const updateWalletBalance = async (customerId: string, amount: number) => {
    try {
      const customerRef = doc(db, "customers", customerId);
      await updateDoc(customerRef, {
        walletBalance: firestoreIncrement(amount),
      });
      return { success: true };
    } catch (error) {
      console.error("Error updating wallet balance:", error);
      throw error;
    }
  };

  // Add these to the value object
  const value = {
    products,
    customers,
    invoices,
    invoiceItems,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    markInvoiceAsPaid,
    getInvoiceItems,
    getCustomerInvoices,
    getRecentInvoices,
    getUnpaidInvoices,
    getLowStockProducts,
    payments,
    addPayment,
    updateWalletBalance,
  };

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

// Create a hook to use the context
export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
