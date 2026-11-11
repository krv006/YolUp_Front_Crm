import { useState } from "react";

import { LoginForm } from "@/core/auth";
import { cn } from "@/shared/lib/cn";

const LANGUAGES = ["uz", "ru", "en"] as const;

export default function LoginPage() {
  const [lang, setLang] = useState<(typeof LANGUAGES)[number]>("uz");

  return (
    <div className="grid gap-7">
      {/* Brand — visible when the hero is hidden on small screens */}
      <div className="flex items-center gap-3 lg:hidden">
        <img src="/yolup-mark.png" alt="YolUp" width={36} height={36} />
        <span className="font-display text-xl font-extrabold tracking-[-0.02em] text-ink">
          YolUp
        </span>
      </div>

      <div>
        <h1 className="font-display text-[1.75rem] font-extrabold tracking-[-0.02em] text-ink">
          Xush kelibsiz
        </h1>
        <p className="mt-1.5 text-[15px] text-ink-muted">
          Hisobingizga kirib, markazingizni boshqarishni davom ettiring.
        </p>
      </div>

      <LoginForm onSuccess={() => window.location.assign("/")} />

      <div className="grid gap-4 border-t border-divider pt-5">
        <div className="flex items-center justify-center gap-1">
          {LANGUAGES.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => setLang(code)}
              aria-pressed={lang === code}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold uppercase transition-colors",
                lang === code
                  ? "bg-action-soft text-action-soft-text"
                  : "text-ink-muted hover:bg-surface-2 hover:text-ink",
              )}
            >
              {code}
            </button>
          ))}
        </div>

        <p className="text-center text-xs text-ink-muted">
          Demo rejim — rol yuqoridagi hisoblardan tanlanadi (parol shart emas).
        </p>
      </div>
    </div>
  );
}
