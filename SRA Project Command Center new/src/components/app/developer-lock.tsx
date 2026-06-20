/**
 * © 2026 Sudut Ruang Arsitek — All Rights Reserved.
 * Developer Lock Gate: melindungi halaman/aksi paling sensitif.
 * Password developer hanya dimiliki oleh Sudut Ruang Arsitek.
 * Untuk meminta akses, hubungi Sudut Ruang Arsitek (kontak ada di SOP).
 */
import { useEffect, useState, type ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Lock, Unlock, ShieldAlert, Phone } from "lucide-react";
import { toast } from "sonner";

// Encoded — bukan plaintext langsung. Tetap reversible, hanya menyulitkan
// pembacaan oleh casual viewer. Untuk proteksi kuat, pindahkan ke backend.
const ENCODED_PASS = "QEJpc21pbGxhaDIwMjU="; // base64("@Bismillah2025")
const STORAGE_KEY = "sra:dev-unlock";

function decode(v: string): string {
  try {
    if (typeof atob === "function") return atob(v);
  } catch {}
  return "";
}

export function isDeveloperUnlocked(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function lockDeveloper() {
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {}
}

export function DeveloperLockGate({
  title = "Halaman Terkunci",
  description = "Halaman ini berisi konfigurasi inti aplikasi dan hanya dapat diakses oleh tim developer Sudut Ruang Arsitek.",
  children,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
}) {
  const [unlocked, setUnlocked] = useState<boolean>(false);
  const [pw, setPw] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setUnlocked(isDeveloperUnlocked());
    setHydrated(true);
  }, []);

  if (!hydrated) return null;

  if (unlocked) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-xs">
          <div className="flex items-center gap-2 text-primary">
            <Unlock className="size-3.5" />
            <span className="font-medium">Developer mode aktif</span>
            <span className="text-muted-foreground">— akses developer Sudut Ruang Arsitek terbuka untuk sesi ini.</span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 gap-1.5 text-xs"
            onClick={() => {
              lockDeveloper();
              setUnlocked(false);
              toast.success("Halaman dikunci kembali.");
            }}
          >
            <Lock className="size-3.5" /> Lock Again
          </Button>
        </div>
        {children}
      </div>
    );
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const expected = decode(ENCODED_PASS);
    if (pw === expected) {
      try {
        window.sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {}
      setUnlocked(true);
      setPw("");
      toast.success("Akses developer terbuka.");
    } else {
      setAttempts((a) => a + 1);
      toast.error("Kode developer salah.");
    }
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-lg p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
            <ShieldAlert className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold sm:text-lg">{title}</h2>
              <Badge variant="outline" className="border-destructive/40 text-[10px] text-destructive">
                RESTRICTED
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
        </div>

        <form onSubmit={submit} className="mt-6 space-y-3">
          <div>
            <Label htmlFor="dev-pass" className="text-xs">Kode Developer</Label>
            <Input
              id="dev-pass"
              type="password"
              autoFocus
              autoComplete="off"
              placeholder="Masukkan kode developer"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full">
            <Unlock className="size-4 mr-2" /> Buka Akses
          </Button>
        </form>

        <div className="mt-6 rounded-md border border-border/60 bg-muted/40 p-3 text-xs text-muted-foreground">
          <div className="mb-1 flex items-center gap-1.5 font-medium text-foreground">
            <Phone className="size-3.5" /> Butuh kode akses?
          </div>
          Hubungi <span className="font-semibold text-foreground">Sudut Ruang Arsitek</span> untuk meminta kode developer.
          Kontak resmi tercantum pada <span className="font-semibold">SOP</span> perusahaan.
        </div>

        {attempts >= 3 && (
          <div className="mt-3 rounded-md border border-destructive/30 bg-destructive/5 p-2 text-[11px] text-destructive">
            Percobaan gagal: {attempts}×. Pastikan Anda telah mendapatkan kode resmi dari Sudut Ruang Arsitek.
          </div>
        )}

        <p className="mt-4 text-center text-[10px] text-muted-foreground">
          © {new Date().getFullYear()} Sudut Ruang Arsitek · All Rights Reserved
        </p>
      </Card>
    </div>
  );
}