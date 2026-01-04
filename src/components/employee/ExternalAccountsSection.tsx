import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useExternalAccounts,
  useCreateExternalAccount,
  useDeleteExternalAccount,
} from "@/hooks/useExternalAccounts";
import { ExternalLink, Plus, Trash2, CheckCircle2, Clock, Link2 } from "lucide-react";

const PLATFORMS = [
  "Upwork",
  "Fiverr",
  "Freelancer",
  "Swagbucks",
  "Remotasks",
  "Outlier",
  "Scale AI",
  "Appen",
  "Clickworker",
  "Trading Platform",
  "Other",
];

export function ExternalAccountsSection() {
  const [open, setOpen] = useState(false);
  const [platformName, setPlatformName] = useState("");
  const [externalUsername, setExternalUsername] = useState("");
  const [profileLink, setProfileLink] = useState("");

  const { data: accounts, isLoading } = useExternalAccounts();
  const createAccount = useCreateExternalAccount();
  const deleteAccount = useDeleteExternalAccount();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!platformName || !externalUsername) return;

    await createAccount.mutateAsync({
      platform_name: platformName,
      external_username: externalUsername,
      profile_link: profileLink || undefined,
    });

    setPlatformName("");
    setExternalUsername("");
    setProfileLink("");
    setOpen(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "connected":
        return <Link2 className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Verified</Badge>;
      case "connected":
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Connected</Badge>;
      default:
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Pending</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              External Accounts
            </CardTitle>
            <CardDescription>
              Link your freelancing and investment platform accounts for task verification
            </CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Add External Account</DialogTitle>
                  <DialogDescription>
                    Connect an external platform to link imported tasks to your MPCN profile
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="platform">Platform *</Label>
                    <Select value={platformName} onValueChange={setPlatformName}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        {PLATFORMS.map((p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username / ID *</Label>
                    <Input
                      id="username"
                      placeholder="Your username on this platform"
                      value={externalUsername}
                      onChange={(e) => setExternalUsername(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="link">Profile Link (Optional)</Label>
                    <Input
                      id="link"
                      type="url"
                      placeholder="https://..."
                      value={profileLink}
                      onChange={(e) => setProfileLink(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createAccount.isPending}>
                    {createAccount.isPending ? "Adding..." : "Add Account"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading accounts...</div>
        ) : !accounts?.length ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No external accounts connected yet</p>
            <p className="text-sm mt-1">Add your freelancing platform accounts to link imported tasks</p>
          </div>
        ) : (
          <div className="space-y-3">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(account.status)}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{account.platform_name}</span>
                      {getStatusBadge(account.status)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      @{account.external_username}
                      {account.profile_link && (
                        <a
                          href={account.profile_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-primary hover:underline"
                        >
                          View Profile
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteAccount.mutate(account.id)}
                  disabled={deleteAccount.isPending}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
