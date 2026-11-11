import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Lock, Mail, Phone, UserRound } from "lucide-react";

import { useLogin } from "../api/auth-queries";
import { toastError, toastInfo } from "@/shared/lib/toast";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Switch } from "@/shared/ui/switch";
import { loginSchema, type LoginValues } from "../model/schemas";

interface LoginFormProps {
  onSuccess: () => void;
}

type Mode = "phone" | "email";

/**
 * Demo hisoblar — mock backend identifikatorga qarab **rolni** aniqlaydi,
 * shuning uchun o'qituvchi/o'quvchi/ota-ona kabinetlarini shu yerdan
 * sinash mumkin. Haqiqiy backend ulanganda bu blok olib tashlanadi.
 */
const DEMO_ACCOUNTS = [
  { identifier: "admin", password: "admin123", label: "Direktor", hint: "To'liq huquq" },
  { identifier: "nodira.ahmedova", password: "demo123", label: "Administrator", hint: "Jamoa va moliya" },
  { identifier: "dilnoza.yusupova", password: "demo123", label: "O'qituvchi", hint: "Guruhlari va davomat" },
  { identifier: "student", password: "demo123", label: "O'quvchi", hint: "Shaxsiy kabinet" },
  { identifier: "parent", password: "demo123", label: "Ota-ona", hint: "Farzandlari" },
] as const;

export function LoginForm({ onSuccess }: LoginFormProps) {
  const login = useLogin();
  const [mode, setMode] = useState<Mode>("phone");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "admin", password: "admin123" },
  });

  const submit = handleSubmit((values) => {
    login.mutate(values, {
      onSuccess: () => onSuccess(),
      onError: (error) => toastError(error),
    });
  });

  return (
    <form onSubmit={submit} className="grid gap-5">
      {/* Mode switch */}
      <div
        className="grid grid-cols-2 gap-1 rounded-md bg-surface-2 p-1"
        role="tablist"
        aria-label="Kirish usuli"
      >
        {(
          [
            { key: "phone", label: "Telefon", icon: Phone },
            { key: "email", label: "Email", icon: Mail },
          ] as const
        ).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={mode === key}
            onClick={() => setMode(key)}
            className={cn(
              "inline-flex min-h-9 items-center justify-center gap-2 rounded-sm text-sm font-semibold transition-colors",
              mode === key
                ? "bg-surface text-ink shadow-xs"
                : "text-ink-muted hover:text-ink",
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Identifier */}
      <div className="grid gap-2">
        <label htmlFor="identifier" className="text-sm font-semibold text-ink-secondary">
          {mode === "phone" ? "Telefon raqam" : "Email manzil"}
        </label>
        <Input
          id="identifier"
          autoComplete={mode === "phone" ? "tel" : "email"}
          placeholder={mode === "phone" ? "+998 90 000 00 00" : "siz@yolup.uz"}
          leftIcon={
            mode === "phone" ? <Phone className="h-4 w-4" /> : <Mail className="h-4 w-4" />
          }
          aria-invalid={Boolean(errors.identifier)}
          {...register("identifier")}
        />
        {errors.identifier && (
          <p className="text-xs text-danger-ink">{errors.identifier.message}</p>
        )}
      </div>

      {/* Password */}
      <div className="grid gap-2">
        <label htmlFor="password" className="text-sm font-semibold text-ink-secondary">
          Parol
        </label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            className="pl-10 pr-11"
            leftIcon={<Lock className="h-4 w-4" />}
            aria-invalid={Boolean(errors.password)}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Parolni yashirish" : "Parolni ko'rsatish"}
            className="absolute right-1.5 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-sm text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-danger-ink">{errors.password.message}</p>}
      </div>

      {/* Remember + reset */}
      <div className="flex items-center justify-between gap-3">
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-secondary">
          <Switch checked={remember} onCheckedChange={setRemember} />
          Eslab qolish
        </label>
        <button
          type="button"
          onClick={() => toastInfo("Parolni administratoringiz tiklab beradi")}
          className="text-sm font-semibold text-action-soft-text hover:underline"
        >
          Parolni tiklash
        </button>
      </div>

      <Button type="submit" size="lg" block loading={login.isPending}>
        Kirish
      </Button>

      {/*
       * Demo rejim: mock backend identifikatorga qarab rolni aniqlaydi
       * (`admin` → direktor, `student` → o'quvchi kabineti, ...). Bu blok
       * haqiqiy backend ulanganda olib tashlanadi.
       */}
      <div className="grid gap-2.5 rounded-md border border-border bg-surface-inset p-3">
        <p className="text-xs font-semibold text-ink-secondary">
          Demo hisoblar — rolni sinash uchun
        </p>
        <div className="flex flex-wrap gap-1.5">
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.identifier}
              type="button"
              title={account.hint}
              onClick={() => {
                setValue("identifier", account.identifier, { shouldDirty: true });
                setValue("password", account.password, { shouldDirty: true });
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-border-strong bg-surface px-2.5 py-1 text-xs font-semibold text-ink-secondary transition-colors hover:border-action hover:text-action-soft-text"
            >
              <UserRound className="h-3 w-3" />
              {account.label}
            </button>
          ))}
        </div>
        <p className="text-[11px] leading-snug text-ink-muted">
          Hisobni tanlang — maydonlar to'ldiriladi, keyin <b>Kirish</b> bosing.
        </p>
      </div>
    </form>
  );
}
