import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, 
  Building2, 
  TrendingUp, 
  Briefcase, 
  ArrowLeft, 
  ChevronRight,
  Mail,
  Phone,
  User,
  LineChart,
} from "lucide-react";
import { z } from "zod";
import { SignupPhoneField, COUNTRIES } from "@/components/auth/SignupPhoneField";
import { PasswordStrengthIndicator } from "@/components/auth/PasswordStrengthIndicator";
import { RoleSelectionGrid, LoginRoleType } from "@/components/auth/RoleSelectionGrid";
import { PhoneLoginForm } from "@/components/auth/PhoneLoginForm";
import { MpcnIdLoginForm } from "@/components/auth/MpcnIdLoginForm";
import { supabase } from "@/integrations/supabase/client";

type AccountType = "employee" | "investor" | "both" | "trader";
type LoginMethod = "email" | "phone" | "mpcn_id";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

// Role-specific helper text for login context
const ROLE_CONTEXT: Record<LoginRoleType, { title: string; description: string }> = {
  employee: {
    title: "Team Member Login",
    description: "Submit your tasks and reports, track your progress",
  },
  trader: {
    title: "Trader Login", 
    description: "Execute trades and manage your positions",
  },
  team_lead: {
    title: "Team Lead Login",
    description: "Review team submissions and provide guidance",
  },
  department_head: {
    title: "Department Head Login",
    description: "Manage your department and team structures",
  },
  administrator: {
    title: "Administrator Login",
    description: "System configuration and operational management",
  },
  general_overseer: {
    title: "General Overseer Login",
    description: "Supreme authority — full governance control",
  },
  investor: {
    title: "Investor Login",
    description: "Access your portfolio and track returns",
  },
};

const LOGIN_METHODS = [
  { id: "email" as const, label: "Email", icon: Mail },
  { id: "phone" as const, label: "Phone", icon: Phone },
  { id: "mpcn_id" as const, label: "MPCN ID", icon: User },
];

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [countryCode, setCountryCode] = useState("US");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("employee");
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [selectedLoginRole, setSelectedLoginRole] = useState<LoginRoleType | null>(null);
  const [showRoleSelection, setShowRoleSelection] = useState(true);
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("email");
  
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
    
    // Save phone number, country, and investor/trader status to profile
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

      // For trader accounts, redirect to trading onboarding after signup
      if (accountType === "trader") {
        setIsLoading(false);
        toast({
          title: "Account Created",
          description: "Complete trader onboarding to access the trading environment",
        });
        navigate("/trading");
        return;
      }
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

  // Get context text based on selected role
  const roleContext = selectedLoginRole ? ROLE_CONTEXT[selectedLoginRole] : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4 auth-gradient">
      <div className="w-full max-w-md animate-fade-in">
        {/* Institutional Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Building2 className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-foreground tracking-tight">MPCN</h1>
          <p className="mt-1 text-sm text-muted-foreground">Structured collaboration. Accountable growth.</p>
        </div>

        <Card className="border-border/50 shadow-xl auth-card-glow bg-card/95 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-semibold">
              {mode === "login" && showRoleSelection && "Select Your Role"}
              {mode === "login" && !showRoleSelection && (roleContext?.title || "Sign In")}
              {mode === "signup" && "Request Access"}
              {mode === "forgot" && "Reset Password"}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {mode === "login" && showRoleSelection && "Choose the role that matches your assigned position"}
              {mode === "login" && !showRoleSelection && (roleContext?.description || "Enter your credentials to continue")}
              {mode === "signup" && "Complete your details to join the organization"}
              {mode === "forgot" && "Enter your email to receive reset instructions"}
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
              <Tabs value={mode} onValueChange={(v) => { setMode(v as "login" | "signup"); setShowRoleSelection(true); }}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <AnimatePresence mode="wait">
                    {showRoleSelection ? (
                      <motion.div
                        key="role-selection"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                      >
                        <RoleSelectionGrid
                          selectedRole={selectedLoginRole}
                          onRoleSelect={(role) => setSelectedLoginRole(role)}
                        />
                        <Button 
                          type="button" 
                          className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md shadow-primary/20"
                          disabled={!selectedLoginRole}
                          onClick={() => setShowRoleSelection(false)}
                        >
                          Continue as {selectedLoginRole ? ROLE_CONTEXT[selectedLoginRole]?.title.replace(" Login", "") : "Selected Role"}
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="login-form"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                      >
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="mb-4 -ml-2 text-muted-foreground"
                          onClick={() => setShowRoleSelection(true)}
                        >
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Change role
                        </Button>
                        
                        {/* Login Method Selector */}
                        <div className="flex gap-1 p-1 bg-muted rounded-lg mb-4">
                          {LOGIN_METHODS.map((method) => {
                            const Icon = method.icon;
                            return (
                              <button
                                key={method.id}
                                type="button"
                                onClick={() => setLoginMethod(method.id)}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                                  loginMethod === method.id
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                              >
                                <Icon className="h-4 w-4" />
                                <span className="hidden sm:inline">{method.label}</span>
                              </button>
                            );
                          })}
                        </div>

                        <AnimatePresence mode="wait">
                          {loginMethod === "email" && (
                            <motion.form
                              key="email-login"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              onSubmit={handleLogin}
                              className="space-y-4"
                            >
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
                              <Button 
                                type="submit" 
                                className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md shadow-primary/20" 
                                disabled={isLoading}
                              >
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
                            </motion.form>
                          )}
                          
                          {loginMethod === "phone" && (
                            <motion.div
                              key="phone-login"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                            >
                              <PhoneLoginForm 
                                onSuccess={() => navigate(from, { replace: true })}
                              />
                            </motion.div>
                          )}
                          
                          {loginMethod === "mpcn_id" && (
                            <motion.div
                              key="mpcn-login"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                            >
                              <MpcnIdLoginForm 
                                onSuccess={() => navigate(from, { replace: true })}
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )}
                  </AnimatePresence>
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
                      <PasswordStrengthIndicator password={password} />
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
                              <span className="font-medium text-sm">Employee</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Join as a workforce member. You can become an investor later.
                            </p>
                          </div>
                        </label>

                        <label 
                          className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            accountType === "trader" ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                          }`}
                        >
                          <input
                            type="radio"
                            name="accountType"
                            value="trader"
                            checked={accountType === "trader"}
                            onChange={() => setAccountType("trader")}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <LineChart className="h-4 w-4 text-warning" />
                              <span className="font-medium text-sm">Trader</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Join the MPCN trading desk. Demo access first, live after evaluation.
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
                              <TrendingUp className="h-4 w-4 text-success" />
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
                              <TrendingUp className="h-4 w-4 text-success" />
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
                        {accountType === "trader" && (
                          <>
                            <li>• Complete trader onboarding with ethics acknowledgment</li>
                            <li>• Start with demo trading to prove your skills</li>
                            <li>• Earn access to live trading after evaluation</li>
                          </>
                        )}
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
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md shadow-primary/20" 
                      disabled={isLoading}
                    >
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
