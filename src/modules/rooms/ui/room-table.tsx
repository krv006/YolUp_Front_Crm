import { DoorOpen, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { Chip } from "@/shared/ui/chip";
import { DataTable, type Column, type SortState } from "@/shared/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { EmptyState } from "@/shared/ui/empty-state";
import { Progress, occupancyTone } from "@/shared/ui/progress";
import { formatNumber } from "@/shared/lib";
import type { Room } from "../model/types";

interface RoomTableProps {
  rooms: Room[];
  isLoading: boolean;
  sort: SortState | null;
  onSortChange: (key: string) => void;
  onEdit: (room: Room) => void;
  onDelete: (room: Room) => void;
  onCreate: () => void;
  onClearFilters: () => void;
  filtered: boolean;
  /** Xona nomi → band o'quvchilar soni (guruhlardan hisoblanadi). */
  occupancy?: Record<string, number>;
}

export function RoomTable({
  rooms,
  isLoading,
  sort,
  onSortChange,
  onEdit,
  onDelete,
  onCreate,
  onClearFilters,
  filtered,
  occupancy = {},
}: RoomTableProps) {
  const columns: Column<Room>[] = [
    {
      key: "name",
      header: "Xona",
      sortable: true,
      render: (room) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 flex-none items-center justify-center rounded-sm bg-action-soft text-action-soft-text">
            <DoorOpen className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-ink">{room.name}</p>
            <p className="od-truncate text-xs text-ink-muted">ID: {room.id.slice(-6)}</p>
          </div>
        </div>
      ),
    },
    {
      key: "capacity",
      header: "Sig'im",
      align: "right",
      sortable: true,
      render: (room) => (
        <span className="money font-semibold text-ink">{formatNumber(room.capacity)}</span>
      ),
    },
    {
      key: "occupancy",
      header: "Bandlik",
      render: (room) => {
        const taken = occupancy[room.name] ?? 0;
        const percent = room.capacity > 0 ? Math.round((taken / room.capacity) * 100) : 0;
        return (
          <div className="flex min-w-[140px] items-center gap-3">
            <Progress
              value={percent}
              tone={occupancyTone(percent)}
              className="flex-1"
              label={`${room.name} bandligi`}
            />
            <span className="money w-10 text-right text-sm font-semibold text-ink-secondary">
              {percent}%
            </span>
          </div>
        );
      },
    },
    {
      key: "is_active",
      header: "Holat",
      render: (room) => (
        <Chip tone={room.is_active ? "success" : "neutral"} dot>
          {room.is_active ? "Faol" : "Nofaol"}
        </Chip>
      ),
    },
    {
      key: "actions",
      header: <span className="sr-only">Amallar</span>,
      align: "right",
      width: "104px",
      render: (room) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onEdit(room)}
            aria-label={`${room.name} xonasini tahrirlash`}
          >
            <Pencil className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`${room.name} uchun amallar`}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => onEdit(room)}>
                <Pencil className="h-4 w-4" />
                Tahrirlash
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => onDelete(room)}
                className="text-danger-ink focus:bg-danger-soft"
              >
                <Trash2 className="h-4 w-4" />
                O'chirish
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={rooms}
      rowKey={(room) => room.id}
      isLoading={isLoading}
      sort={sort}
      onSortChange={onSortChange}
      empty={
        <EmptyState
          icon={<DoorOpen className="h-6 w-6" />}
          title="Xona topilmadi"
          description={
            filtered
              ? "Qidiruvga mos xona yo'q. Filtrni o'zgartirib ko'ring."
              : "Xonalar jadval va bandlik hisobining asosi. Birinchi xonani qo'shing."
          }
          action={
            filtered ? (
              <Button variant="outline" size="sm" onClick={onClearFilters}>
                Filtrlarni tozalash
              </Button>
            ) : (
              <Button size="sm" onClick={onCreate}>
                <Plus className="h-4 w-4" />
                Xona qo'shish
              </Button>
            )
          }
        />
      }
    />
  );
}
