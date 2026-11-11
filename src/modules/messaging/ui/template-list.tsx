import { MessageSquare, Send } from "lucide-react";

import { cn } from "@/shared/lib/cn";
import { Chip } from "@/shared/ui/chip";
import { EmptyState } from "@/shared/ui/empty-state";
import { Skeleton } from "@/shared/ui/skeleton";
import type { MessageTemplate } from "../model/types";

const CHANNEL_LABEL: Record<string, string> = {
  sms: "SMS",
  telegram: "Telegram",
  push: "Push",
};

interface TemplateListProps {
  templates: MessageTemplate[];
  isLoading: boolean;
  selectedId?: string | null;
  onSelect: (template: MessageTemplate) => void;
}

/** Tanlanadigan shablonlar ro'yxati — matn o'ng tomondagi formaga tushadi. */
export function TemplateList({ templates, isLoading, selectedId, onSelect }: TemplateListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-[74px] w-full rounded-md" />
        ))}
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <EmptyState
        icon={<MessageSquare className="h-6 w-6" />}
        title="Shablon yo'q"
        description="Shablonlar SMS matnlarini bir marta yozib, qayta ishlatish imkonini beradi."
      />
    );
  }

  return (
    <div className="grid gap-3">
      {templates.map((template) => {
        const active = template.id === selectedId;
        return (
          <button
            key={template.id}
            type="button"
            onClick={() => onSelect(template)}
            aria-pressed={active}
            className={cn(
              "grid gap-2 rounded-md border p-4 text-left transition-[border-color,background-color,box-shadow]",
              active
                ? "border-action bg-action-soft/50 shadow-xs"
                : "border-border bg-surface hover:border-border-strong",
            )}
          >
            <span className="flex items-center gap-2">
              <span className="od-truncate flex-1 font-semibold text-ink">{template.name}</span>
              <Chip tone="brand">{CHANNEL_LABEL[template.channel] ?? template.channel}</Chip>
            </span>
            <span className="line-clamp-2 text-xs leading-relaxed text-ink-muted">
              {template.body}
            </span>
            {active && (
              <span className="flex items-center gap-1 text-xs font-semibold text-action-soft-text">
                <Send className="h-3 w-3" />
                Matn formaga yuklandi
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
