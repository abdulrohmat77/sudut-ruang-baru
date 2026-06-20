import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/stub-page";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/reports")({ component: () => {
  const { t } = useI18n();
  return <StubPage title={t("reports.title")} subtitle="Revenue, conversion, pipeline, cash flow." />;
}});
