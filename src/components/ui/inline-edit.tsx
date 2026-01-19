import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Check, X, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

interface InlineEditProps {
  value: string;
  onSave: (value: string) => Promise<void> | void;
  type?: "text" | "textarea";
  placeholder?: string;
  className?: string;
  displayClassName?: string;
  editable?: boolean;
  emptyText?: string;
}

export function InlineEdit({
  value,
  onSave,
  type = "text",
  placeholder = "Click to edit",
  className,
  displayClassName,
  editable = true,
  emptyText = "Not set",
}: InlineEditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleSave = async () => {
    if (editValue === value) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(editValue);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (!editable) {
    return (
      <span className={cn("text-foreground", displayClassName)}>
        {value || <span className="text-muted-foreground">{emptyText}</span>}
      </span>
    );
  }

  if (isEditing) {
    const InputComponent = type === "textarea" ? Textarea : Input;

    return (
      <div className={cn("flex items-start gap-2", className)}>
        <InputComponent
          ref={inputRef as any}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isSaving}
          className="flex-1"
          rows={type === "textarea" ? 3 : undefined}
        />
        <div className="flex gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-success hover:text-success hover:bg-success/10"
            onClick={handleSave}
            disabled={isSaving}
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={handleCancel}
            disabled={isSaving}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group flex items-center gap-2 cursor-pointer rounded-md hover:bg-muted/50 p-1 -m-1 transition-colors",
        className
      )}
      onClick={() => setIsEditing(true)}
    >
      <span className={cn("flex-1", displayClassName)}>
        {value || <span className="text-muted-foreground italic">{emptyText}</span>}
      </span>
      <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}
