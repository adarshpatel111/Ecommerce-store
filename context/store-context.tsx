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
  increment,
  setDoc,
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

export type Customer = {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  orders?: number;
  totalSpent?: number;
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
  createdAt?: Timestamp;
};

export type InvoiceItem = {
  id?: string;
  invoiceId: string;
  productId: string;
  quantity: number;
  price: number;
  total: number;
};

// Define the context type
type StoreContextType = {
  products: Product[];
  customers: Customer[];
  invoices: Invoice[];
  loading: {
    products: boolean;
    customers: boolean;
    invoices: boolean;
  };
  addProduct: (product: Product) => Promise<string>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addCustomer: (customer: Customer) => Promise<string>;
  updateCustomer: (id: string, customer: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  addInvoice: (invoice: Invoice, items: InvoiceItem[]) => Promise<string>;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  markInvoiceAsPaid: (id: string) => Promise<void>;
};

// Create the context
const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Create a provider component
export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState({
    products: true,
    customers: true,
    invoices: true,
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
              image: "/placeholder.svg?height=40&width=40",
              createdAt: Timestamp.now(),
            },
            {
              name: "Smart Watch",
              price: 199.99,
              stock: 12,
              status: "Low Stock",
              image: "/placeholder.svg?height=40&width=40",
              createdAt: Timestamp.now(),
            },
            {
              name: "Bluetooth Speaker",
              price: 79.99,
              stock: 0,
              status: "Out of Stock",
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
              orders: 12,
              totalSpent: 1245.89,
              createdAt: Timestamp.now(),
            },
            {
              firstName: "Jane",
              lastName: "Smith",
              email: "jane.smith@example.com",
              phone: "+1 (555) 987-6543",
              orders: 8,
              totalSpent: 879.5,
              createdAt: Timestamp.now(),
            },
            {
              firstName: "Robert",
              lastName: "Johnson",
              email: "robert.j@example.com",
              phone: "+1 (555) 456-7890",
              orders: 5,
              totalSpent: 432.25,
              createdAt: Timestamp.now(),
            },
          ];

          const customerIds: string[] = [];
          for (const customer of demoCustomers) {
            const docRef = await addDoc(collection(db, "customers"), customer);
            customerIds.push(docRef.id);
          }

          // Check if invoices collection is empty
          const invoicesSnapshot = await getDocs(collection(db, "invoices"));
          if (invoicesSnapshot.empty && customerIds.length > 0) {
            // Add some demo invoices
            const demoInvoices: Invoice[] = [
              {
                invoiceId: "INV-001",
                customer: "John Doe",
                customerId: customerIds[0],
                amount: 249.99,
                status: "paid",
                date: "2023-04-15",
                createdAt: Timestamp.now(),
              },
              {
                invoiceId: "INV-002",
                customer: "Jane Smith",
                customerId: customerIds[1],
                amount: 189.5,
                status: "unpaid",
                date: "2023-04-18",
                createdAt: Timestamp.now(),
              },
              {
                invoiceId: "INV-003",
                customer: "Robert Johnson",
                customerId: customerIds[2],
                amount: 99.99,
                status: "paid",
                date: "2023-04-20",
                createdAt: Timestamp.now(),
              },
            ];

            for (const invoice of demoInvoices) {
              const invoiceRef = await addDoc(
                collection(db, "invoices"),
                invoice
              );

              // Add demo invoice items
              const items = [
                {
                  invoiceId: invoiceRef.id,
                  productId: "demo-product-1",
                  productName: "Product 1",
                  quantity: 2,
                  price: 49.99,
                  total: 99.98,
                },
                {
                  invoiceId: invoiceRef.id,
                  productId: "demo-product-2",
                  productName: "Product 2",
                  quantity: 1,
                  price: 149.99,
                  total: 149.99,
                },
              ];

              await setDoc(doc(db, "invoiceItems", invoiceRef.id), { items });
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
    const invoicesQuery = query(collection(db, "invoices"));

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

    return () => {
      unsubscribeProducts();
      unsubscribeCustomers();
      unsubscribeInvoices();
    };
  }, []);

  // Product CRUD operations
  const addProduct = async (product: Product) => {
    const docRef = await addDoc(collection(db, "products"), {
      ...product,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  };

  const updateProduct = async (id: string, product: Partial<Product>) => {
    const productRef = doc(db, "products", id);
    await updateDoc(productRef, product);
  };

  const deleteProduct = async (id: string) => {
    const productRef = doc(db, "products", id);
    await deleteDoc(productRef);
  };

  // Customer CRUD operations
  const addCustomer = async (customer: Customer) => {
    const docRef = await addDoc(collection(db, "customers"), {
      ...customer,
      orders: 0,
      totalSpent: 0,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  };

  const updateCustomer = async (id: string, customer: Partial<Customer>) => {
    const customerRef = doc(db, "customers", id);
    await updateDoc(customerRef, customer);
  };

  const deleteCustomer = async (id: string) => {
    const customerRef = doc(db, "customers", id);
    await deleteDoc(customerRef);
  };

  // Invoice CRUD operations
  const addInvoice = async (invoice: Invoice, items: InvoiceItem[]) => {
    const docRef = await addDoc(collection(db, "invoices"), {
      ...invoice,
      createdAt: Timestamp.now(),
    });

    // Save invoice items
    await setDoc(doc(db, "invoiceItems", docRef.id), { items });

    // Update customer's orders and totalSpent
    if (invoice.customerId) {
      const customerRef = doc(db, "customers", invoice.customerId);
      await updateDoc(customerRef, {
        orders: increment(1),
        totalSpent: increment(invoice.amount),
      });
    }

    return docRef.id;
  };

  const updateInvoice = async (id: string, invoice: Partial<Invoice>) => {
    const invoiceRef = doc(db, "invoices", id);
    await updateDoc(invoiceRef, invoice);
  };

  const deleteInvoice = async (id: string) => {
    const invoiceRef = doc(db, "invoices", id);
    await deleteDoc(invoiceRef);

    // Also delete invoice items
    const invoiceItemsRef = doc(db, "invoiceItems", id);
    await deleteDoc(invoiceItemsRef);
  };

  const markInvoiceAsPaid = async (id: string) => {
    const invoiceRef = doc(db, "invoices", id);
    await updateDoc(invoiceRef, { status: "paid" });
  };

  const value = {
    products,
    customers,
    invoices,
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
