import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/stub-page";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/documents")({ component: () => {
  const { t } = useI18n();
  return <StubPage title={t("documents.title")} subtitle="Proposals, SPK, invoices, drawings, contracts, reports." />;
}});
