'use client';

import { useEffect, useRef, useState } from 'react';

type ChatMessage = { role: 'user' | 'assistant'; content: string; fallback?: boolean };

const CONTACT = {
  email: 'ayoub.aitchikh23@ump.ac.ma',
  linkedin: 'https://www.linkedin.com/in/ayoubaitchikh/',
};
const FALLBACK_TEXT =
  "The assistant is unavailable right now, please write to me directly. / L'assistant est indisponible, écris-moi directement.";
const SUGGESTIONS = ['What is your tech stack?', 'Are you available for work?', 'Tell me about your final-year project'];

export default function AskAyoub() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, open]);

  async function send(text: string) {
    const question = text.trim();
    if (!question || loading) return;

    const next: ChatMessage[] = [...messages, { role: 'user', content: question }];
    setMessages(next);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next.filter((m) => !m.fallback).map(({ role, content }) => ({ role, content })),
        }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: 'assistant', content: data.reply, fallback: Boolean(data.fallback) }]);
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: FALLBACK_TEXT, fallback: true }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-30 flex flex-col items-end gap-3">
      {open && (
        <section
          aria-label="Ask about Ayoub"
          className="pointer-events-auto flex h-[28rem] w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-sky-200/20 bg-[#140021] text-white shadow-xl shadow-slate-950/40"
        >
          <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <h2 className="text-sm font-semibold">Ask about Ayoub</h2>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close chat" className="text-slate-300 hover:text-white">
              ✕
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto p-4 text-sm" aria-live="polite">
            {messages.length === 0 && (
              <div className="space-y-2">
                <p className="text-slate-300">Hi! I answer questions about Ayoub&apos;s background, skills and availability.</p>
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="block w-full rounded-xl border border-sky-300/30 bg-sky-500/10 px-3 py-2 text-left text-xs text-sky-100 transition hover:border-sky-300"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 leading-5 ${
                  m.role === 'user' ? 'ml-auto bg-sky-400 text-slate-950' : 'bg-white/10 text-white'
                }`}
              >
                {m.content}
                {m.fallback && (
                  <span className="mt-2 flex flex-wrap gap-3 text-xs underline">
                    <a href={`mailto:${CONTACT.email}`}>Email</a>
                    <a href={CONTACT.linkedin} target="_blank" rel="noreferrer">
                      LinkedIn
                    </a>
                  </span>
                )}
              </div>
            ))}

            {loading && <div className="w-fit rounded-2xl bg-white/10 px-3 py-2 text-slate-300">…</div>}
            <div ref={endRef} />
          </div>

          <div className="border-t border-white/10 p-3">
            <div className="flex gap-2">
              <input
                value={input}
                maxLength={500}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send(input)}
                placeholder="Ask a question…"
                aria-label="Your question"
                className="min-w-0 flex-1 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-slate-400 focus:border-sky-300 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => send(input)}
                disabled={loading || !input.trim()}
                className="rounded-full bg-sky-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:opacity-50"
              >
                Send
              </button>
            </div>
            <p className="mt-2 text-[10px] leading-4 text-slate-400">
              AI assistant based on Ayoub&apos;s public info. Questions may be stored to improve it.
            </p>
          </div>
        </section>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="pointer-events-auto rounded-full bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-500/30 transition hover:bg-sky-300"
      >
        {open ? 'Close' : 'Ask my AI'}
      </button>
    </div>
  );
}