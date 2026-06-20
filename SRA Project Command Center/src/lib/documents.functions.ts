import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const listTemplates = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("document_templates")
      .select("id, slug, name, kind, description")
      .order("name");
    if (error) throw new Error(error.message);
    return { templates: data ?? [] };
  });

export const getTemplate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ slug: z.string().min(1).max(50) }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: tpl, error } = await context.supabase
      .from("document_templates").select("*").eq("slug", data.slug).single();
    if (error) throw new Error(error.message);
    return { template: tpl };
  });

export const listKnowledge = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("kb_documents")
      .select("id, slug, title, category, token_estimate, updated_at")
      .order("category")
      .order("title");
    if (error) throw new Error(error.message);
    return { docs: data ?? [] };
  });

export const getKnowledge = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ slug: z.string().min(1).max(80) }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: doc, error } = await context.supabase
      .from("kb_documents").select("*").eq("slug", data.slug).single();
    if (error) throw new Error(error.message);
    return { doc };
  });