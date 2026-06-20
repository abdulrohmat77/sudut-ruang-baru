import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

// ── Tombol Kembali ke Kiro Dashboard ──────────────────────────────────────────
// Desain cermin dari CommandCenterLauncher di Kiro:
// pill vertikal, nempel di tepi KANAN layar, warna & shadow identik.
function BackToDashboardButton() {
  const handleBack = () => {
    // Satu domain di Netlify → tinggal ke /
    // Lokal: Vite middleware serve Kiro di port yang sama (3000)
    window.location.href = "/"
  }

  return (
    <button
      onClick={handleBack}
      aria-label="Kembali ke Kiro Dashboard"
      title="Kembali ke Kiro — AI Sales Dashboard"
      style={{
        position: "fixed",
        right: 0,
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "12px 8px",
        writingMode: "vertical-rl",
        // Warna identik dengan T.bright di CommandCenterLauncher Kiro
        background: "linear-gradient(180deg, #1a8bcd 0%, #0d6fa8 100%)",
        color: "#ffffff",
        border: "none",
        borderRadius: "10px 0 0 10px",
        cursor: "pointer",
        fontWeight: 700,
        fontSize: 12,
        letterSpacing: 0.5,
        boxShadow: "-4px 0 16px rgba(0,0,0,0.3)",
        fontFamily: "'Sora', 'Manrope', sans-serif",
        transition: "opacity 0.2s, box-shadow 0.2s",
        lineHeight: 1.2,
        userSelect: "none",
        whiteSpace: "nowrap",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = "0.85"
        e.currentTarget.style.boxShadow = "-6px 0 24px rgba(0,0,0,0.45)"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = "1"
        e.currentTarget.style.boxShadow = "-4px 0 16px rgba(0,0,0,0.3)"
      }}
    >
      {/* Chevron kiri — rotate 90° agar mengarah ke bawah (vertikal) */}
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ transform: "rotate(90deg)", flexShrink: 0 }}
      >
        <polyline points="15 18 9 12 15 6" />
      </svg>
      Kiro Dashboard
    </button>
  )
}

// ── 404 ────────────────────────────────────────────────────────────────────────
function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Error boundary ─────────────────────────────────────────────────────────────
function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-4 text-left bg-red-950/20 p-4 rounded text-red-400 text-xs overflow-auto max-h-[300px]">
          <strong>Error:</strong> {error?.message}
          <br /><br />
          <pre>{error?.stack}</pre>
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Route root ─────────────────────────────────────────────────────────────────
export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Sudut Ruang PMIS — Designing Corners, Defining Spaces" },
      { name: "description", content: "Sudut Ruang Arsitek — Project Management Information System untuk studio Design & Build premium. Strategi, desain, dan eksekusi dalam satu sistem." },
      { property: "og:title", content: "Sudut Ruang PMIS — Designing Corners, Defining Spaces" },
      { property: "og:description", content: "PMIS internal Sudut Ruang Arsitek — orchestrasi proyek dari brief hingga BAST." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "author", content: "Sudut Ruang Arsitek" },
      { name: "copyright", content: "© Sudut Ruang Arsitek — All Rights Reserved" },
      { name: "owner", content: "Sudut Ruang Arsitek" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=Manrope:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Tombol kembali ke Kiro — nempel kanan layar, selalu visible di semua halaman */}
      <BackToDashboardButton />
      {/* Required: nested routes render here */}
      <Outlet />
    </QueryClientProvider>
  );
}
