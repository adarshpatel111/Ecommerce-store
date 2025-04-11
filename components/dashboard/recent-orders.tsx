import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Mock recent orders data
const recentOrders = [
  {
    id: "ORD-001",
    customer: {
      name: "John Doe",
      email: "john.doe@example.com",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "JD",
    },
    amount: 125.99,
    status: "completed",
    date: "2 hours ago",
  },
  {
    id: "ORD-002",
    customer: {
      name: "Jane Smith",
      email: "jane.smith@example.com",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "JS",
    },
    amount: 89.5,
    status: "processing",
    date: "5 hours ago",
  },
  {
    id: "ORD-003",
    customer: {
      name: "Robert Johnson",
      email: "robert.j@example.com",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "RJ",
    },
    amount: 45.25,
    status: "completed",
    date: "1 day ago",
  },
  {
    id: "ORD-004",
    customer: {
      name: "Emily Davis",
      email: "emily.davis@example.com",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "ED",
    },
    amount: 199.99,
    status: "completed",
    date: "2 days ago",
  },
]

export function RecentOrders() {
  return (
    <div className="space-y-4">
      {recentOrders.map((order) => (
        <div key={order.id} className="flex items-center gap-4">
          <Avatar className="h-9 w-9">
            <AvatarImage src={order.customer.avatar} alt={order.customer.name} />
            <AvatarFallback>{order.customer.initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">{order.customer.name}</p>
            <p className="text-sm text-muted-foreground">{order.customer.email}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">₹{order.amount.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">{order.date}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
