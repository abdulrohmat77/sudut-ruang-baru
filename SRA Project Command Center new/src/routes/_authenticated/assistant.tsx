import { createFileRoute } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Sparkles, Send, Wrench } from "lucide-react";

export const Route = createFileRoute("/_authenticated/assistant")({ component: AssistantPage });

const transport = new DefaultChatTransport({ api: "/api/chat" });

function AssistantPage() {
  const { messages, sendMessage, status } = useChat({ transport });
  const [input, setInput] = useState("");
  const taRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, status]);
  useEffect(() => { if (!busy) taRef.current?.focus(); }, [busy]);

  const submit = async () => {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    await sendMessage({ text });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="size-7 text-accent" /> SRA Assistant
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Asisten internal — Knowledge Base SRA + akses live ke modul Project, Finance, Reports, Risk, HSE, QA/QC, Forecast.</p>
      </div>

      <Card className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-12">
            <p>Coba tanyakan:</p>
            <ul className="mt-3 space-y-1.5 text-xs">
              <li>"Forecast proyek Villa Senopati — apakah on track?"</li>
              <li>"Ringkas laporan harian minggu ini."</li>
              <li>"Risiko terbuka prioritas tinggi di seluruh portfolio?"</li>
              <li>"Berapa invoice yang belum terbayar untuk proyek X?"</li>
              <li>"Tahapan SOP design delivery SRA?"</li>
            </ul>
          </div>
        )}
        {messages.map((m) => {
          const text = m.parts.map((p: any) => (p.type === "text" ? p.text : "")).join("");
          const toolCalls = m.parts.filter((p: any) => typeof p.type === "string" && p.type.startsWith("tool-"));
          return (
            <div key={m.id} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
              {m.role !== "user" && <div className="size-8 rounded-full gradient-navy text-sidebar-foreground flex items-center justify-center text-xs font-bold shrink-0">SRA</div>}
              <div className={`max-w-[80%] rounded-lg px-4 py-3 ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                {toolCalls.length > 0 && (
                  <div className="mb-2 space-y-1">
                    {toolCalls.map((tc: any, i: number) => (
                      <div key={i} className="text-[10px] inline-flex items-center gap-1 bg-background/60 border rounded px-1.5 py-0.5 mr-1 font-mono text-muted-foreground">
                        <Wrench className="size-3" /> {String(tc.type).replace(/^tool-/, "")}
                        {tc.state === "output-available" ? " ✓" : tc.state === "input-streaming" || tc.state === "input-available" ? " …" : ""}
                      </div>
                    ))}
                  </div>
                )}
                <article className="prose prose-sm max-w-none dark:prose-invert prose-p:my-2 prose-headings:mt-3 prose-headings:mb-1">
                  <ReactMarkdown>{text}</ReactMarkdown>
                </article>
              </div>
            </div>
          );
        })}
        {busy && <div className="text-xs text-muted-foreground animate-pulse">SRA Assistant sedang berpikir…</div>}
        <div ref={endRef} />
      </Card>

      <div className="flex gap-2">
        <Textarea
          ref={taRef}
          value={input}
          onChange={(e)=>setInput(e.target.value)}
          onKeyDown={(e)=>{ if(e.key==="Enter" && !e.shiftKey){ e.preventDefault(); submit(); } }}
          placeholder="Tanyakan apa pun tentang SOP, pricing, scope, material, regulasi..."
          rows={2}
          className="resize-none"
          disabled={busy}
        />
        <Button onClick={submit} disabled={busy || !input.trim()} size="lg"><Send className="size-4" /></Button>
      </div>
    </div>
  );
}