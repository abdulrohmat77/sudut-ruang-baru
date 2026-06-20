import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/stub-page";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/portal")({ component: () => {
  const { t } = useI18n();
  return <StubPage title={t("portal.title")} subtitle="Client-facing view: proposals, payments, progress, documents." />;
}});
