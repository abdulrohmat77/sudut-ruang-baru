import { createFileRoute } from "@tanstack/react-router";
import { AppLayout, PageHeader } from "@/components/app-layout";
import { useI18n } from "@/lib/i18n";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";
import { Bot, Send, Sparkles, User } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/ai-agent")({
  head: () => ({ meta: [{ title: "AI Sales Agent — Sudut Ruang" }] }),
  component: AiAgent,
});

const SUGGESTIONS_ID = [
  "Saya ingin bangun rumah modern 200 m² di Bali, perkiraan budget?",
  "Berapa biaya desain interior cafe 150 m²?",
  "Proses dan timeline membangun villa 2 lantai?",
  "Apa saja yang termasuk dalam paket Design & Build?",
];
const SUGGESTIONS_EN = [
  "I want a 200 sqm modern house in Bali — what's the budget?",
  "How much for interior design of a 150 sqm cafe?",
  "Process and timeline for building a 2-story villa?",
  "What's included in a Design & Build package?",
];

function AiAgent() {
  const { t, lang } = useI18n();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const onSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    await sendMessage({ text });
    inputRef.current?.focus();
  };

  const suggestions = lang === "id" ? SUGGESTIONS_ID : SUGGESTIONS_EN;

  return (
    <AppLayout>
      <PageHeader title={t("ai.title")} subtitle={t("ai.subtitle")} />

      <div className="rounded-xl border bg-card flex flex-col h-[calc(100vh-220px)] min-h-[500px] overflow-hidden">
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-5">
          {messages.length === 0 && (
            <div className="max-w-2xl mx-auto text-center py-10">
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-accent/20 text-primary mb-4">
                <Sparkles className="h-7 w-7" />
              </div>
              <h2 className="text-xl font-semibold text-primary mb-2">
                {lang === "id" ? "Halo! Saya konsultan AI Sudut Ruang." : "Hi! I'm the Sudut Ruang AI consultant."}
              </h2>
              <p className="text-sm text-muted-foreground mb-6">{t("ai.empty")}</p>
              <div className="grid sm:grid-cols-2 gap-2 text-left">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setInput(s); inputRef.current?.focus(); }}
                    className="rounded-lg border bg-secondary/40 hover:bg-secondary p-3 text-sm text-foreground transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => {
            const text = m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
            const isUser = m.role === "user";
            return (
              <div key={m.id} className={cn("flex gap-3", isUser && "justify-end")}>
                {!isUser && (
                  <div className="h-8 w-8 shrink-0 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div className={cn(
                  "max-w-[78%] whitespace-pre-wrap text-sm leading-relaxed",
                  isUser
                    ? "rounded-2xl rounded-tr-sm bg-primary text-primary-foreground px-4 py-2.5"
                    : "text-foreground",
                )}>
                  {text}
                </div>
                {isUser && (
                  <div className="h-8 w-8 shrink-0 rounded-lg bg-accent text-accent-foreground flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            );
          })}

          {status === "submitted" && (
            <div className="flex gap-3">
              <div className="h-8 w-8 shrink-0 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div className="text-sm text-muted-foreground animate-pulse">
                {lang === "id" ? "Sedang berpikir…" : "Thinking…"}
              </div>
            </div>
          )}
        </div>

        <div className="border-t p-3 md:p-4 bg-secondary/30">
          <div className="flex gap-2 items-end max-w-4xl mx-auto">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); }
              }}
              rows={1}
              placeholder={t("ai.placeholder")}
              className="flex-1 resize-none rounded-xl border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring max-h-40"
            />
            <button
              onClick={onSend}
              disabled={isLoading || !input.trim()}
              className="h-11 w-11 shrink-0 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 disabled:opacity-50 transition-colors"
              aria-label={t("ai.send")}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
