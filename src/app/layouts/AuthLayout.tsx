import { ReactNode } from "react";
import { Check } from "lucide-react";

const POINTS = [
  "Filiallar va guruhlarni bitta panelda boshqaring",
  "Davomat, to'lov va qarzlarni real vaqtda kuzatib boring",
  "SMS va Telegram orqali ota-onalar bilan aloqada bo'ling",
];

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)]">
      {/* Hero */}
      <aside className="relative hidden overflow-hidden bg-gradient-hero p-12 text-ink-on-dark lg:flex lg:flex-col">
        <svg
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[240px] w-full opacity-25"
          viewBox="0 0 600 240"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0 150 C120 110 210 190 330 150 C440 116 520 176 600 140 V240 H0 Z"
            fill="rgba(255,255,255,0.14)"
          />
          <path
            d="M0 180 C130 140 220 214 340 176 C450 142 530 196 600 168 V240 H0 Z"
            fill="rgba(255,255,255,0.1)"
          />
        </svg>

        <div className="relative z-10 flex flex-1 flex-col">
          <div className="flex items-center gap-3">
            <img src="/yolup-mark.png" alt="YolUp" width={40} height={40} />
            <span className="font-display text-2xl font-extrabold tracking-[-0.02em] text-white">
              YolUp
            </span>
            <span className="rounded-full border border-brand-400/30 bg-brand-400/[0.14] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.06em] text-brand-300">
              CRM
            </span>
          </div>

          <div className="my-auto max-w-[520px] py-12">
            <h1 className="font-display text-[2.75rem] font-extrabold leading-[1.08] tracking-[-0.02em] text-white">
              Learn Today,
              <br />
              Go Further.
            </h1>
            <p className="mt-5 text-[17px] leading-relaxed text-ink-on-dark-2">
              O'quv markazlari uchun zamonaviy boshqaruv tizimi. Tez, tinch va
              ishonchli — har bir filial uchun.
            </p>

            <ul className="mt-9 grid gap-4">
              {POINTS.map((point) => (
                <li key={point} className="flex items-start gap-3 text-[15px] text-[#dbe4ff]">
                  <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-brand-400/20 text-brand-300">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-[#7f8bbd]">
            © {new Date().getFullYear()} YolUp. Barcha huquqlar himoyalangan.
          </p>
        </div>
      </aside>

      {/* Panel */}
      <main className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-[400px]">{children}</div>
      </main>
    </div>
  );
}
