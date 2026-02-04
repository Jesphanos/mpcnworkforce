import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";

interface UndoableActionOptions<T> {
  action: () => Promise<void>;
  undoAction: () => Promise<void>;
  successMessage: string;
  undoMessage?: string;
  timeoutMs?: number;
  data?: T;
}

interface UndoState<T> {
  isPending: boolean;
  canUndo: boolean;
  data?: T;
}

export function useUndoableAction<T = void>() {
  const [state, setState] = useState<UndoState<T>>({
    isPending: false,
    canUndo: false,
  });
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const toastIdRef = useRef<string | number | null>(null);

  const execute = useCallback(async ({
    action,
    undoAction,
    successMessage,
    undoMessage = "Action undone",
    timeoutMs = 5000,
    data,
  }: UndoableActionOptions<T>) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setState({ isPending: true, canUndo: true, data });

    // Show toast with undo button
    toastIdRef.current = toast(successMessage, {
      action: {
        label: "Undo",
        onClick: async () => {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          
          try {
            await undoAction();
            toast.success(undoMessage);
            setState({ isPending: false, canUndo: false });
          } catch (error) {
            toast.error("Failed to undo action");
            console.error("Undo failed:", error);
          }
        },
      },
      duration: timeoutMs,
    });

    // Set timeout to execute the actual action
    timeoutRef.current = setTimeout(async () => {
      try {
        await action();
        setState({ isPending: false, canUndo: false });
      } catch (error) {
        toast.error("Action failed");
        console.error("Action failed:", error);
        setState({ isPending: false, canUndo: false });
      }
    }, timeoutMs);
  }, []);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (toastIdRef.current) {
      toast.dismiss(toastIdRef.current);
      toastIdRef.current = null;
    }
    setState({ isPending: false, canUndo: false });
  }, []);

  return {
    ...state,
    execute,
    cancel,
  };
}

// Simplified hook for delete actions specifically
export function useUndoableDelete<T extends { id: string }>() {
  const undoable = useUndoableAction<T>();
  const [deletedItems, setDeletedItems] = useState<T[]>([]);

  const deleteWithUndo = useCallback(async ({
    item,
    deleteAction,
    restoreAction,
    itemName = "Item",
  }: {
    item: T;
    deleteAction: (id: string) => Promise<void>;
    restoreAction: (item: T) => Promise<void>;
    itemName?: string;
  }) => {
    // Optimistically remove from UI
    setDeletedItems(prev => [...prev, item]);

    await undoable.execute({
      action: async () => {
        await deleteAction(item.id);
        setDeletedItems(prev => prev.filter(i => i.id !== item.id));
      },
      undoAction: async () => {
        await restoreAction(item);
        setDeletedItems(prev => prev.filter(i => i.id !== item.id));
      },
      successMessage: `${itemName} deleted`,
      undoMessage: `${itemName} restored`,
      data: item,
    });
  }, [undoable]);

  return {
    ...undoable,
    deleteWithUndo,
    deletedItemIds: deletedItems.map(i => i.id),
    isDeleted: (id: string) => deletedItems.some(i => i.id === id),
  };
}
