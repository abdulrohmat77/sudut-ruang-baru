import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/**
 * Corner brackets — a subtle architectural framing device.
 * Wraps any content with thin L-shaped marks at each corner.
 */
export function CornerFrame({
  children,
  className,
  tone = "navy",
}: {
  children: ReactNode;
  className?: string;
  tone?: "navy" | "cyan" | "muted";
}) {
  const color =
    tone === "cyan"
      ? "before:border-accent after:border-accent [&>span]:border-accent"
      : tone === "muted"
        ? "before:border-border after:border-border [&>span]:border-border"
        : "before:border-primary/40 after:border-primary/40 [&>span]:border-primary/40";
  return (
    <div
      className={cn(
        "relative",
        "before:absolute before:left-0 before:top-0 before:h-3 before:w-3 before:border-l before:border-t",
        "after:absolute after:right-0 after:top-0 after:h-3 after:w-3 after:border-r after:border-t",
        color,
        className,
      )}
    >
      <span className="pointer-events-none absolute left-0 bottom-0 h-3 w-3 border-l border-b" />
      <span className="pointer-events-none absolute right-0 bottom-0 h-3 w-3 border-r border-b" />
      {children}
    </div>
  );
}

/**
 * Section label in the technical-drawing style: REF · LABEL — content.
 */
export function TechLabel({
  ref,
  label,
  className,
}: {
  ref?: string;
  label: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground", className)}>
      {ref && <span className="font-mono text-accent">{ref}</span>}
      {ref && <span className="h-px w-4 bg-border" />}
      <span>{label}</span>
    </div>
  );
}

/** A thin divider line with optional centered label, like a drawing reference. */
export function RuleLine({ label, className }: { label?: string; className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="h-px flex-1 bg-border" />
      {label && (
        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      )}
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

/** Premium card with subtle shadow, hairline border, generous padding. */
export function PremiumCard({
  children,
  className,
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card shadow-[0_1px_2px_0_rgba(4,54,102,0.04),0_1px_3px_0_rgba(4,54,102,0.06)]",
        padded && "p-5 md:p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * Sudut Ruang monogram — the corner mark.
 * Two L-shapes forming an architectural corner.
 */
export function SRMonogram({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
    >
      {/* outer corner bracket */}
      <path d="M4 4 L4 22 M4 4 L22 4" />
      {/* inner counter-corner */}
      <path d="M28 28 L28 14 M28 28 L14 28" />
      {/* connecting diagonal — the 'sudut' (corner) */}
      <path d="M11 11 L21 21" strokeOpacity="0.55" />
    </svg>
  );
}
