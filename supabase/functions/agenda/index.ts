// Agenda da GR Events no formato iCalendar (.ics), para assinar no Google Agenda.
// Acesso por link secreto: /functions/v1/agenda?t=<token>
// Só eventos ativos (não cancelados) e sem nenhum valor financeiro.
// Publicada no Supabase com verify_jwt = false (o acesso é controlado pelo token).
import { createClient } from "npm:@supabase/supabase-js@2";

const db = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } },
);

const TZ = "-03:00"; // horário de Brasília (sem horário de verão)
const enc = new TextEncoder();

const esc = (s: unknown) =>
  String(s ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");

// quebra linhas em no máximo 75 bytes, sem cortar acentos no meio
function fold(line: string): string {
  const out: string[] = [];
  let cur = "", size = 0, limit = 75;
  for (const ch of line) {
    const n = enc.encode(ch).length;
    if (size + n > limit) { out.push(cur); cur = " "; size = 1; limit = 75; }
    cur += ch; size += n;
  }
  out.push(cur);
  return out.join("\r\n");
}

const isDate = (s: unknown) => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
const isTime = (s: unknown) => typeof s === "string" && /^\d{2}:\d{2}$/.test(s);
const utc = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const ymd = (s: string) => s.replace(/-/g, "");
function addDays(s: string, n: number) {
  const d = new Date(s + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// deno-lint-ignore no-explicit-any
function vevent(e: any, stamp: string): string[] | null {
  if (!isDate(e.start)) return null;
  const endDate = isDate(e.end) && e.end >= e.start ? e.end : e.start;
  const L = ["BEGIN:VEVENT", `UID:${esc(e.id)}@gr-events-sistem`, `DTSTAMP:${stamp}`];
  if (isTime(e.startTime)) {
    const s = new Date(`${e.start}T${e.startTime}:00${TZ}`);
    let f = isTime(e.endTime) ? new Date(`${endDate}T${e.endTime}:00${TZ}`) : null;
    if (f && f <= s && endDate === e.start) f = new Date(f.getTime() + 86400000); // termina depois da meia-noite
    if (!f || f <= s) f = new Date(s.getTime() + 3600000); // sem horário de término: 1 hora
    L.push(`DTSTART:${utc(s)}`, `DTEND:${utc(f)}`);
  } else {
    L.push(`DTSTART;VALUE=DATE:${ymd(e.start)}`, `DTEND;VALUE=DATE:${ymd(addDays(endDate, 1))}`);
  }
  L.push(`SUMMARY:${esc(e.name || "Evento")}`);
  const loc = [e.local, e.address].filter(Boolean).join(" - ");
  if (loc) L.push(`LOCATION:${esc(loc)}`);
  const det = [
    e.client ? `Cliente: ${e.client}` : "",
    e.contact ? `Contato: ${e.contact}${e.phone ? " " + e.phone : ""}` : "",
    e.guests ? `Convidados: ${e.guests}` : "",
    e.status ? `Status: ${e.status}` : "",
  ].filter(Boolean).join("\n");
  if (det) L.push(`DESCRIPTION:${esc(det)}`);
  L.push(e.status === "PLANEJAMENTO" ? "STATUS:TENTATIVE" : "STATUS:CONFIRMED", "END:VEVENT");
  return L;
}

Deno.serve(async (req) => {
  const t = new URL(req.url).searchParams.get("t") || "";
  if (!/^[0-9a-f]{64}$/.test(t)) return new Response("Link inválido.", { status: 404 });

  const feed = await db.from("calendar_feeds").select("user_id").eq("token", t).maybeSingle();
  if (feed.error || !feed.data) return new Response("Link inválido.", { status: 404 });
  // quem perdeu o acesso ao sistema perde também a agenda
  const prof = await db.from("profiles").select("id").eq("id", feed.data.user_id).maybeSingle();
  if (prof.error || !prof.data) return new Response("Link inválido.", { status: 404 });

  const kv = await db.from("kv").select("value").eq("key", "events").maybeSingle();
  if (kv.error) return new Response("Erro ao ler a agenda.", { status: 500 });
  const events = Array.isArray(kv.data?.value) ? kv.data!.value : [];

  const stamp = utc(new Date());
  const lines = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//GR Events//Sistema//PT-BR", "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH", "X-WR-CALNAME:GR Events", "X-WR-TIMEZONE:America/Sao_Paulo",
    "REFRESH-INTERVAL;VALUE=DURATION:PT1H", "X-PUBLISHED-TTL:PT1H",
  ];
  for (const e of events) {
    if (!e || e.status === "CANCELADO") continue;
    const v = vevent(e, stamp);
    if (v) lines.push(...v);
  }
  lines.push("END:VCALENDAR");

  return new Response(lines.map(fold).join("\r\n") + "\r\n", {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="gr-events.ics"',
      "Cache-Control": "no-store",
    },
  });
});
