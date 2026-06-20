import { z } from "zod";
import { pmis } from "@/integrations/crm/client";

export async function listTemplates() {
  const { data, error } = await pmis("document_templates").select("id, slug, name, kind, description").order("name");
  if (error) throw new Error(error.message);
  return { templates: data ?? [] };
}

export async function getTemplate({ data }: { data: { slug: string } }) {
  const slug = z.string().min(1).max(50).parse(data.slug);
  const { data: tpl, error } = await pmis("document_templates").select("*").eq("slug", slug).single();
  if (error) throw new Error(error.message);
  return { template: tpl };
}

export async function listKnowledge() {
  const { data, error } = await pmis("kb_documents")
    .select("id, slug, title, category, token_estimate, updated_at")
    .order("category").order("title");
  if (error) throw new Error(error.message);
  return { docs: data ?? [] };
}

export async function getKnowledge({ data }: { data: { slug: string } }) {
  const slug = z.string().min(1).max(80).parse(data.slug);
  const { data: doc, error } = await pmis("kb_documents").select("*").eq("slug", slug).single();
  if (error) throw new Error(error.message);
  return { doc };
}