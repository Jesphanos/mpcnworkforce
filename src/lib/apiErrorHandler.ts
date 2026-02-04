import { toast } from "sonner";

interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
  details?: unknown;
}

interface ErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
  retryable?: boolean;
}

// Standard error messages for common error codes
const errorMessages: Record<string, string> = {
  "PGRST116": "No data found",
  "PGRST301": "Request timeout - please try again",
  "23505": "This record already exists",
  "23503": "This action conflicts with related data",
  "42501": "You don't have permission to perform this action",
  "42P01": "Data structure error - please contact support",
  "NETWORK_ERROR": "Unable to connect to the server",
  "UNAUTHORIZED": "Please sign in to continue",
  "FORBIDDEN": "You don't have access to this resource",
  "NOT_FOUND": "The requested resource was not found",
  "RATE_LIMITED": "Too many requests - please wait a moment",
};

// Parse and normalize various error formats
export function parseApiError(error: unknown): ApiError {
  if (error instanceof Error) {
    // Check for Supabase error structure
    const supabaseError = error as any;
    
    if (supabaseError.code) {
      return {
        message: errorMessages[supabaseError.code] || supabaseError.message,
        code: supabaseError.code,
        statusCode: supabaseError.status,
        details: supabaseError.details,
      };
    }
    
    return {
      message: error.message,
    };
  }
  
  if (typeof error === "object" && error !== null) {
    const errObj = error as Record<string, unknown>;
    return {
      message: (errObj.message as string) || "An unexpected error occurred",
      code: errObj.code as string,
      statusCode: errObj.statusCode as number,
      details: errObj.details,
    };
  }
  
  return {
    message: String(error),
  };
}

// Main error handler
export function handleApiError(
  error: unknown,
  options: ErrorHandlerOptions = {}
): ApiError {
  const { showToast = true, logError = true } = options;
  
  const parsedError = parseApiError(error);
  
  if (logError) {
    console.error("[API Error]", {
      message: parsedError.message,
      code: parsedError.code,
      statusCode: parsedError.statusCode,
      details: parsedError.details,
      originalError: error,
    });
  }
  
  if (showToast) {
    const toastMessage = parsedError.message || "An error occurred";
    toast.error(toastMessage);
  }
  
  return parsedError;
}

// Create a wrapped fetch with automatic error handling
export function createApiClient<T>(
  fetcher: () => Promise<T>,
  options: ErrorHandlerOptions = {}
): Promise<T> {
  return fetcher().catch((error) => {
    handleApiError(error, options);
    throw error;
  });
}

// Retry utility for transient failures
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000,
  shouldRetry: (error: unknown) => boolean = isRetryableError
): Promise<T> {
  let lastError: unknown;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (!shouldRetry(error) || attempt === maxRetries - 1) {
        throw error;
      }
      
      // Exponential backoff
      await new Promise(resolve => 
        setTimeout(resolve, delayMs * Math.pow(2, attempt))
      );
    }
  }
  
  throw lastError;
}

// Check if an error is retryable
export function isRetryableError(error: unknown): boolean {
  const parsedError = parseApiError(error);
  
  // Network errors are retryable
  if (parsedError.code === "NETWORK_ERROR") return true;
  
  // Rate limiting is retryable
  if (parsedError.statusCode === 429) return true;
  
  // Server errors (5xx) are retryable
  if (parsedError.statusCode && parsedError.statusCode >= 500) return true;
  
  // Timeout errors are retryable
  if (parsedError.code === "PGRST301") return true;
  
  return false;
}

// Error boundary fallback component props generator
export function getErrorFallbackProps(error: unknown, resetFn?: () => void) {
  const parsedError = parseApiError(error);
  
  return {
    title: "Something went wrong",
    message: parsedError.message,
    retryable: isRetryableError(error),
    onRetry: resetFn,
  };
}
