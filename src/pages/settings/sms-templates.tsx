import { useState } from "react";
import { MessageSquare, Pencil, Plus, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  messageTemplateSchema,
  useMessageTemplateCreate,
  useMessageTemplateList,
  useMessageTemplateRemove,
  useMessageTemplateUpdate,
  type MessageChannel,
  type MessageTemplate,
  type MessageTemplateValues,
} from "@/modules/messaging";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Chip } from "@/shared/ui/chip";
import { ConfirmModal } from "@/shared/ui/modal";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
import { Switch } from "@/shared/ui/switch";
import { Textarea } from "@/shared/ui/textarea";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui/sheet";
import { PageHeader } from "@/shared/ui/page-header";
import { ListToolbar } from "@/shared/ui/list-toolbar";

const CHANNELS: Array<{ value: MessageChannel; label: string }> = [
  { value: "sms", label: "SMS" },
  { value: "telegram", label: "Telegram" },
  { value: "push", label: "Push" },
];

const CHANNEL_LABEL: Record<MessageChannel, string> = {
  sms: "SMS",
  telegram: "Telegram",
  push: "Push",
};

export default function SettingsSmsTemplatesPage() {
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState<string>("");
  const { data, isLoading } = useMessageTemplateList({ page: 1, page_size: 100 });
  const templates: MessageTemplate[] = data?.results ?? [];

  const filtered = templates.filter((template) => {
    const matchesChannel = !channelFilter || template.channel === channelFilter;
    const query = search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      template.name.toLowerCase().includes(query) ||
      template.body.toLowerCase().includes(query);
    return matchesChannel && matchesSearch;
  });

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<MessageTemplate | null>(null);
  const [deleting, setDeleting] = useState<MessageTemplate | null>(null);

  const create = useMessageTemplateCreate(() => setCreating(false));
  const update = useMessageTemplateUpdate(editing?.id ?? "", () => setEditing(null));
  const remove = useMessageTemplateRemove(() => setDeleting(null));

  const formOpen = creating || Boolean(editing);
  const closeForm = () => {
    setCreating(false);
    setEditing(null);
  };

  return (
    <div className="grid gap-5">
      <PageHeader
        title="Xabar shablonlari"
        subtitle="SMS, Telegram va push uchun tayyor matnlar — xabar yuborishda tanlanadi"
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" />
            Yangi shablon
          </Button>
        }
      />

      <ListToolbar
        value={search}
        onSearch={setSearch}
        placeholder="Shablon nomi yoki matni…"
        filters={[
          <Select
            key="channel"
            aria-label="Kanal bo'yicha filtr"
            value={channelFilter}
            onChange={(event) => setChannelFilter(event.target.value)}
            className="h-9 text-sm"
          >
            <option value="">Barcha kanallar</option>
            {CHANNELS.map((channel) => (
              <option key={channel.value} value={channel.value}>
                {channel.label}
              </option>
            ))}
          </Select>,
        ]}
        hint={
          <>
            <span className="money font-semibold text-ink">{filtered.length}</span> ta shablon
          </>
        }
      />

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-divider bg-surface-2/60">
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-[0.05em] text-ink-muted">
                  Nomi
                </th>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-[0.05em] text-ink-muted">
                  Kanal
                </th>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-[0.05em] text-ink-muted">
                  Matn
                </th>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-[0.05em] text-ink-muted">
                  Holat
                </th>
                <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-[0.05em] text-ink-muted">
                  Amal
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={`skeleton-${i}`} className="border-b border-divider">
                    {[0, 1, 2, 3, 4].map((j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-3 w-24 rounded-md bg-surface-2" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-0">
                    <div className="flex flex-col items-center justify-center py-10 text-ink-muted">
                      {search || channelFilter ? "Hech narsa topilmadi" : "Shablon qo'shilmagan"}
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((template) => (
                  <tr key={template.id} className="border-b border-divider hover:bg-surface-2/50">
                    <td className="px-5 py-3.5">
                      <button
                        type="button"
                        onClick={() => setEditing(template)}
                        className="font-medium text-ink hover:text-action"
                      >
                        {template.name}
                      </button>
                    </td>
                    <td className="px-5 py-3.5">
                      <Chip tone="brand">{CHANNEL_LABEL[template.channel]}</Chip>
                    </td>
                    <td className="max-w-[320px] px-5 py-3.5 text-ink-muted">
                      <span className="line-clamp-1 block">{template.body}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <Chip tone={template.is_active ? "success" : "neutral"} dot>
                        {template.is_active ? "Faol" : "Nofaol"}
                      </Chip>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => setEditing(template)}
                        className="mr-2 text-sm text-action-soft-text underline underline-offset-4 hover:text-action"
                      >
                        <Pencil className="mr-1 inline h-4 w-4" />
                        Tahrirlash
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleting(template)}
                        aria-label={`${template.name} ni o'chirish`}
                        className="text-sm text-danger-ink hover:opacity-80"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Sheet
        open={formOpen}
        onOpenChange={(open) => {
          if (!open) closeForm();
        }}
      >
        <SheetContent>
          <SheetHeader>
            <span className="flex h-11 w-11 flex-none items-center justify-center rounded-md bg-action-soft text-action-soft-text">
              <MessageSquare className="h-5 w-5" />
            </span>
            <div>
              <SheetTitle>{editing ? "Shablonni tahrirlash" : "Yangi shablon"}</SheetTitle>
              <SheetDescription>
                Matnda {"{o'quvchi}"}, {"{ota-ona}"}, {"{summa}"} kabi o'zgaruvchilardan
                foydalanishingiz mumkin.
              </SheetDescription>
            </div>
          </SheetHeader>

          <SheetBody>
            <TemplateForm
              key={editing?.id ?? "new"}
              defaultValues={{
                name: editing?.name ?? "",
                channel: editing?.channel ?? "sms",
                subject: editing?.subject ?? "",
                body: editing?.body ?? "",
                is_active: editing?.is_active ?? true,
              }}
              isPending={create.isPending || update.isPending}
              onSubmit={(values) => {
                if (editing) {
                  update.mutate(values);
                } else {
                  create.mutate(values);
                }
              }}
            />
          </SheetBody>

          <SheetFooter>
            <Button
              variant="ghost"
              onClick={closeForm}
              disabled={create.isPending || update.isPending}
            >
              Bekor qilish
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <ConfirmModal
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Shablonni o'chirish"
        description={deleting ? `"${deleting.name}" shabloni o'chiriladi.` : undefined}
        confirmLabel="O'chirish"
        loading={remove.isPending}
        onConfirm={() => deleting && remove.mutate(deleting.id)}
      />
    </div>
  );
}

function TemplateForm({
  defaultValues,
  isPending,
  onSubmit,
}: {
  defaultValues: MessageTemplateValues;
  isPending: boolean;
  onSubmit: (values: MessageTemplateValues) => void;
}) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<MessageTemplateValues>({
    resolver: zodResolver(messageTemplateSchema),
    defaultValues,
  });

  const isActive = watch("is_active");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField id="name" label="Nomi" required error={errors.name?.message}>
        <Input id="name" {...register("name")} maxLength={80} />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="channel" label="Kanal" required error={errors.channel?.message}>
          <select
            id="channel"
            {...register("channel")}
            className="h-10 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
          >
            {CHANNELS.map((channel) => (
              <option key={channel.value} value={channel.value}>
                {channel.label}
              </option>
            ))}
          </select>
        </FormField>

        <div className="grid gap-2">
          <span className="text-sm font-semibold text-ink-secondary">Holat</span>
          <label className="flex min-h-10 items-center gap-2 text-sm text-ink-secondary">
            <Switch
              checked={isActive}
              onCheckedChange={(checked) => setValue("is_active", checked, { shouldDirty: true })}
              aria-label="Faol"
            />
            {isActive ? "Faol" : "Nofaol"}
          </label>
        </div>
      </div>

      <FormField id="subject" label="Sarlavha" hint="Telegram va push uchun (majburiy emas).">
        <Input id="subject" {...register("subject")} />
      </FormField>

      <FormField id="body" label="Matn" required error={errors.body?.message}>
        <Textarea id="body" rows={5} {...register("body")} />
      </FormField>

      <Button type="submit" className="w-full" loading={isPending}>
        Saqlash
      </Button>
    </form>
  );
}
