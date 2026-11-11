import { MessagesSquare } from "lucide-react";

import { Chip } from "@/shared/ui/chip";
import { DataTable, type Column } from "@/shared/ui/data-table";
import { EmptyState } from "@/shared/ui/empty-state";
import { formatDateTime, getInitials } from "@/shared/lib";
import type { MessageLog } from "../model/types";

const STATUS: Record<string, { label: string; tone: "neutral" | "info" | "success" | "danger" }> = {
  queued: { label: "Navbatda", tone: "neutral" },
  sent: { label: "Yuborildi", tone: "info" },
  delivered: { label: "Yetkazildi", tone: "success" },
  failed: { label: "Xato", tone: "danger" },
};

interface LogTableProps {
  logs: MessageLog[];
  isLoading: boolean;
}

export function LogTable({ logs, isLoading }: LogTableProps) {
  const columns: Column<MessageLog>[] = [
    {
      key: "recipient_name",
      header: "Qabul qiluvchi",
      render: (log) => {
        const name = log.recipient_name ?? "Noma'lum";
        return (
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-surface-2 text-xs font-bold text-ink-muted">
              {getInitials(name)}
            </span>
            <div className="min-w-0">
              <p className="od-truncate font-semibold text-ink">{name}</p>
              <p className="money od-truncate text-xs text-ink-muted">{log.recipient_phone}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: "template_name",
      header: "Shablon",
      render: (log) => (
        <span className="od-truncate text-ink-secondary">{log.template_name ?? "—"}</span>
      ),
    },
    {
      key: "status",
      header: "Holat",
      render: (log) => {
        const item = STATUS[log.status] ?? { label: log.status, tone: "neutral" as const };
        return (
          <Chip tone={item.tone} dot>
            {item.label}
          </Chip>
        );
      },
    },
    {
      key: "sent_at",
      header: "Vaqt",
      align: "right",
      render: (log) => (
        <span className="money text-ink-secondary">{formatDateTime(log.sent_at)}</span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={logs}
      rowKey={(log) => log.id}
      isLoading={isLoading}
      empty={
        <EmptyState
          icon={<MessagesSquare className="h-6 w-6" />}
          title="Log bo'sh"
          description="Yuborilgan xabarlar shu yerda ko'rinadi."
        />
      }
    />
  );
}
