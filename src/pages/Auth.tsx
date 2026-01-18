import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Building2, TrendingUp, Briefcase } from "lucide-react";
import { z } from "zod";
import { SignupPhoneField, COUNTRIES } from "@/components/auth/SignupPhoneField";
import { supabase } from "@/integrations/supabase/client";

type AccountType = "employee" | "investor" | "both";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [countryCode, setCountryCode] = useState("US");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("employee");
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  
  const { signIn, signUp, resetPassword, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/dashboard";

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const validateEmail = (email: string): string | null => {
    const result = emailSchema.safeParse(email);
    return result.success ? null : result.error.errors[0].message;
  };

  const validatePassword = (password: string): string | null => {
    const result = passwordSchema.safeParse(password);
    return result.success ? null : result.error.errors[0].message;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailError = validateEmail(email);
    if (emailError) {
      toast({ title: "Validation Error", description: emailError, variant: "destructive" });
      return;
    }
    
    const passwordError = validatePassword(password);
    if (passwordError) {
      toast({ title: "Validation Error", description: passwordError, variant: "destructive" });
      return;
    }

    setIsLoading(true);
    const { error } = await signIn(email, password);
    setIsLoading(false);

    if (error) {
      toast({
        title: "Login Failed",
        description: error.message === "Invalid login credentials" 
          ? "Invalid email or password. Please try again."
          : error.message,
        variant: "destructive",
      });
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailError = validateEmail(email);
    if (emailError) {
      toast({ title: "Validation Error", description: emailError, variant: "destructive" });
      return;
    }
    
    const passwordError = validatePassword(password);
    if (passwordError) {
      toast({ title: "Validation Error", description: passwordError, variant: "destructive" });
      return;
    }

    if (!fullName.trim()) {
      toast({ title: "Validation Error", description: "Please enter your full name", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    const { error, user: newUser } = await signUp(email, password, fullName);
    
    if (error) {
      setIsLoading(false);
      if (error.message.includes("already registered")) {
        toast({
          title: "Account Exists",
          description: "An account with this email already exists. Please log in instead.",
          variant: "destructive",
        });
      } else {
        toast({ title: "Sign Up Failed", description: error.message, variant: "destructive" });
      }
      return;
    }
    
    // Save phone number, country, and investor status to profile
    if (newUser) {
      const selectedCountry = COUNTRIES.find(c => c.code === countryCode);
      const fullPhone = phoneNumber ? `${selectedCountry?.dialCode} ${phoneNumber}` : null;
      const isInvestor = accountType === "investor" || accountType === "both";
      
      await supabase
        .from("profiles")
        .update({
          phone_number: fullPhone,
          country: countryCode,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          is_investor: isInvestor,
          investor_type: isInvestor ? "employee_investor" : null,
        })
        .eq("id", newUser.id);
    }
    
    setIsLoading(false);
    toast({
      title: "Account Created",
      description: "Your account has been created successfully!",
    });
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailError = validateEmail(email);
    if (emailError) {
      toast({ title: "Validation Error", description: emailError, variant: "destructive" });
      return;
    }

    setIsLoading(true);
    const { error } = await resetPassword(email);
    setIsLoading(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({
        title: "Email Sent",
        description: "Check your email for password reset instructions.",
      });
      setMode("login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="flex flex-col items-center mb-8">
          <div className="h-16 w-16 rounded-xl gradient-primary flex items-center justify-center mb-4">
            <Building2 className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Workforce Hub</h1>
          <p className="text-muted-foreground">Employee Management System</p>
        </div>

        <Card className="border-border shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">
              {mode === "login" && "Welcome back"}
              {mode === "signup" && "Create an account"}
              {mode === "forgot" && "Reset password"}
            </CardTitle>
            <CardDescription>
              {mode === "login" && "Enter your credentials to access your account"}
              {mode === "signup" && "Fill in your details to get started"}
              {mode === "forgot" && "We'll send you a reset link"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {mode === "forgot" ? (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send Reset Link
                </Button>
                <Button
                  type="button"
                  variant="link"
                  className="w-full"
                  onClick={() => setMode("login")}
                >
                  Back to login
                </Button>
              </form>
            ) : (
              <Tabs value={mode} onValueChange={(v) => setMode(v as "login" | "signup")}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="name@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Sign In
                    </Button>
                    <Button
                      type="button"
                      variant="link"
                      className="w-full text-muted-foreground"
                      onClick={() => setMode("forgot")}
                    >
                      Forgot password?
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full Name *</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="John Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email *</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="name@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password *</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Must be at least 6 characters
                      </p>
                    </div>
                    <SignupPhoneField
                      countryCode={countryCode}
                      phoneNumber={phoneNumber}
                      onCountryChange={setCountryCode}
                      onPhoneChange={setPhoneNumber}
                    />
                    
                    {/* Account Type Selection */}
                    <div className="space-y-3">
                      <Label>I want to join as</Label>
                      <div className="grid gap-3">
                        <label 
                          className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            accountType === "employee" ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                          }`}
                        >
                          <input
                            type="radio"
                            name="accountType"
                            value="employee"
                            checked={accountType === "employee"}
                            onChange={() => setAccountType("employee")}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Briefcase className="h-4 w-4 text-primary" />
                              <span className="font-medium text-sm">Employee Only</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Join as a workforce member. You can become an investor later.
                            </p>
                          </div>
                        </label>
                        
                        <label 
                          className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            accountType === "investor" ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                          }`}
                        >
                          <input
                            type="radio"
                            name="accountType"
                            value="investor"
                            checked={accountType === "investor"}
                            onChange={() => setAccountType("investor")}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 text-green-600" />
                              <span className="font-medium text-sm">Investor Only</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Invest in MPCN and track your returns. No workforce duties.
                            </p>
                          </div>
                        </label>
                        
                        <label 
                          className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            accountType === "both" ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                          }`}
                        >
                          <input
                            type="radio"
                            name="accountType"
                            value="both"
                            checked={accountType === "both"}
                            onChange={() => setAccountType("both")}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Briefcase className="h-4 w-4 text-primary" />
                              <TrendingUp className="h-4 w-4 text-green-600" />
                              <span className="font-medium text-sm">Employee + Investor</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Work in MPCN and invest. Separate dashboards for each role.
                            </p>
                          </div>
                        </label>
                      </div>
                    </div>

                    <div className="bg-muted/50 p-3 rounded-lg space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">What happens next:</p>
                      <ul className="text-xs text-muted-foreground space-y-0.5">
                        {(accountType === "employee" || accountType === "both") && (
                          <>
                            <li>• You'll be assigned the default Employee role</li>
                            <li>• Complete your profile with skills and preferences</li>
                          </>
                        )}
                        {(accountType === "investor" || accountType === "both") && (
                          <>
                            <li>• Access the Investments page to manage your portfolio</li>
                            <li>• View MPCN performance and track returns</li>
                          </>
                        )}
                      </ul>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create Account
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}