import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  component: IndexRoute,
});

function IndexRoute() {
  const navigate = useNavigate();

  useEffect(() => {
    // Bypass auth — langsung ke dashboard
    navigate({ to: "/dashboard", replace: true });
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 text-center">
      <div>
        <div className="mx-auto mb-4 size-10 animate-pulse rounded-md bg-primary" />
        <h1 className="text-xl font-semibold text-foreground">Opening PMIS</h1>
      </div>
    </div>
  );
}
