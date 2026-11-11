import { Tags } from "lucide-react";

import {
  useLeadSourceCreate,
  useLeadSourceRemove,
  useLeadSourceUpdate,
  useLeadSources,
} from "@/modules/leads";
import { LookupManager, type LookupItem } from "./lookup-manager";
import { PageHeader } from "@/shared/ui/page-header";

export default function SettingsLeadSourcesPage() {
  const { data, isLoading } = useLeadSources({ page: 1, page_size: 100 });

  const items: LookupItem[] = (data?.results ?? []).map((source) => ({
    id: source.id,
    name: source.name,
    is_active: source.is_active,
  }));

  const create = useLeadSourceCreate();
  const update = useLeadSourceUpdate();
  const remove = useLeadSourceRemove();

  return (
    <div className="grid gap-5">
      <PageHeader
        title="Lid manbalari"
        subtitle="Lidlar qaysi kanaldan keladi (Instagram, tavsiya, ko'cha...) — manba bo'yicha statistika shundan yig'iladi"
      />

      <LookupManager
        icon={Tags}
        noun="manba"
        items={items}
        isLoading={isLoading}
        emptyMessage="Hozircha manba qo'shilmagan"
        creating={create.isPending}
        updating={update.isPending}
        removing={remove.isPending}
        onCreate={(name, done) => create.mutate({ name }, { onSuccess: done })}
        onUpdate={(id, name, done) => update.mutate({ id, values: { name } }, { onSuccess: done })}
        onRemove={(id, done) => remove.mutate(id, { onSuccess: done })}
      />
    </div>
  );
}
