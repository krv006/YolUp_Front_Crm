import { useState } from "react";
import { Send } from "lucide-react";

import {
  LogTable,
  TemplateList,
  useMessageLogList,
  useMessageTemplateList,
  useSmsSend,
  type MessageTemplate,
} from "@/modules/messaging";
import { useStudentList } from "@/modules/students";
import { useAttendanceList } from "@/modules/attendance";
import { Button } from "@/shared/ui/button";
import { Card, CardBody, CardHeader, CardSub, CardTitle } from "@/shared/ui/card";
import { FormField } from "@/shared/ui/form-field";
import { PageHeader } from "@/shared/ui/page-header";
import { Select } from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";
import { toastInfo } from "@/shared/lib";

const PLACEHOLDERS = ["{ota-ona}", "{o'quvchi}", "{summa}"];

export default function MessagingPage() {
  const { data: templatesData, isLoading: templatesLoading } = useMessageTemplateList({
    page: 1,
    page_size: 50,
  });
  const { data: logsData, isLoading: logsLoading } = useMessageLogList({
    page: 1,
    page_size: 10,
    ordering: "-sent_at",
  });
  const { data: debtors } = useStudentList({ page: 1, page_size: 1, has_debt: true });
  const { data: allStudents } = useStudentList({ page: 1, page_size: 1 });
  const { data: absent } = useAttendanceList({ page: 1, page_size: 1, status: "ABSENT" });

  const templates = templatesData?.results ?? [];
  const logs = logsData?.results ?? [];

  const [selected, setSelected] = useState<MessageTemplate | null>(null);
  const [audience, setAudience] = useState("debtors");
  const [body, setBody] = useState("");

  const send = useSmsSend(() => {
    setBody("");
    setSelected(null);
  });

  const handleSelect = (template: MessageTemplate) => {
    setSelected(template);
    setBody(template.body);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!body.trim()) {
      toastInfo("Xabar matni bo'sh");
      return;
    }
    send.mutate({
      to: `audience:${audience}`,
      template_id: selected?.id ?? null,
      body,
    });
  };

  return (
    <div className="grid gap-5">
      <PageHeader
        title="Xabarlar va SMS"
        subtitle="Shablonlar, avtomatik triggerlar va log"
      />

      {/* MVP: tashqi SMS provayderi (Eskiz.uz) hali ulanmagan. Ilgari bu yerda
          "Eskiz.uz ulangan" degan tugma bor edi — u haqiqatga zid edi
          (integratsiya yo'q), shuning uchun olib tashlandi. Yuborish mock
          rejimda ishlaydi va log'ga yoziladi. */}
      <div className="rounded-md border border-warning/30 bg-warning-soft px-3.5 py-2.5 text-xs text-warning-ink">
        <strong className="font-semibold">Ichki rejim:</strong> SMS provayderi
        ulanmagan — yuborilgan xabarlar faqat log'ga yoziladi.
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Shablonlar</CardTitle>
              <CardSub>Tanlang — matn o'ng tomonda yuklanadi</CardSub>
            </div>
          </CardHeader>
          <CardBody>
            <TemplateList
              templates={templates}
              isLoading={templatesLoading}
              selectedId={selected?.id ?? null}
              onSelect={handleSelect}
            />
          </CardBody>
        </Card>

        <div className="grid content-start gap-5">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Yangi xabar</CardTitle>
              </div>
            </CardHeader>
            <CardBody>
              <form className="grid gap-4" onSubmit={handleSubmit}>
                <FormField id="compose-to" label="Qabul qiluvchi">
                  <Select
                    id="compose-to"
                    value={audience}
                    onChange={(event) => setAudience(event.target.value)}
                  >
                    <option value="debtors">Qarzdor ota-onalar ({debtors?.count ?? 0})</option>
                    <option value="absent">Bugun kelmaganlar ({absent?.count ?? 0})</option>
                    <option value="trial">Sinov darsi guruhi</option>
                    <option value="all">Barcha ota-onalar ({allStudents?.count ?? 0})</option>
                  </Select>
                </FormField>

                <FormField
                  id="compose-text"
                  label="Xabar matni"
                  hint={`O'zgaruvchilar: ${PLACEHOLDERS.join(", ")}`}
                >
                  <Textarea
                    id="compose-text"
                    rows={5}
                    value={body}
                    onChange={(event) => setBody(event.target.value)}
                    placeholder="Shablon tanlang yoki matn yozing…"
                  />
                </FormField>

                <Button type="submit" loading={send.isPending}>
                  <Send className="h-4 w-4" />
                  Yuborish
                </Button>
              </form>
            </CardBody>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader>
              <div>
                <CardTitle>SMS log</CardTitle>
                <CardSub>Oxirgi 24 soat</CardSub>
              </div>
            </CardHeader>
            <LogTable logs={logs} isLoading={logsLoading} />
          </Card>
        </div>
      </div>
    </div>
  );
}
