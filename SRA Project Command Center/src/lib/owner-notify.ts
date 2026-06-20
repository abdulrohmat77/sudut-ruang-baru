/**
 * Server-only owner notification dispatch.
 *
 * Sends overflow alerts / report digests to a project's configured owner via:
 *   • Email (Lovable Emails app email send route)   – when scaffolded
 *   • WhatsApp (Twilio gateway)                     – when TWILIO_API_KEY linked
 *
 * Both transports are best-effort. Missing infra / failures are logged and
 * swallowed so the caller's primary action never fails because of notify.
 *
 * This file is server-only (`.server.ts`) — import dynamically from inside
 * server fn / route handlers, never at module scope of client-reachable files.
 */

type Channel = "email" | "whatsapp";

interface NotifyArgs {
  ownerEmail?: string | null;
  ownerPhone?: string | null;
  ownerName?: string | null;
  subject: string;
  text: string;          // plain text (used for WA, and email fallback)
  html?: string;         // optional html for email
  templateName?: string; // optional Lovable Email template id
  templateData?: Record<string, unknown>;
  idempotencyKey?: string;
}

export interface NotifyResult {
  attempted: Channel[];
  delivered: Channel[];
  errors: Array<{ channel: Channel; message: string }>;
}

async function sendEmail(args: NotifyArgs): Promise<void> {
  if (!args.ownerEmail) throw new Error("no_owner_email");
  const base =
    process.env.PUBLIC_BASE_URL ??
    process.env.LOVABLE_APP_URL ??
    process.env.VITE_PUBLIC_BASE_URL ??
    "";
  if (!base) throw new Error("no_base_url");
  const res = await fetch(`${base.replace(/\/$/, "")}/lovable/email/transactional/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.LOVABLE_API_KEY ?? ""}`,
    },
    body: JSON.stringify({
      templateName: args.templateName ?? "owner-alert",
      recipientEmail: args.ownerEmail,
      idempotencyKey: args.idempotencyKey,
      subjectOverride: args.subject,
      templateData: {
        subject: args.subject,
        ownerName: args.ownerName ?? "Owner",
        bodyText: args.text,
        bodyHtml: args.html ?? `<p>${escapeHtml(args.text)}</p>`,
        ...args.templateData,
      },
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`email_send_failed [${res.status}] ${body.slice(0, 200)}`);
  }
}

async function sendWhatsApp(args: NotifyArgs): Promise<void> {
  if (!args.ownerPhone) throw new Error("no_owner_phone");
  const lovableKey = process.env.LOVABLE_API_KEY;
  const twilioKey = process.env.TWILIO_API_KEY;
  const fromNumber = process.env.TWILIO_WHATSAPP_FROM; // e.g. "whatsapp:+14155238886"
  if (!lovableKey || !twilioKey) throw new Error("twilio_not_linked");
  if (!fromNumber) throw new Error("twilio_whatsapp_from_missing");
  const to = args.ownerPhone.startsWith("whatsapp:") ? args.ownerPhone : `whatsapp:${args.ownerPhone}`;
  const body = `*${args.subject}*\n\n${args.text}`;
  const res = await fetch("https://connector-gateway.lovable.dev/twilio/Messages.json", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": twilioKey,
    },
    body: new URLSearchParams({ To: to, From: fromNumber, Body: body }).toString(),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`twilio_send_failed [${res.status}] ${text.slice(0, 200)}`);
  }
}

export async function notifyOwner(args: NotifyArgs): Promise<NotifyResult> {
  const attempted: Channel[] = [];
  const delivered: Channel[] = [];
  const errors: Array<{ channel: Channel; message: string }> = [];

  if (args.ownerEmail) {
    attempted.push("email");
    try { await sendEmail(args); delivered.push("email"); }
    catch (e) { errors.push({ channel: "email", message: e instanceof Error ? e.message : String(e) }); }
  }
  if (args.ownerPhone) {
    attempted.push("whatsapp");
    try { await sendWhatsApp(args); delivered.push("whatsapp"); }
    catch (e) { errors.push({ channel: "whatsapp", message: e instanceof Error ? e.message : String(e) }); }
  }

  if (errors.length) {
    // eslint-disable-next-line no-console
    console.warn("[owner-notify] partial/failure", { attempted, delivered, errors });
  }
  return { attempted, delivered, errors };
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => (
    c === "&" ? "&amp;" : c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === '"' ? "&quot;" : "&#39;"
  ));
}