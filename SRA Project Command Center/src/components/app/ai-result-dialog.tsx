import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Copy } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

export function AiResultButton({
  label = "Analisis AI",
  title = "Hasil Analisis AI",
  run,
  disabled,
  size = "sm",
  variant = "outline",
}: {
  label?: string;
  title?: string;
  run: () => Promise<{ markdown: string } | any>;
  disabled?: boolean;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "secondary";
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState<string>("");
  const [error, setError] = useState<string>("");

  const fire = async () => {
    setOpen(true);
    setLoading(true);
    setText("");
    setError("");
    try {
      const r = await run();
      setText(r?.markdown ?? "");
    } catch (e: any) {
      setError(e?.message ?? "Gagal memanggil AI");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button size={size} variant={variant} onClick={fire} disabled={disabled}>
        <Sparkles className="size-4 mr-1.5" /> {label}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="size-5 text-accent" /> {title}
            </DialogTitle>
          </DialogHeader>
          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-8 justify-center">
              <Loader2 className="size-4 animate-spin" /> AI sedang menganalisis…
            </div>
          )}
          {error && <div className="text-sm text-destructive border border-destructive/40 bg-destructive/10 p-3 rounded">{error}</div>}
          {!loading && text && (
            <>
              <article className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{text}</ReactMarkdown>
              </article>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(text); toast.success("Disalin"); }}>
                  <Copy className="size-4 mr-1.5" /> Salin
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}