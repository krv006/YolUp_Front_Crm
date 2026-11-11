import type { ReactNode } from "react";
import { PanelLeft, PanelRight } from "lucide-react";

import { Card } from "@/shared/ui/card";
import { PageHeader } from "@/shared/ui/page-header";
import { Switch } from "@/shared/ui/switch";
import { Tabs } from "@/shared/ui/tabs";
import { useShellStore } from "@/shared/model";

export default function SettingsAppearancePage() {
  const tabStripEnabled = useShellStore((s) => s.tabStripEnabled);
  const setTabStripEnabled = useShellStore((s) => s.setTabStripEnabled);
  const sidebarPos = useShellStore((s) => s.sidebarPos);
  const setSidebarPos = useShellStore((s) => s.setSidebarPos);
  const sidebarCollapsed = useShellStore((s) => s.sidebarCollapsed);
  const setSidebarCollapsed = useShellStore((s) => s.setSidebarCollapsed);

  return (
    <div className="grid gap-5">
      <PageHeader
        title="Ko'rinish"
        subtitle="Shaxsiy interfeys sozlamalari — brauzerda saqlanadi va keyingi kirishda tiklanadi"
      />

      <Card className="divide-y divide-divider">
        <Row
          title="Tablar chizig'i (tab strip)"
          description="Ochiq sahifalar yuqorida tab sifatida saqlanadi va ular orasida tez o'tish mumkin. O'chirilsa chiziq yashiriladi, ochilgan tablar yo'qolmaydi."
        >
          <Switch
            checked={tabStripEnabled}
            onCheckedChange={setTabStripEnabled}
            aria-label="Tablar chizig'i"
          />
        </Row>

        <Row
          title="Yon menyu holati"
          description="Ish stolida yon menyuni yig'ib (faqat ikonkalar) yoki ochiq holda ko'rsatish."
        >
          <Switch
            checked={sidebarCollapsed}
            onCheckedChange={setSidebarCollapsed}
            aria-label="Yon menyuni yig'ish"
          />
        </Row>

        <Row
          title="Yon menyu joylashuvi"
          description="Yon menyu ekranning chap yoki o'ng tomonida turishi mumkin."
        >
          <Tabs
            variant="pill"
            label="Yon menyu joylashuvi"
            value={sidebarPos}
            onChange={(value) => setSidebarPos(value as "left" | "right")}
            items={[
              { value: "left", label: "Chap", icon: <PanelLeft className="h-4 w-4" /> },
              { value: "right", label: "O'ng", icon: <PanelRight className="h-4 w-4" /> },
            ]}
          />
        </Row>
      </Card>
    </div>
  );
}

function Row({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-6 p-5 first:pt-5">
      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
        <p className="mt-1 text-sm text-ink-muted">{description}</p>
      </div>
      <div className="flex-none">{children}</div>
    </div>
  );
}
