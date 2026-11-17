"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// Überlagerungen hängen am Telefon-Rahmen, nicht am scrollenden Inhalt
const phoneEl = () => (typeof document === "undefined" ? null : document.querySelector<HTMLElement>(".phone"));
import { player } from "@/lib/data";

/* ---------- Icons (eigene Linien-Icons, 24er Raster) ---------- */
const PATHS: Record<string, string> = {
  start: "M4 4h7v9H4zM13 4h7v5h-7zM13 11h7v9h-7zM4 15h7v5H4z",
  buchen: "M4 6h16v14H4zM4 10h16M8 3v5M16 3v5M8 14h3M13 14h3M8 17h3",
  mitspielen: "M8 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM2 20c0-3.5 2.7-6 6-6s6 2.5 6 6M17 8v6M14 11h6",
  turnier: "M7 4h10v4a5 5 0 0 1-10 0zM7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4M12 13v4M8 20h8M10 17h4",
  bar: "M5 4h14l-6 8v6M9 20h8M8 8h8",
  profil: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4 3.6-7 8-7s8 3 8 7",
  close: "M6 6l12 12M18 6L6 18",
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  check: "M5 12.5l4.5 4.5L19 7",
  arrow: "M5 12h14M13 6l6 6-6 6",
  back: "M19 12H5M11 6l-6 6 6 6",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2",
  racket: "M14.5 3.5a5.5 5.5 0 0 1 0 11L9 20l-3-3 5.5-5.5a5.5 5.5 0 0 1 3-8z",
  bolt: "M13 2L4 14h7l-1 8 9-12h-7z",
  share: "M12 3v12M7 8l5-5 5 5M5 14v6h14v-6",
  trash: "M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13",
  install: "M12 3v12M7 10l5 5 5-5M5 20h14",
};
export function Icon({ name, size = 22, stroke = 2 }: { name: keyof typeof PATHS | string; size?: number; stroke?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={PATHS[name] ?? ""} />
    </svg>
  );
}

/* ---------- Avatar ---------- */
export function Avatar({ id, size = 34, ring }: { id: string | null; size?: number; ring?: boolean }) {
  if (!id) {
    return (
      <span className="av empty" style={{ width: size, height: size }} aria-label="Freier Platz">
        <Icon name="plus" size={size * 0.5} />
      </span>
    );
  }
  const me = id === "me";
  const p = me ? null : player(id);
  const name = me ? "Du" : p!.name;
  return (
    <span
      className={`av${me ? " me" : ""}${ring ? " ring" : ""}`}
      style={{ width: size, height: size, background: me ? "var(--ball)" : p!.tone, fontSize: size * 0.4 }}
      title={name}
      aria-label={name}
    >
      {me ? "Du" : name.slice(0, 1)}
    </span>
  );
}

/* ---------- Mini-Court (von oben, hochkant) ---------- */
export function CourtMini({ state, players, label, progress }: { state: "frei" | "spiel" | "sucht" | "mine"; players: string[]; label: string; progress?: number }) {
  const spots = [0, 1, 2, 3].map((i) => players[i] ?? null);
  const pos = [
    [28, 30],
    [72, 30],
    [28, 130],
    [72, 130],
  ];
  return (
    <svg className={`court-mini s-${state}`} viewBox="0 0 100 160" role="img" aria-label={label}>
      <rect className="cm-floor" x="2" y="2" width="96" height="156" rx="3" />
      <g className="cm-lines" fill="none">
        <rect x="8" y="8" width="84" height="144" />
        <path d="M8 42h84M8 118h84M50 42v76" />
      </g>
      <path className="cm-net" d="M4 80h92" />
      {spots.map((id, i) =>
        id ? (
          <circle key={i} cx={pos[i][0]} cy={pos[i][1]} r="9" fill={id === "me" ? "#d8ff3c" : player(id).tone} stroke="#0b0d12" strokeWidth="2.5" />
        ) : state === "sucht" ? (
          <circle key={i} className="cm-open" cx={pos[i][0]} cy={pos[i][1]} r="8.5" />
        ) : null,
      )}
      {progress !== undefined && <rect className="cm-progress" x="2" y="154" width={96 * Math.max(0, Math.min(1, progress))} height="4" />}
    </svg>
  );
}

/* ---------- Bottom-Sheet ---------- */
export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.querySelector<HTMLElement>("button, [href], input")?.focus();
    const key = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("keydown", key);
      prev?.focus?.();
    };
  }, [open, onClose]);
  const host = phoneEl();
  if (!open || !host) return null;
  return createPortal(
    <div className="sheet-wrap" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={title} ref={ref} onClick={(e) => e.stopPropagation()}>
        <div className="sheet-grip" aria-hidden="true" />
        <div className="sheet-head">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Schließen">
            <Icon name="close" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    host,
  );
}

/* ---------- Toast ---------- */
const ToastCtx = createContext<(msg: string) => void>(() => {});
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [msg, setMsg] = useState<{ text: string; k: number } | null>(null);
  const show = useCallback((text: string) => setMsg({ text, k: Date.now() }), []);
  useEffect(() => {
    if (!msg) return;
    const t = window.setTimeout(() => setMsg(null), 2600);
    return () => window.clearTimeout(t);
  }, [msg]);
  const [host, setHost] = useState<HTMLElement | null>(null);
  useEffect(() => setHost(phoneEl()), []);
  const zone = (
    <div className="toast-zone" role="status" aria-live="polite">
      {msg && (
        <div className="toast" key={msg.k}>
          <span className="toast-dot" aria-hidden="true">
            <Icon name="check" size={16} stroke={3} />
          </span>
          {msg.text}
        </div>
      )}
    </div>
  );
  return (
    <ToastCtx.Provider value={show}>
      {children}
      {host && createPortal(zone, host)}
    </ToastCtx.Provider>
  );
}
export const useToast = () => useContext(ToastCtx);

/* ---------- Level-Anzeige ---------- */
export function LevelPill({ range }: { range: [number, number] | number }) {
  const txt = Array.isArray(range) ? `${String(range[0]).replace(".", ",")}–${String(range[1]).replace(".", ",")}` : String(range).replace(".", ",");
  return <span className="lv-pill">Lv {txt}</span>;
}

/* ---------- Segment-Umschalter ---------- */
export function Segments<T extends string>({ value, options, onChange, label }: { value: T; options: { v: T; l: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div className="seg" role="tablist" aria-label={label}>
      {options.map((o) => (
        <button key={o.v} role="tab" aria-selected={value === o.v} className={value === o.v ? "on" : ""} onClick={() => onChange(o.v)}>
          {o.l}
        </button>
      ))}
    </div>
  );
}
