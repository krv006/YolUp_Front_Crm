import { useState } from 'react';
import { Receipt, TrendingUp, Wallet } from 'lucide-react';

import {
  PaymentForm,
  PaymentTable,
  paymentPayload,
  usePaymentCreate,
  usePaymentList,
  usePaymentMethodList,
  type Payment,
  type PaymentValues,
} from '@/modules/finance';
import { useGroupList } from '@/modules/groups';
import { useStudentList } from '@/modules/students';
import { StatusBadge } from '@/core/status';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { PageHeader } from '@/shared/ui/page-header';
import { Pagination } from '@/shared/ui/pagination';
import { SearchInput } from '@/shared/ui/search-input';
import { Select } from '@/shared/ui/select';
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/shared/ui/sheet';
import { StatCard } from '@/shared/ui/stat-card';
import { formatDateTime, formatMoney } from '@/shared/lib';
import { useListState } from '@/shared/model';

const PAYMENT_FORM_ID = 'payment-form';

export default function FinancePaymentsPage() {
  const list = useListState({ pageSize: 10 });

  const { data: page, isLoading } = usePaymentList(list.params);
  /* Yig'ma ko'rsatkichlar uchun to'liq to'plam (demo hajmda bir so'rov). */
  const { data: totalsPage } = usePaymentList({ page: 1, page_size: 500 });
  const { data: studentsData } = useStudentList({ page: 1, page_size: 100 });
  const { data: groupsData } = useGroupList({ page: 1, page_size: 100 });
  const { data: methodsData } = usePaymentMethodList({
    page: 1,
    page_size: 50,
    is_active: 'true',
  });

  const payments = page?.results ?? [];
  const allPayments = totalsPage?.results ?? [];
  const totalsComplete = !!totalsPage && totalsPage.count <= allPayments.length;
  const methodRecords = methodsData?.results ?? [];

  const methodOptions = methodRecords.map((method) => ({
    code: method.code,
    name: method.name,
  }));
  const methodNameOf = (code: string) => methodRecords.find((item) => item.code === code)?.name;

  const total = allPayments.reduce((sum, payment) => sum + payment.amount_tiyin, 0);
  const average = allPayments.length > 0 ? Math.round(total / allPayments.length) : 0;

  const studentOptions = (studentsData?.results ?? []).map((student) => ({
    id: student.id,
    name: `${student.first_name} ${student.last_name}`,
  }));
  const groupOptions = (groupsData?.results ?? []).map((group) => ({
    id: group.id,
    name: group.name,
  }));

  const [paymentOpen, setPaymentOpen] = useState(false);
  const [receipt, setReceipt] = useState<Payment | null>(null);

  const createPayment = usePaymentCreate(() => setPaymentOpen(false));
  const filtered = Boolean(list.search || list.activeFilterCount);

  return (
    <div className="grid gap-5">
      <PageHeader
        title="To'lovlar"
        subtitle="Qabul qilingan to'lovlar va kvitansiyalar"
        actions={
          <Button onClick={() => setPaymentOpen(true)}>
            <Wallet className="h-4 w-4" />
            To'lov qabul qilish
          </Button>
        }
      />

      {totalsPage && !totalsComplete && (
        <p role="status" className="text-sm text-ink-muted">
          Umumiy ko'rsatkichlar barcha yozuvlar yuklanmagani uchun ko'rsatilmaydi.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
        <StatCard
          label="Jami tushum"
          value={totalsComplete ? formatMoney(total) : '?'}
          tone="success"
          icon={<TrendingUp className="h-5 w-5" />}
          size="sm"
        />
        <StatCard
          label="O'rtacha to'lov"
          value={totalsComplete ? formatMoney(average) : '?'}
          tone="info"
          icon={<Wallet className="h-5 w-5" />}
          size="sm"
        />
        <StatCard
          label="To'lovlar soni"
          value={totalsPage?.count ?? '?'}
          tone="neutral"
          icon={<Receipt className="h-5 w-5" />}
          size="sm"
        />
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <SearchInput
            value={list.search}
            onChange={list.setSearch}
            placeholder="O'quvchi yoki kvitansiya…"
            size="sm"
            className="w-full sm:w-[240px]"
          />

          <Select
            aria-label="To'lov turi bo'yicha filtr"
            value={list.filters.method ?? ''}
            onChange={(event) => list.setFilter('method', event.target.value)}
            className="h-9 text-sm"
            wrapperClassName="w-auto min-w-[170px]"
          >
            <option value="">Barcha turlar</option>
            {methodOptions.map((method) => (
              <option key={method.code} value={method.code}>
                {method.name}
              </option>
            ))}
          </Select>

          <span className="ml-auto text-sm text-ink-muted">
            <span className="money font-semibold text-ink">{page?.count ?? 0}</span> ta to'lov
          </span>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <PaymentTable
          payments={payments}
          isLoading={isLoading}
          sort={list.sort}
          onSortChange={list.toggleSort}
          onCreate={() => setPaymentOpen(true)}
          onClearFilters={list.resetFilters}
          filtered={filtered}
          onReceipt={setReceipt}
          methodLabelOf={methodNameOf}
        />
      </Card>

      {(page?.count ?? 0) > 0 && (
        <Pagination
          page={list.page}
          pageSize={list.pageSize}
          total={page?.count ?? 0}
          onPageChange={list.setPage}
          onPageSizeChange={list.setPageSize}
        />
      )}

      <Sheet open={paymentOpen} onOpenChange={setPaymentOpen}>
        <SheetContent>
          <SheetHeader>
            <span className="flex h-11 w-11 flex-none items-center justify-center rounded-md bg-success-soft text-success-ink">
              <Wallet className="h-5 w-5" />
            </span>
            <div>
              <SheetTitle>To'lov qabul qilish</SheetTitle>
              <SheetDescription>
                Summa so'mda kiritiladi. Kvitansiya avtomatik yaratiladi.
              </SheetDescription>
            </div>
          </SheetHeader>

          <SheetBody>
            <PaymentForm
              key={paymentOpen ? 'open' : 'closed'}
              formId={PAYMENT_FORM_ID}
              students={studentOptions}
              groups={groupOptions}
              methods={methodOptions}
              onSubmit={(values: PaymentValues) => createPayment.mutate(paymentPayload(values))}
            />
          </SheetBody>

          <SheetFooter>
            <Button
              variant="ghost"
              onClick={() => setPaymentOpen(false)}
              disabled={createPayment.isPending}
            >
              Bekor qilish
            </Button>
            <Button type="submit" form={PAYMENT_FORM_ID} loading={createPayment.isPending}>
              Qabul qilish
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Sheet open={Boolean(receipt)} onOpenChange={(open) => !open && setReceipt(null)}>
        <SheetContent>
          <SheetHeader>
            <span className="flex h-11 w-11 flex-none items-center justify-center rounded-md bg-surface-2 text-ink-muted">
              <Receipt className="h-5 w-5" />
            </span>
            <div>
              <SheetTitle>
                {receipt?.receipt_no ?? receipt?.receipt_number ?? 'Kvitansiya'}
              </SheetTitle>
              <SheetDescription>{receipt?.student_name ?? "To'lov tafsilotlari"}</SheetDescription>
            </div>
          </SheetHeader>

          <SheetBody>
            {receipt && (
              <dl className="grid gap-3 rounded-lg border border-border bg-surface-inset p-4 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-ink-muted">Summa</dt>
                  <dd className="money font-display text-lg font-extrabold text-ink">
                    {formatMoney(receipt.amount_tiyin)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-ink-muted">To'lov turi</dt>
                  <dd>
                    <StatusBadge status={receipt.method} label={methodNameOf(receipt.method)} />
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-muted">Guruh</dt>
                  <dd className="od-truncate font-semibold text-ink">
                    {receipt.group_name ?? '—'}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-muted">Vaqt</dt>
                  <dd className="money font-semibold text-ink">
                    {formatDateTime(receipt.paid_at)}
                  </dd>
                </div>
              </dl>
            )}
          </SheetBody>

          <SheetFooter>
            <Button variant="ghost" onClick={() => setReceipt(null)}>
              Yopish
            </Button>
            <Button
              onClick={() => {
                setReceipt(null);
                window.print();
              }}
            >
              Chop etish
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
