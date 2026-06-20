import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { listTemplates, getTemplate, listKnowledge, getKnowledge } from "@/lib/documents.functions";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FileText, BookOpen } from "lucide-react";

export const Route = createFileRoute("/_authenticated/documents")({ component: DocumentsPage });

function DocumentsPage() {
  const lt = useServerFn(listTemplates);
  const lk = useServerFn(listKnowledge);
  const gt = useServerFn(getTemplate);
  const gk = useServerFn(getKnowledge);
  const tpls = useQuery({ queryKey: ["templates"], queryFn: () => lt() });
  const kb = useQuery({ queryKey: ["kb"], queryFn: () => lk() });
  const [activeTpl, setActiveTpl] = useState<string | null>(null);
  const [activeKb, setActiveKb] = useState<string | null>(null);
  const tplDoc = useQuery({ queryKey: ["tpl", activeTpl], queryFn: () => gt({ data: { slug: activeTpl! } }), enabled: !!activeTpl });
  const kbDoc = useQuery({ queryKey: ["kbd", activeKb], queryFn: () => gk({ data: { slug: activeKb! } }), enabled: !!activeKb });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Document Management</h1>
        <p className="text-muted-foreground text-sm mt-1">Template dokumen SRA + Knowledge Base internal</p>
      </div>

      <Tabs defaultValue="templates">
        <TabsList>
          <TabsTrigger value="templates"><FileText className="size-4 mr-1" /> Template SRA</TabsTrigger>
          <TabsTrigger value="kb"><BookOpen className="size-4 mr-1" /> Knowledge Base</TabsTrigger>
        </TabsList>
        <TabsContent value="templates" className="mt-4">
          <div className="grid gap-4 md:grid-cols-[280px_1fr]">
            <div className="space-y-2">
              {tpls.data?.templates.map((t: any) => (
                <button key={t.id} onClick={()=>setActiveTpl(t.slug)} className={`w-full text-left p-3 rounded-md border transition-colors ${activeTpl===t.slug ? "bg-accent/20 border-accent" : "hover:bg-muted/50"}`}>
                  <div className="font-medium text-sm">{t.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{t.description}</div>
                </button>
              ))}
            </div>
            <Card className="p-6 min-h-[400px]">
              {!activeTpl ? <div className="text-muted-foreground text-sm">Pilih template untuk melihat isi.</div> :
                tplDoc.isLoading ? <div>Memuat...</div> :
                <article className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown>{tplDoc.data?.template?.body_markdown ?? ""}</ReactMarkdown>
                </article>}
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="kb" className="mt-4">
          <div className="grid gap-4 md:grid-cols-[280px_1fr]">
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
              {kb.data?.docs.map((d: any) => (
                <button key={d.id} onClick={()=>setActiveKb(d.slug)} className={`w-full text-left p-3 rounded-md border transition-colors ${activeKb===d.slug ? "bg-accent/20 border-accent" : "hover:bg-muted/50"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-medium text-sm">{d.title}</div>
                    <Badge variant="secondary" className="text-[9px] uppercase tracking-wider">{d.category}</Badge>
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1 font-mono">~{d.token_estimate} tokens</div>
                </button>
              ))}
            </div>
            <Card className="p-6 min-h-[400px] max-h-[700px] overflow-y-auto">
              {!activeKb ? <div className="text-muted-foreground text-sm">Pilih dokumen knowledge base untuk dibaca.</div> :
                kbDoc.isLoading ? <div>Memuat...</div> :
                <article className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown>{kbDoc.data?.doc?.content ?? ""}</ReactMarkdown>
                </article>}
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}