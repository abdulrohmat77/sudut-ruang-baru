import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  MAX_MONETARY,
  isWithinMonetaryRange,
  MONEY_OVERFLOW_MESSAGE,
  formatIDR,
  parseIDR,
} from "@/lib/money";

export interface MoneyInputProps
  extends Omit<React.ComponentProps<typeof Input>, "type" | "onChange" | "value"> {
  value: string | number | null | undefined;
  onValueChange: (raw: string) => void;
  fieldLabel?: string;
  required?: boolean;
}

/**
 * Reusable IDR money input. Shows a thousand-separated IDR string while typing
 * (e.g. `Rp 1.250.000`) but always emits a clean numeric string to the parent.
 *
 * - min=0, max=MAX_MONETARY, step=0.01
 * - inline overflow / negative / invalid validation
 * - consistent error rendering via aria-describedby
 */
export function MoneyInput({
  value,
  onValueChange,
  fieldLabel,
  className,
  required,
  id,
  placeholder,
  ...rest
}: MoneyInputProps) {
  const autoId = React.useId();
  const inputId = id ?? autoId;
  const errorId = `${inputId}-err`;

  const cleaned = value === "" || value == null ? "" : String(value);
  const num = cleaned === "" ? null : Number(cleaned);
  const invalid = cleaned !== "" && (num === null || !Number.isFinite(num));
  const negative = num != null && Number.isFinite(num) && num < 0;
  const overflow = num != null && Number.isFinite(num) && num >= 0 && !isWithinMonetaryRange(num);

  const label = fieldLabel ? `"${fieldLabel}": ` : "";
  const error = invalid
    ? `${label}Format angka tidak valid.`
    : negative
      ? `${label}Nilai tidak boleh negatif.`
      : overflow
        ? `${label}${MONEY_OVERFLOW_MESSAGE}`
        : null;

  const [display, setDisplay] = React.useState<string>(() => formatIDR(cleaned));
  const [focused, setFocused] = React.useState(false);
  React.useEffect(() => {
    if (!focused) setDisplay(formatIDR(cleaned));
  }, [cleaned, focused]);

  return (
    <div className="space-y-1">
      <div className="relative">
        <span
          className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-muted-foreground"
          aria-hidden
        >
          Rp
        </span>
        <Input
          {...rest}
          id={inputId}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          required={required}
          placeholder={placeholder ?? "0"}
          data-money-value={cleaned}
          data-money-max={MAX_MONETARY}
          aria-invalid={!!error || undefined}
          aria-describedby={error ? errorId : undefined}
          value={display}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            setDisplay(formatIDR(cleaned));
          }}
          onChange={(e) => {
            const raw = e.target.value;
            setDisplay(raw);
            const parsed = parseIDR(raw);
            onValueChange(parsed);
          }}
          className={cn(
            "pl-8",
            !!error && "border-destructive focus-visible:ring-destructive",
            className,
          )}
        />
      </div>
      {error && (
        <p id={errorId} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}