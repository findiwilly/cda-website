"use client";

import { useEffect, useState } from "react";
import { Loader2, Send, User, Shield } from "lucide-react";

type Lead = any;
type Msg = any;

export default function Messages() {
  const [threads, setThreads] = useState<any[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [lead, setLead] = useState<Lead | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const r = await fetch("/api/admin/messages");
      if (r.ok) {
        const d = await r.json();
        setThreads(d.threads || []);
        if ((d.threads || []).length && !active) setActive(d.threads[0].leadId);
      }
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!active) return;
    (async () => {
      const r = await fetch(`/api/admin/messages/${active}`);
      if (r.ok) {
        const d = await r.json();
        setLead(d.lead);
        setMsgs(d.messages || []);
      }
    })();
  }, [active]);

  async function send() {
    if (!body.trim() || !active || !lead) return;
    setSending(true);
    const r = await fetch("/api/admin/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        leadId: active,
        from: "admin",
        body: body.trim(),
        toEmail: lead.email,
        locale: lead.locale || "fr",
      }),
    });
    if (r.ok) {
      setBody("");
      const d = await r.json();
      setMsgs((m) => [...m, d.message]);
    }
    setSending(false);
  }

  return (
    <div className="grid min-h-[70vh] gap-4 md:grid-cols-[320px_1fr]">
      <div className="glass rounded-2xl border border-white/10 p-4">
        <h2 className="text-sm uppercase tracking-widest text-ink-400">Threads</h2>
        {loading && <Loader2 className="mt-4 h-4 w-4 animate-spin" />}
        <ul className="mt-4 space-y-2">
          {threads.map((t) => (
            <li key={t.leadId}>
              <button
                onClick={() => setActive(t.leadId)}
                className={`w-full rounded-lg p-3 text-left transition ${active === t.leadId ? "bg-white/10" : "hover:bg-white/5"}`}
              >
                <p className="text-sm font-medium text-ink-50">{t.lead?.name || "—"}</p>
                <p className="truncate text-xs text-ink-400">{t.lead?.email || t.last?.toEmail || ""}</p>
                {t.hasUnread && <span className="mt-1 inline-block rounded-full bg-cdagreen/40 px-2 py-0.5 text-[10px] uppercase">Unread</span>}
              </button>
            </li>
          ))}
          {threads.length === 0 && !loading && <p className="text-sm text-ink-400">No conversations</p>}
        </ul>
      </div>
      <div className="flex flex-col rounded-2xl border border-white/10 bg-ink-900/40">
        <div className="border-b border-white/10 p-4">
          <p className="text-sm font-medium text-ink-50">{lead?.name || "—"}</p>
          <p className="text-xs text-ink-400">{lead?.email || ""} · {lead?.whatsapp ? `+${lead.whatsapp}` : ""}</p>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {msgs.map((m) => (
            <div key={m._id} className={`flex ${m.from === "admin" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${m.from === "admin" ? "bg-cdagreen text-white" : "bg-white/10 text-ink-50"}`}>
                <div className="mb-1 flex items-center gap-1 text-[10px] uppercase opacity-70">
                  {m.from === "admin" ? <Shield size={10} /> : <User size={10} />}
                  {m.from}
                </div>
                <p className="whitespace-pre-wrap text-sm">{m.body}</p>
                <p className="mt-1 text-right text-[10px] opacity-60">{new Date(m.createdAt).toLocaleString()}</p>
              </div>
            </div>
          ))}
          {msgs.length === 0 && <p className="text-center text-sm text-ink-400">No messages yet</p>}
        </div>
        <div className="border-t border-white/10 p-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex gap-2"
          >
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={2}
              placeholder="Type reply..."
              className="flex-1 resize-none rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-ink-50 placeholder:text-ink-400"
            />
            <button disabled={sending || !body.trim()} className="flex items-center gap-1 rounded-lg bg-cdagreen px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
