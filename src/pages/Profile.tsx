import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SkillsSection } from "@/components/employee/SkillsSection";
import { ExternalAccountsSection } from "@/components/employee/ExternalAccountsSection";
import { SkillProgressionChart } from "@/components/profile/SkillProgressionChart";
import { InternationalSettingsSection } from "@/components/profile/InternationalSettingsSection";
import { GovernanceCharter } from "@/components/settings/GovernanceCharter";
import { BecomeInvestorCard } from "@/components/profile/BecomeInvestorCard";
import { Loader2, User, Mail, Shield, Trash2, Copy, CheckCircle, Heart, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export default function Profile() {
  const { user, profile, role, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

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

  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", user.id);
    
    setIsSaving(false);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      setIsEditing(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || deleteConfirmation !== "DELETE") return;
    
    setIsDeleting(true);
    
    // Call edge function to delete account securely
    const { data, error } = await supabase.functions.invoke("delete-account");
    
    if (error || !data?.success) {
      toast({
        title: "Error",
        description: "Failed to delete account. Please contact support.",
        variant: "destructive",
      });
      setIsDeleting(false);
      return;
    }
    
    await signOut();
    navigate("/auth");
    toast({
      title: "Account Deleted",
      description: "Your account has been permanently deleted.",
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground">Manage your personal information</p>
        </div>

        {/* Profile Card */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {getInitials(profile?.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <h2 className="text-xl font-semibold text-foreground">
                    {profile?.full_name || "User"}
                  </h2>
                  <Badge variant="secondary" className="w-fit">
                    {getRoleLabel(role)}
                  </Badge>
                </div>
                <p className="text-muted-foreground mt-1">{user?.email}</p>
              </div>
              <Button
                variant={isEditing ? "outline" : "default"}
                onClick={() => {
                  if (isEditing) {
                    setFullName(profile?.full_name || "");
                  }
                  setIsEditing(!isEditing);
                }}
              >
                {isEditing ? "Cancel" : "Edit Profile"}
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription>Your basic account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                {isEditing ? (
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                ) : (
                  <p className="text-foreground py-2">{profile?.full_name || "Not set"}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Email Address</Label>
                <div className="flex items-center gap-2 py-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{user?.email}</span>
                </div>
              </div>
            </div>
            
            {isEditing && (
              <div className="flex justify-end pt-4">
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Role & Permissions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Role & Permissions
            </CardTitle>
            <CardDescription>Your access level in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div>
                <p className="font-medium text-foreground">{getRoleLabel(role)}</p>
                <p className="text-sm text-muted-foreground">
                  {role === "general_overseer" && "Full system access"}
                  {role === "user_admin" && "User management access"}
                  {role === "investment_admin" && "Investment management access"}
                  {role === "finance_hr_admin" && "Finance & HR access"}
                  {role === "report_admin" && "Reports management access"}
                  {role === "employee" && "Standard employee access"}
                </p>
              </div>
              <Badge variant="outline">{getRoleLabel(role)}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Skills Section */}
        <SkillsSection editable />

        {/* Skill Progression Chart */}
        <SkillProgressionChart />

        {/* International Settings */}
        <InternationalSettingsSection />

        {/* MPCN Employee ID Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              MPCN Employee ID
            </CardTitle>
            <CardDescription>
              Your unique identifier for all tasks and reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Employee ID</p>
                <p className="font-mono text-lg font-semibold">{user?.id?.slice(0, 8).toUpperCase()}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(user?.id || "");
                  toast({ title: "Copied!", description: "Employee ID copied to clipboard" });
                }}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Full ID
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              This ID is auto-generated and read-only. It links all your tasks and reports.
            </p>
          </CardContent>
        </Card>

        {/* External Accounts */}
        <ExternalAccountsSection />

        {/* Become Investor Card */}
        <BecomeInvestorCard />

        {/* Governance Charter - Collapsible */}
        <Collapsible>
          <Card>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="flex flex-row items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors rounded-t-lg">
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  <div className="text-left">
                    <CardTitle className="text-base">MPCN Culture & Governance Charter</CardTitle>
                    <CardDescription className="text-sm">
                      Our principles for accountability without humiliation
                    </CardDescription>
                  </div>
                </div>
                <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <GovernanceCharter />
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Danger Zone */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>
              Irreversible actions that affect your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-destructive/5 border border-destructive/20">
              <div>
                <p className="font-medium text-foreground">Delete Account</p>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all associated data
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription className="space-y-3">
                      <p>
                        This action cannot be undone. This will permanently delete your
                        account and remove all your data from our servers.
                      </p>
                      <div className="space-y-2">
                        <Label htmlFor="delete-confirm">
                          Type <span className="font-mono font-bold">DELETE</span> to confirm
                        </Label>
                        <Input
                          id="delete-confirm"
                          value={deleteConfirmation}
                          onChange={(e) => setDeleteConfirmation(e.target.value)}
                          placeholder="Type DELETE"
                        />
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setDeleteConfirmation("")}>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      disabled={deleteConfirmation !== "DELETE" || isDeleting}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Delete Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}