import { createFileRoute } from "@tanstack/react-router";
import { StubPage, DataTable, Badge } from "@/components/stub-page";
import { useI18n } from "@/lib/i18n";
import { mockProposals } from "@/lib/mock-data";

export const Route = createFileRoute("/proposals")({ component: Page });
function Page() {
  const { t, fmtIDR } = useI18n();
  return (
    <StubPage title={t("proposals.title")} subtitle="AI-generated proposals with cover, scope, timeline, commercials.">
      <DataTable rows={mockProposals} columns={[
        { key: "number", label: "No." },
        { key: "client", label: t("common.client") },
        { key: "project", label: t("common.project") },
        { key: "value", label: t("common.value"), align: "right", render: (r) => fmtIDR(r.value) },
        { key: "status", label: t("common.status"), render: (r) => (
          <Badge tone={r.status === "Approved" ? "success" : r.status === "Rejected" ? "danger" : r.status === "Revision" ? "warning" : "info"}>{r.status}</Badge>
        )},
        { key: "createdAt", label: t("common.created") },
      ]} />
    </StubPage>
  );
}
