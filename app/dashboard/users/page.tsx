"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  MoreHorizontal,
  Key,
  UserCheck,
  UserX,
  Trash2,
  Mail,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getUsersByRole, ROLES } from "@/lib/firebase";
import { AddUserDialog } from "@/components/dashboard/add-user-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { EditUserEmailDialog } from "@/components/dashboard/edit-user-email-dialog";

export default function UsersPage() {
  const { toast } = useToast();
  const { isAdmin, updateStatus, resetPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [isEditEmailDialogOpen, setIsEditEmailDialogOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<any | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, activeTab]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Fetch all types of users
      const adminResult = await getUsersByRole(ROLES.ADMIN);
      const subAdminResult = await getUsersByRole(ROLES.SUB_ADMIN);
      const userResult = await getUsersByRole(ROLES.USER);

      if (adminResult.success && subAdminResult.success && userResult.success) {
        const allUsers = [
          ...adminResult.users.map((user) => ({ ...user, roleLabel: "Admin" })),
          ...subAdminResult.users.map((user) => ({
            ...user,
            roleLabel: "Sub-Admin",
          })),
          ...userResult.users.map((user) => ({ ...user, roleLabel: "User" })),
        ];
        setUsers(allUsers);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch users.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while fetching users.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.firstName?.toLowerCase().includes(query) ||
          user.lastName?.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query)
      );
    }

    // Filter by role
    if (activeTab !== "all") {
      filtered = filtered.filter((user) => user.role === activeTab);
    }

    setFilteredUsers(filtered);
  };

  const handleUserAdded = (user: any) => {
    setUsers((prev) => [
      ...prev,
      { ...user, roleLabel: "Sub-Admin", role: ROLES.SUB_ADMIN },
    ]);
    fetchUsers(); // Refresh the list
  };

  const handleDeleteUser = (userId: string) => {
    setUserToDelete(userId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    setIsLoading(true);
    try {
      // In a real app, you would call an API to delete the user
      // For now, we'll just remove it from the state
      setUsers((prev) => prev.filter((user) => user.id !== userToDelete));
      toast({
        title: "User deleted",
        description: "User has been deleted successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete user.",
      });
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleResetPassword = async (email: string) => {
    try {
      const result = await resetPassword(email);
      if (result.success) {
        toast({
          title: "Password reset email sent",
          description: "A password reset email has been sent to the user.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to send password reset email.",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send password reset email.",
      });
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      const result = await updateStatus(userId, newStatus);
      if (result.success) {
        // Update user in state
        setUsers((prev) =>
          prev.map((user) =>
            user.id === userId ? { ...user, status: newStatus } : user
          )
        );
        toast({
          title: "Status updated",
          description: `User has been ${
            newStatus === "active" ? "activated" : "deactivated"
          }.`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to update user status.",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update user status.",
      });
    }
  };

  const handleEditEmail = (user: any) => {
    setUserToEdit(user);
    setIsEditEmailDialogOpen(true);
  };

  const handleEmailUpdated = (userId: string, newEmail: string) => {
    // Update user in state
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, email: newEmail } : user
      )
    );
  };

  if (!isAdmin) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">
            You do not have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage your users and their permissions
          </p>
        </div>
        <Button onClick={() => setIsAddUserDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Sub-Admin
        </Button>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="all" className="flex-1 sm:flex-initial">
              All
            </TabsTrigger>
            <TabsTrigger value={ROLES.ADMIN} className="flex-1 sm:flex-initial">
              Admins
            </TabsTrigger>
            <TabsTrigger
              value={ROLES.SUB_ADMIN}
              className="flex-1 sm:flex-initial"
            >
              Sub-Admins
            </TabsTrigger>
            <TabsTrigger value={ROLES.USER} className="flex-1 sm:flex-initial">
              Users
            </TabsTrigger>
          </TabsList>

          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-full"
            />
          </div>
        </div>

        <TabsContent value="all" className="mt-0">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>All Users</CardTitle>
              <CardDescription>View and manage all users</CardDescription>
            </CardHeader>
            <CardContent>
              <UsersTable
                users={filteredUsers}
                loading={isLoading}
                onDelete={handleDeleteUser}
                onResetPassword={handleResetPassword}
                onToggleStatus={handleToggleStatus}
                onEditEmail={handleEditEmail}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value={ROLES.ADMIN} className="mt-0">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Admins</CardTitle>
              <CardDescription>View and manage admin users</CardDescription>
            </CardHeader>
            <CardContent>
              <UsersTable
                users={filteredUsers}
                loading={isLoading}
                onDelete={handleDeleteUser}
                onResetPassword={handleResetPassword}
                onToggleStatus={handleToggleStatus}
                onEditEmail={handleEditEmail}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value={ROLES.SUB_ADMIN} className="mt-0">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Sub-Admins</CardTitle>
              <CardDescription>View and manage sub-admin users</CardDescription>
            </CardHeader>
            <CardContent>
              <UsersTable
                users={filteredUsers}
                loading={isLoading}
                onDelete={handleDeleteUser}
                onResetPassword={handleResetPassword}
                onToggleStatus={handleToggleStatus}
                onEditEmail={handleEditEmail}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value={ROLES.USER} className="mt-0">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Users</CardTitle>
              <CardDescription>View and manage regular users</CardDescription>
            </CardHeader>
            <CardContent>
              <UsersTable
                users={filteredUsers}
                loading={isLoading}
                onDelete={handleDeleteUser}
                onResetPassword={handleResetPassword}
                onToggleStatus={handleToggleStatus}
                onEditEmail={handleEditEmail}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AddUserDialog
        open={isAddUserDialogOpen}
        onOpenChange={setIsAddUserDialogOpen}
        onUserAdded={handleUserAdded}
      />

      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete User"
        description="Are you sure you want to delete this user? This action cannot be undone."
        onConfirm={confirmDeleteUser}
      />

      <EditUserEmailDialog
        open={isEditEmailDialogOpen}
        onOpenChange={setIsEditEmailDialogOpen}
        user={userToEdit}
        onEmailUpdated={handleEmailUpdated}
      />
    </div>
  );
}

function UsersTable({
  users,
  loading,
  onDelete,
  onResetPassword,
  onToggleStatus,
  onEditEmail,
}: {
  users: any[];
  loading: boolean;
  onDelete: (id: string) => void;
  onResetPassword: (email: string) => void;
  onToggleStatus: (id: string, status: string) => void;
  onEditEmail: (user: any) => void;
}) {
  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
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
                  <Skeleton className="h-4 w-[150px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[200px]" />
                </TableCell>
                <TableCell>
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
          ) : users.length > 0 ? (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  {user.firstName} {user.lastName}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant="outline">{user.roleLabel}</Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      user.status === "inactive" ? "destructive" : "default"
                    }
                  >
                    {user.status || "active"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => onResetPassword(user.email)}
                      >
                        <Key className="mr-2 h-4 w-4" />
                        Reset Password
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEditEmail(user)}>
                        <Mail className="mr-2 h-4 w-4" />
                        Edit Email
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          onToggleStatus(user.id, user.status || "active")
                        }
                      >
                        {user.status === "inactive" ? (
                          <>
                            <UserCheck className="mr-2 h-4 w-4" />
                            Activate User
                          </>
                        ) : (
                          <>
                            <UserX className="mr-2 h-4 w-4" />
                            Deactivate User
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete(user.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No users found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
