import { Search, X } from "lucide-react";

import { cn } from "@/shared/lib/cn";
import { Input } from "./input";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  /** `sm` — ixcham toolbar uchun pastroq maydon. */
  size?: "sm" | "md";
  className?: string;
}

/** Search field for list toolbars — has a built-in clear button. */
export function SearchInput({
  value,
  onChange,
  placeholder = "Qidirish…",
  label = "Qidirish",
  size = "md",
  className,
}: SearchInputProps) {
  return (
    <div className={cn("relative", className)}>
      <Input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={label}
        leftIcon={<Search className="h-4 w-4" />}
        className={cn(
          "pr-9 [&::-webkit-search-cancel-button]:hidden",
          size === "sm" ? "h-9 text-sm" : "h-10",
        )}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Qidiruvni tozalash"
          className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-sm text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
