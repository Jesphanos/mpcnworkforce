import { AlertCircle, RefreshCw, HelpCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ContextualErrorProps {
  title?: string;
  message: string;
  suggestion?: string;
  onRetry?: () => void;
  onBack?: () => void;
  helpLink?: string;
  variant?: "inline" | "card" | "fullPage";
  className?: string;
}

export function ContextualError({
  title = "Something went wrong",
  message,
  suggestion,
  onRetry,
  onBack,
  helpLink,
  variant = "card",
  className,
}: ContextualErrorProps) {
  const content = (
    <>
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-full bg-destructive/10">
          <AlertCircle className="h-5 w-5 text-destructive" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-foreground">{title}</h4>
          <p className="text-sm text-muted-foreground mt-1">{message}</p>
          {suggestion && (
            <p className="text-sm text-muted-foreground mt-2 p-2 rounded bg-muted/50">
              💡 <span className="font-medium">Suggestion:</span> {suggestion}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 mt-4">
        {onBack && (
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Go Back
          </Button>
        )}
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Try Again
          </Button>
        )}
        {helpLink && (
          <Button variant="ghost" size="sm" asChild>
            <a href={helpLink} target="_blank" rel="noopener noreferrer">
              <HelpCircle className="h-4 w-4 mr-1" />
              Get Help
            </a>
          </Button>
        )}
      </div>
    </>
  );

  if (variant === "inline") {
    return (
      <div className={cn("p-4 rounded-lg border border-destructive/30 bg-destructive/5", className)}>
        {content}
      </div>
    );
  }

  if (variant === "fullPage") {
    return (
      <div className={cn("flex items-center justify-center min-h-[400px]", className)}>
        <Card className="max-w-md w-full border-destructive/30">
          <CardContent className="pt-6">
            {content}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card className={cn("border-destructive/30", className)}>
      <CardContent className="pt-6">
        {content}
      </CardContent>
    </Card>
  );
}

// Preset error messages with suggestions
export const ERROR_MESSAGES = {
  network: {
    title: "Connection Issue",
    message: "Unable to connect to the server.",
    suggestion: "Check your internet connection and try again.",
  },
  auth: {
    title: "Authentication Error",
    message: "Your session may have expired.",
    suggestion: "Try signing out and signing back in.",
  },
  permission: {
    title: "Access Denied",
    message: "You don't have permission to perform this action.",
    suggestion: "Contact your administrator if you believe this is an error.",
  },
  notFound: {
    title: "Not Found",
    message: "The requested resource could not be found.",
    suggestion: "The item may have been deleted or moved.",
  },
  validation: {
    title: "Validation Error",
    message: "Some fields contain invalid data.",
    suggestion: "Review the highlighted fields and correct any errors.",
  },
  rateLimit: {
    title: "Too Many Requests",
    message: "You've made too many requests. Please wait before trying again.",
    suggestion: "Wait a minute before retrying.",
  },
};
