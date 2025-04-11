import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

// Mock unpaid invoices data
const unpaidInvoices = [
  {
    id: "INV-002",
    customer: {
      name: "Jane Smith",
      email: "jane.smith@example.com",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "JS",
    },
    amount: 189.5,
    dueDate: "Today",
  },
  {
    id: "INV-004",
    customer: {
      name: "Emily Davis",
      email: "emily.davis@example.com",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "ED",
    },
    amount: 349.75,
    dueDate: "Tomorrow",
  },
  {
    id: "INV-006",
    customer: {
      name: "Sarah Brown",
      email: "sarah.b@example.com",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "SB",
    },
    amount: 79.5,
    dueDate: "In 3 days",
  },
]

export function UnpaidInvoices() {
  return (
    <div className="space-y-4">
      {unpaidInvoices.map((invoice) => (
        <div key={invoice.id} className="flex items-center gap-4">
          <Avatar className="h-9 w-9">
            <AvatarImage src={invoice.customer.avatar} alt={invoice.customer.name} />
            <AvatarFallback>{invoice.customer.initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium leading-none">{invoice.customer.name}</p>
              <Badge variant="outline">{invoice.id}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{invoice.customer.email}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">${invoice.amount.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">Due {invoice.dueDate}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
