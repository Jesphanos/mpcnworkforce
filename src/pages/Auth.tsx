import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  TrendingUp,
  Briefcase,
  ArrowLeft,
  Mail,
  Phone,
  User,
  LineChart,
} from "lucide-react";
import { z } from "zod";
import { SignupPhoneField, COUNTRIES } from "@/components/auth/SignupPhoneField";
import { PasswordStrengthIndicator } from "@/components/auth/PasswordStrengthIndicator";
import { ModernRoleSelectionGrid, LoginRoleType } from "@/components/auth/ModernRoleSelectionGrid";
import { PhoneLoginForm } from "@/components/auth/PhoneLoginForm";
import { MpcnIdLoginForm } from "@/components/auth/MpcnIdLoginForm";
import { AnimatedLogo } from "@/components/auth/AnimatedLogo";
import { AuthTabsPill } from "@/components/auth/AuthTabsPill";
import { ContinueButton } from "@/components/auth/ContinueButton";
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
        description:
          error.message === "Invalid login credentials"
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
      const selectedCountry = COUNTRIES.find((c) => c.code === countryCode);
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
    <div className="min-h-screen flex items-center justify-center auth-bg p-4 relative overflow-hidden">
      {/* Abstract background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -right-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-primary/3 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md animate-fade-in relative z-10">
        {/* Animated Logo with Tagline */}
        <div className="mb-8">
          <AnimatedLogo size="lg" showTagline={true} />
        </div>

        <Card className="border-border/30 shadow-2xl bg-card/95 backdrop-blur-md rounded-3xl overflow-hidden">
          <CardContent className="p-6">
            {mode === "forgot" ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="text-xl font-semibold text-center mb-2">Reset Password</h2>
                <p className="text-sm text-muted-foreground text-center mb-6">
                  Enter your email to receive reset instructions
                </p>
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
                      className="rounded-xl h-12"
                    />
                  </div>
                  <ContinueButton type="submit" isLoading={isLoading}>
                    Send Reset Link
                  </ContinueButton>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => setMode("login")}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to login
                  </Button>
                </form>
              </motion.div>
            ) : (
              <>
                {/* Pill-style tabs */}
                <div className="mb-6">
                  <AuthTabsPill
                    activeTab={mode as "login" | "signup"}
                    onTabChange={(tab) => {
                      setMode(tab);
                      setShowRoleSelection(true);
                    }}
                  />
                </div>

                <AnimatePresence mode="wait">
                  {mode === "login" && (
                    <motion.div
                      key="login"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                    >
                      <AnimatePresence mode="wait">
                        {showRoleSelection ? (
                          <motion.div
                            key="role-selection"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-5"
                          >
                            <div className="text-center mb-4">
                              <h2 className="text-lg font-semibold">Select Your Role</h2>
                              <p className="text-sm text-muted-foreground">
                                Choose the role that matches your position
                              </p>
                            </div>

                            <ModernRoleSelectionGrid
                              selectedRole={selectedLoginRole}
                              onRoleSelect={(role) => setSelectedLoginRole(role)}
                            />

                            <ContinueButton
                              disabled={!selectedLoginRole}
                              onClick={() => setShowRoleSelection(false)}
                            >
                              Continue as{" "}
                              {selectedLoginRole
                                ? ROLE_CONTEXT[selectedLoginRole]?.title.replace(" Login", "")
                                : "Selected Role"}
                            </ContinueButton>
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

                            {/* Role context header */}
                            {roleContext && (
                              <div className="text-center mb-4">
                                <h2 className="text-lg font-semibold">{roleContext.title}</h2>
                                <p className="text-sm text-muted-foreground">{roleContext.description}</p>
                              </div>
                            )}

                            {/* Login Method Selector */}
                            <div className="flex gap-1 p-1 bg-muted/50 rounded-xl mb-4">
                              {LOGIN_METHODS.map((method) => {
                                const Icon = method.icon;
                                return (
                                  <button
                                    key={method.id}
                                    type="button"
                                    onClick={() => setLoginMethod(method.id)}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
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
                                      className="rounded-xl h-12"
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
                                      className="rounded-xl h-12"
                                    />
                                  </div>
                                  <ContinueButton type="submit" isLoading={isLoading}>
                                    Sign In
                                  </ContinueButton>
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
                                  <PhoneLoginForm onSuccess={() => navigate(from, { replace: true })} />
                                </motion.div>
                              )}

                              {loginMethod === "mpcn_id" && (
                                <motion.div
                                  key="mpcn-login"
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                >
                                  <MpcnIdLoginForm onSuccess={() => navigate(from, { replace: true })} />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}

                  {mode === "signup" && (
                    <motion.div
                      key="signup"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <div className="text-center mb-4">
                        <h2 className="text-lg font-semibold">Request Access</h2>
                        <p className="text-sm text-muted-foreground">
                          Complete your details to join the organization
                        </p>
                      </div>

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
                            className="rounded-xl h-12"
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
                            className="rounded-xl h-12"
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
                            className="rounded-xl h-12"
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
                            <AccountTypeOption
                              icon={Briefcase}
                              iconColor="text-primary"
                              label="Employee"
                              description="Join as a workforce member. You can become an investor later."
                              isSelected={accountType === "employee"}
                              onSelect={() => setAccountType("employee")}
                            />

                            <AccountTypeOption
                              icon={LineChart}
                              iconColor="text-warning"
                              label="Trader"
                              description="Join the MPCN trading desk. Demo access first, live after evaluation."
                              isSelected={accountType === "trader"}
                              onSelect={() => setAccountType("trader")}
                            />

                            <AccountTypeOption
                              icon={TrendingUp}
                              iconColor="text-success"
                              label="Investor Only"
                              description="Invest in MPCN and track your returns. No workforce duties."
                              isSelected={accountType === "investor"}
                              onSelect={() => setAccountType("investor")}
                            />

                            <AccountTypeOption
                              icons={[Briefcase, TrendingUp]}
                              iconColors={["text-primary", "text-success"]}
                              label="Employee + Investor"
                              description="Work in MPCN and invest. Separate dashboards for each role."
                              isSelected={accountType === "both"}
                              onSelect={() => setAccountType("both")}
                            />
                          </div>
                        </div>

                        <div className="bg-muted/50 p-4 rounded-xl space-y-2">
                          <p className="text-xs font-medium text-muted-foreground">What happens next:</p>
                          <ul className="text-xs text-muted-foreground space-y-1">
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
                        <ContinueButton type="submit" isLoading={isLoading}>
                          Create Account
                        </ContinueButton>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Account type option component for signup
interface AccountTypeOptionProps {
  icon?: React.ElementType;
  icons?: React.ElementType[];
  iconColor?: string;
  iconColors?: string[];
  label: string;
  description: string;
  isSelected: boolean;
  onSelect: () => void;
}

function AccountTypeOption({
  icon: Icon,
  icons,
  iconColor,
  iconColors,
  label,
  description,
  isSelected,
  onSelect,
}: AccountTypeOptionProps) {
  return (
    <motion.label
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
        isSelected
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-border/50 hover:border-primary/30 hover:bg-muted/30"
      }`}
    >
      <input
        type="radio"
        name="accountType"
        checked={isSelected}
        onChange={onSelect}
        className="mt-1 accent-primary"
      />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          {Icon && <Icon className={`h-4 w-4 ${iconColor}`} />}
          {icons?.map((IconItem, i) => (
            <IconItem key={i} className={`h-4 w-4 ${iconColors?.[i]}`} />
          ))}
          <span className="font-medium text-sm">{label}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </div>
    </motion.label>
  );
}
