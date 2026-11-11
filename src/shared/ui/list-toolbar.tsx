import type { ReactNode } from "react";

import { cn } from "@/shared/lib/cn";
import { Card } from "./card";
import { SearchInput } from "./search-input";

interface ListToolbarProps {
  /** Qidiruv maydonining qiymati (odatda `useListState().search`). */
  value: string;
  onSearch: (value: string) => void;
  placeholder?: string;
  /**
   * Filtr boshqaruvlari (odatda `Select`). Har biri bir xil kenglikdagi
   * ustunga o'raladi — `Select` ildizi `w-full` bo'lgani uchun kenglikni
   * faqat shu qatlam belgilay oladi.
   */
  filters?: ReactNode[];
  /** O'ng tomondagi ixcham izoh — odatda natijalar soni. */
  hint?: ReactNode;
  /** Izohdan oldingi qo'shimcha boshqaruv (masalan ko'rinish tanlovi). */
  trailing?: ReactNode;
  className?: string;
}

/**
 * Ro'yxat sahifalarining yagona ixcham filtri: qidiruv + filtrlar + izoh.
 * Balandlik, oraliq va o'lchamlar shu yerda belgilanadi — shuning uchun
 * barcha ro'yxat sahifalari bir xil ko'rinadi.
 */
export function ListToolbar({
  value,
  onSearch,
  placeholder = "Qidirish…",
  filters,
  hint,
  trailing,
  className,
}: ListToolbarProps) {
  return (
    <Card className={cn("p-2.5", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <SearchInput
          size="sm"
          value={value}
          onChange={onSearch}
          placeholder={placeholder}
          className="w-full sm:w-[240px]"
        />

        {filters?.map((filter, index) => (
          <div key={index} className="w-full sm:w-[200px]">
            {filter}
          </div>
        ))}

        <div className="ml-auto flex flex-wrap items-center gap-2">
          {trailing}
          {hint ? (
            <span className="whitespace-nowrap text-xs text-ink-muted">{hint}</span>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
