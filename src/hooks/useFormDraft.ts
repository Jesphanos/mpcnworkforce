import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";

interface UseFormDraftOptions<T> {
  key: string;
  initialData?: T;
  debounceMs?: number;
  showToast?: boolean;
  storage?: "localStorage" | "sessionStorage";
}

interface FormDraftState<T> {
  data: T;
  lastSaved: string | null;
  isDirty: boolean;
}

export function useFormDraft<T extends Record<string, any>>({
  key,
  initialData,
  debounceMs = 1000,
  showToast = true,
  storage = "localStorage",
}: UseFormDraftOptions<T>) {
  const storageKey = `form-draft-${key}`;
  const storageAPI = storage === "localStorage" ? localStorage : sessionStorage;
  
  // Load draft from storage
  const loadDraft = useCallback((): T | null => {
    try {
      const saved = storageAPI.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.data as T;
      }
    } catch (error) {
      console.error("Failed to load form draft:", error);
    }
    return null;
  }, [storageKey, storageAPI]);

  const [state, setState] = useState<FormDraftState<T>>(() => {
    const draft = loadDraft();
    return {
      data: draft || initialData || ({} as T),
      lastSaved: null,
      isDirty: false,
    };
  });

  const [hasDraft, setHasDraft] = useState(() => {
    const saved = storageAPI.getItem(storageKey);
    return !!saved;
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced save to storage
  const saveDraft = useCallback((data: T) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      try {
        const draftData = {
          data,
          savedAt: new Date().toISOString(),
        };
        storageAPI.setItem(storageKey, JSON.stringify(draftData));
        setHasDraft(true);
        setState(prev => ({
          ...prev,
          lastSaved: draftData.savedAt,
          isDirty: false,
        }));
        if (showToast) {
          toast.success("Draft saved", { duration: 1500 });
        }
      } catch (error) {
        console.error("Failed to save form draft:", error);
      }
    }, debounceMs);
  }, [storageKey, debounceMs, showToast, storageAPI]);

  // Update form data
  const updateDraft = useCallback((updates: Partial<T> | ((prev: T) => T)) => {
    setState(prev => {
      const newData = typeof updates === "function" 
        ? updates(prev.data)
        : { ...prev.data, ...updates };
      
      saveDraft(newData);
      
      return {
        ...prev,
        data: newData,
        isDirty: true,
      };
    });
  }, [saveDraft]);

  // Clear draft
  const clearDraft = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    storageAPI.removeItem(storageKey);
    setHasDraft(false);
    setState({
      data: initialData || ({} as T),
      lastSaved: null,
      isDirty: false,
    });
  }, [storageKey, initialData, storageAPI]);

  // Restore draft
  const restoreDraft = useCallback((): T | null => {
    const draft = loadDraft();
    if (draft) {
      setState({
        data: draft,
        lastSaved: null,
        isDirty: false,
      });
      if (showToast) {
        toast.info("Draft restored");
      }
      return draft;
    }
    return null;
  }, [loadDraft, showToast]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Get formatted last saved time
  const getLastSavedText = useCallback(() => {
    if (!state.lastSaved) return null;
    
    const date = new Date(state.lastSaved);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }, [state.lastSaved]);

  return {
    data: state.data,
    isDirty: state.isDirty,
    hasDraft,
    lastSaved: state.lastSaved,
    lastSavedText: getLastSavedText(),
    updateDraft,
    clearDraft,
    restoreDraft,
  };
}

// Simple hook for form field updates
export function useDraftField<T>(
  draft: ReturnType<typeof useFormDraft<T>>,
  fieldName: keyof T
) {
  const value = draft.data[fieldName];
  
  const onChange = useCallback((newValue: T[keyof T]) => {
    draft.updateDraft({ [fieldName]: newValue } as Partial<T>);
  }, [draft, fieldName]);

  return { value, onChange };
}
