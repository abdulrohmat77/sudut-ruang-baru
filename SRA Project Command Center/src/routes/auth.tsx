import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Building2 } from "lucide-react";

export const Route = createFileRoute("/auth")({ component: AuthPage });

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: name }, emailRedirectTo: window.location.origin + "/dashboard" },
        });
        if (error) throw error;
        toast.success("Account created. You can sign in now.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/dashboard" });
      }
    } catch (err: any) {
      toast.error(err.message ?? "Authentication failed");
    } finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/dashboard" });
    if (r.error) toast.error("Google sign-in failed");
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex gradient-navy flex-col justify-between p-12 text-sidebar-foreground">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-md bg-accent flex items-center justify-center">
            <Building2 className="size-5 text-accent-foreground" />
          </div>
          <div>
            <div className="font-bold tracking-tight">PMIS</div>
            <div className="text-xs opacity-70">Construction Intelligence</div>
          </div>
        </div>
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">Run every project<br/>from a single command center.</h1>
          <p className="opacity-80 max-w-md">Planning, daily reports, finance, QA/QC, HSE, risk, documents, correspondence — and an AI assistant trained on your project data.</p>
        </div>
        <div className="text-xs opacity-60">© {new Date().getFullYear()} PMIS · Enterprise Edition</div>
      </div>
      <div className="flex items-center justify-center p-6">
        <Card className="w-full max-w-md p-8">
          <h2 className="text-2xl font-bold mb-1">{mode === "signin" ? "Welcome back" : "Create your account"}</h2>
          <p className="text-sm text-muted-foreground mb-6">{mode === "signin" ? "Sign in to access the PMIS workspace." : "First user becomes Super Admin automatically."}</p>
          <Button variant="outline" className="w-full mb-4" onClick={handleGoogle} type="button">
            Continue with Google
          </Button>
          <div className="relative my-4 text-center text-xs text-muted-foreground">
            <span className="bg-card px-2 relative z-10">or</span>
            <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div><Label htmlFor="name">Full name</Label><Input id="name" value={name} onChange={e=>setName(e.target.value)} required /></div>
            )}
            <div><Label htmlFor="email">Email</Label><Input id="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required /></div>
            <div><Label htmlFor="password">Password</Label><Input id="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={6} /></div>
            <Button type="submit" className="w-full" disabled={loading}>{loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}</Button>
          </form>
          <button type="button" onClick={()=>setMode(mode==="signin"?"signup":"signin")} className="text-sm text-muted-foreground hover:text-foreground mt-4 block mx-auto">
            {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
          </button>
          <div className="mt-6 border-t border-border/60 pt-4 text-center text-[10px] text-muted-foreground">
            © {new Date().getFullYear()} <span className="font-semibold text-foreground">Sudut Ruang Arsitek</span>. All Rights Reserved.
            <div className="opacity-80">Web App ini adalah hak milik Sudut Ruang Arsitek — kontak resmi tercantum pada SOP.</div>
          </div>
        </Card>
      </div>
    </div>
  );
}