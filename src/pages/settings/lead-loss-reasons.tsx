import { Filter } from "lucide-react";

import {
  useLeadLossReasonCreate,
  useLeadLossReasonRemove,
  useLeadLossReasonUpdate,
  useLeadLossReasons,
} from "@/modules/leads";
import { LookupManager, type LookupItem } from "./lookup-manager";
import { PageHeader } from "@/shared/ui/page-header";

export default function SettingsLeadLossReasonsPage() {
  const { data, isLoading } = useLeadLossReasons({ page: 1, page_size: 100 });

  const items: LookupItem[] = (data?.results ?? []).map((reason) => ({
    id: reason.id,
    name: reason.name,
    is_active: reason.is_active,
  }));

  const create = useLeadLossReasonCreate();
  const update = useLeadLossReasonUpdate();
  const remove = useLeadLossReasonRemove();

  return (
    <div className="grid gap-5">
      <PageHeader
        title="Yo'qotish sabablari"
        subtitle="Nega lid o'quvchiga aylanmadi (narx qimmat, javob bermadi...) — yo'qotish sababini tahlil qilish uchun"
      />

      <LookupManager
        icon={Filter}
        noun="sabab"
        items={items}
        isLoading={isLoading}
        emptyMessage="Hozircha sabab qo'shilmagan"
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
