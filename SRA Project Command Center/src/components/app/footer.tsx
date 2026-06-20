/**
 * © 2026 Sudut Ruang Arsitek — All Rights Reserved.
 * Web App ini adalah hak milik Sudut Ruang Arsitek.
 * Dilarang menyalin, memodifikasi, atau mendistribusikan tanpa izin tertulis.
 * Kontak resmi: lihat SOP Sudut Ruang Arsitek.
 */
import { ShieldCheck } from "lucide-react";

export function AppFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t border-border/60 bg-card/40 px-3 py-4 sm:px-4 lg:px-6">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-2 text-[11px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-3.5 text-primary/70" />
          <span>
            © {year} <span className="font-semibold text-foreground">Sudut Ruang Arsitek</span>. All Rights Reserved.
          </span>
        </div>
        <div className="opacity-80">
          Web App ini adalah hak milik Sudut Ruang Arsitek. Kontak resmi tercantum pada SOP.
        </div>
      </div>
    </footer>
  );
}