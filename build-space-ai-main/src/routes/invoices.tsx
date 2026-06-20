import { createFileRoute } from "@tanstack/react-router";
import { StubPage, DataTable, Badge } from "@/components/stub-page";
import { useI18n } from "@/lib/i18n";
import { mockInvoices } from "@/lib/mock-data";

export const Route = createFileRoute("/invoices")({ component: Page });
function Page() {
  const { t, fmtIDR } = useI18n();
  return (
    <StubPage title={t("invoices.title")} subtitle="DP, Progress, Final invoices with payment tracking.">
      <DataTable rows={mockInvoices} columns={[
        { key: "number", label: "No." },
        { key: "client", label: t("common.client") },
        { key: "project", label: t("common.project") },
        { key: "type", label: "Type" },
        { key: "amount", label: t("common.value"), align: "right", render: (r) => fmtIDR(r.amount) },
        { key: "status", label: t("common.status"), render: (r) => (
          <Badge tone={r.status === "Paid" ? "success" : r.status === "Overdue" ? "danger" : r.status === "Pending" ? "warning" : "info"}>{r.status}</Badge>
        )},
        { key: "dueDate", label: t("common.due") },
      ]} />
    </StubPage>
  );
}
