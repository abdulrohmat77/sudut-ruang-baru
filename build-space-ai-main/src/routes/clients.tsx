import { createFileRoute } from "@tanstack/react-router";
import { StubPage, DataTable } from "@/components/stub-page";
import { useI18n } from "@/lib/i18n";
import { mockLeads } from "@/lib/mock-data";

export const Route = createFileRoute("/clients")({ component: Page });
function Page() {
  const { t } = useI18n();
  return (
    <StubPage title={t("clients.title")} subtitle="Master client records linked across leads, proposals, projects.">
      <DataTable rows={mockLeads} columns={[
        { key: "name", label: "Name" },
        { key: "phone", label: "Phone" },
        { key: "email", label: "Email" },
        { key: "location", label: "Location" },
        { key: "projectType", label: "Type" },
      ]} />
    </StubPage>
  );
}
