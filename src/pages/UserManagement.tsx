import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Users, Search, Trash2, Shield, Mail } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface UserWithRole {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  role: AppRole | null;
}

const ALL_ROLES: AppRole[] = ["employee", "report_admin", "finance_hr_admin", "investment_admin", "user_admin", "general_overseer"];

export default function UserManagement() {
  const { user, hasRole, role: currentUserRole } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [updatingRoleUserId, setUpdatingRoleUserId] = useState<string | null>(null);
  const [pendingApprovals, setPendingApprovals] = useState<string[]>([]);

  const isAdmin = hasRole("user_admin") || hasRole("general_overseer");

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
      fetchPendingApprovals();
    }
  }, [isAdmin]);

  const fetchPendingApprovals = async () => {
    const { data } = await supabase
      .from("pending_role_approvals")
      .select("target_user_id")
      .eq("status", "pending");
    
    if (data) {
      setPendingApprovals(data.map(d => d.target_user_id));
    }
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    
    // Fetch profiles (admins can see all profiles)
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, created_at")
      .order("created_at", { ascending: false });

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      toast({
        title: "Error",
        description: "Failed to load users.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Fetch roles for all users
    const { data: roles, error: rolesError } = await supabase
      .from("user_roles")
      .select("user_id, role");

    if (rolesError) {
      console.error("Error fetching roles:", rolesError);
    }

    // Combine profiles with roles
    const usersWithRoles: UserWithRole[] = (profiles || []).map((profile) => {
      const userRole = roles?.find((r) => r.user_id === profile.id);
      return {
        ...profile,
        role: (userRole?.role as AppRole) || "employee",
      };
    });

    setUsers(usersWithRoles);
    setIsLoading(false);
  };

  const handleRoleChange = async (userId: string, newRole: AppRole, userName: string | null) => {
    // Special handling for general_overseer role - requires email approval
    if (newRole === "general_overseer") {
      setUpdatingRoleUserId(userId);
      
      const { data, error } = await supabase.functions.invoke("request-role-approval", {
        body: { targetUserId: userId, targetUserName: userName },
      });

      if (error || !data?.success) {
        toast({
          title: "Error",
          description: data?.error || "Failed to send approval request",
          variant: "destructive",
        });
        setUpdatingRoleUserId(null);
        return;
      }

      toast({
        title: "Approval Request Sent",
        description: "An email has been sent to the current General Overseer for approval.",
      });
      
      fetchPendingApprovals();
      setUpdatingRoleUserId(null);
      return;
    }

    // Direct role update for non-general_overseer roles
    setUpdatingRoleUserId(userId);

    // Check if user already has a role entry
    const { data: existingRole } = await supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    let error;
    if (existingRole) {
      const result = await supabase
        .from("user_roles")
        .update({ role: newRole })
        .eq("user_id", userId);
      error = result.error;
    } else {
      const result = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role: newRole });
      error = result.error;
    }

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
      setUpdatingRoleUserId(null);
      return;
    }

    toast({
      title: "Role Updated",
      description: `User role has been updated to ${getRoleLabel(newRole)}`,
    });

    fetchUsers();
    setUpdatingRoleUserId(null);
  };

  const handleDeleteUser = async (userId: string) => {
    setDeletingUserId(userId);

    const { data, error } = await supabase.functions.invoke("admin-delete-user", {
      body: { userId },
    });

    if (error || !data?.success) {
      toast({
        title: "Error",
        description: data?.error || "Failed to delete user.",
        variant: "destructive",
      });
      setDeletingUserId(null);
      return;
    }

    toast({
      title: "User Deleted",
      description: "The user has been permanently deleted.",
    });

    // Refresh the user list
    fetchUsers();
    setDeletingUserId(null);
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleLabel = (role: string | null) => {
    if (!role) return "Employee";
    return role
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getRoleBadgeVariant = (role: string | null) => {
    switch (role) {
      case "general_overseer":
        return "default";
      case "user_admin":
      case "investment_admin":
      case "finance_hr_admin":
      case "report_admin":
        return "secondary";
      default:
        return "outline";
    }
  };

  const filteredUsers = users.filter((u) =>
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Card className="max-w-md">
            <CardHeader className="text-center">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>
                You don't have permission to access this page.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">User Management</h1>
            <p className="text-muted-foreground">Manage users and their roles</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <Users className="h-3 w-3" />
              {users.length} Users
            </Badge>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by name or role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" onClick={fetchUsers} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {searchQuery ? "No users match your search." : "No users found."}
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={u.avatar_url || undefined} />
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {getInitials(u.full_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{u.full_name || "Unnamed User"}</p>
                              <p className="text-xs text-muted-foreground">ID: {u.id.slice(0, 8)}...</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {u.id === user?.id || u.role === "general_overseer" ? (
                              <Badge variant={getRoleBadgeVariant(u.role)}>
                                {getRoleLabel(u.role)}
                              </Badge>
                            ) : (
                              <Select
                                value={u.role || "employee"}
                                onValueChange={(value) => handleRoleChange(u.id, value as AppRole, u.full_name)}
                                disabled={updatingRoleUserId === u.id}
                              >
                                <SelectTrigger className="w-[160px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {ALL_ROLES.map((role) => (
                                    <SelectItem key={role} value={role}>
                                      {getRoleLabel(role)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                            {pendingApprovals.includes(u.id) && (
                              <Badge variant="outline" className="text-amber-600 border-amber-300 gap-1">
                                <Mail className="h-3 w-3" />
                                Pending
                              </Badge>
                            )}
                            {updatingRoleUserId === u.id && (
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(u.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {u.id === user?.id ? (
                            <Badge variant="outline" className="text-muted-foreground">
                              Current User
                            </Badge>
                          ) : (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                  disabled={deletingUserId === u.id}
                                >
                                  {deletingUserId === u.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete User</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete{" "}
                                    <span className="font-semibold">{u.full_name || "this user"}</span>?
                                    This action cannot be undone and will permanently remove the user
                                    and all their data.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteUser(u.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete User
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
