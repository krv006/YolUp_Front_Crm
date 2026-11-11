import { cn } from "@/shared/lib/cn";

interface FormFieldProps extends Omit<React.LabelHTMLAttributes<HTMLLabelElement>, "type"> {
  id: string;
  label: string;
  required?: boolean;
  error?: string | null;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormField({
  id,
  label,
  required = false,
  error = null,
  hint,
  children,
  className,
}: FormFieldProps): React.ReactNode {
  return (
    <div className={cn("grid gap-2", className)}>
      <label htmlFor={id} className="text-sm font-semibold text-ink-secondary">
        {label}
        {required && <span className="ml-0.5 text-danger-ink">*</span>}
      </label>
      <div className="relative">{children}</div>
      {hint && !error && <p className="text-xs text-ink-muted">{hint}</p>}
      {error && <p className="text-xs text-danger-ink">{error}</p>}
    </div>
  );
}
