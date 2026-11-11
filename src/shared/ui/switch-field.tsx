import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";

import { cn } from "@/shared/lib/cn";
import { Switch } from "./switch";

interface SwitchFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  hint?: string;
  className?: string;
}

/** Labelled toggle row wired into react-hook-form. */
export function SwitchField<T extends FieldValues>({
  control,
  name,
  label,
  hint,
  className,
}: SwitchFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div
          className={cn(
            "flex items-center justify-between gap-4 rounded-md border border-border bg-surface-inset px-4 py-3",
            className,
          )}
        >
          <div>
            <p className="text-sm font-semibold text-ink-secondary">{label}</p>
            {hint && <p className="mt-0.5 text-xs text-ink-muted">{hint}</p>}
          </div>
          <Switch
            checked={Boolean(field.value)}
            onCheckedChange={field.onChange}
            aria-label={label}
          />
        </div>
      )}
    />
  );
}
