"use client";
// App-Zustand: ein Reducer, im Browser gespeichert (localStorage, mit try/catch, weil es in manchen Umgebungen fehlt).
import { createContext, useContext, useEffect, useReducer, useRef } from "react";
import { DRINKS, OPEN_MATCHES, PLAYERS, RACKETS } from "./data";

export type Tab = "start" | "buchen" | "mitspielen" | "turnier" | "bar" | "profil";

export type Booking = {
  id: string;
  day: string; // ISO-Datum JJJJ-MM-TT
  time: string;
  minutes: number;
  court: number;
  players: string[]; // Spieler-IDs, "me" = du
  price: number;
  open: boolean; // freie Plätze als offenes Match zeigen
};

export type OrderLine = { id: string; qty: number };
export type Order = { id: string; lines: OrderLine[]; court: number; total: number; at: number };
export type Rental = { id: string; racket: string; label: string; at: number };

export type Americano = {
  names: string[];
  rounds: [number, number, number, number][][]; // je Runde zwei Spiele: [a1, a2, b1, b2] (Index in names)
  scores: (number | null)[][]; // Punkte Team A je Spiel (Team B = 24 - A)
};

export type State = {
  me: { name: string; level: number };
  bookings: Booking[];
  joined: string[];
  orders: Order[];
  rentals: Rental[];
  americano: Americano | null;
  prefill: { court?: number; day?: number; time?: string } | null;
};

const INITIAL: State = {
  me: { name: "Alex", level: 3.5 },
  bookings: [],
  joined: [],
  orders: [],
  rentals: [],
  americano: null,
  prefill: null,
};

export type Action =
  | { t: "book"; b: Booking }
  | { t: "cancel"; id: string }
  | { t: "join"; id: string }
  | { t: "leave"; id: string }
  | { t: "order"; o: Order }
  | { t: "rent"; r: Rental }
  | { t: "unrent"; id: string }
  | { t: "americano"; a: Americano | null }
  | { t: "score"; round: number; game: number; a: number | null }
  | { t: "prefill"; p: State["prefill"] }
  | { t: "reset" }
  | { t: "load"; s: State };

function reduce(s: State, a: Action): State {
  switch (a.t) {
    case "book":
      return { ...s, bookings: [...s.bookings, a.b].sort((x, y) => (x.day + x.time).localeCompare(y.day + y.time)), prefill: null };
    case "cancel":
      return { ...s, bookings: s.bookings.filter((b) => b.id !== a.id) };
    case "join":
      return s.joined.includes(a.id) ? s : { ...s, joined: [...s.joined, a.id] };
    case "leave":
      return { ...s, joined: s.joined.filter((j) => j !== a.id) };
    case "order":
      return { ...s, orders: [a.o, ...s.orders].slice(0, 12) };
    case "rent":
      return { ...s, rentals: [a.r, ...s.rentals] };
    case "unrent":
      return { ...s, rentals: s.rentals.filter((r) => r.id !== a.id) };
    case "americano":
      return { ...s, americano: a.a };
    case "score": {
      if (!s.americano) return s;
      const scores = s.americano.scores.map((r) => [...r]);
      scores[a.round][a.game] = a.a;
      return { ...s, americano: { ...s.americano, scores } };
    }
    case "prefill":
      return { ...s, prefill: a.p };
    case "reset":
      return INITIAL;
    case "load":
      return a.s;
  }
}

const KEY = "fl27-app-v1";

// Nur gültige gespeicherte Daten übernehmen (alte oder fremde Stände verwerfen)
function sane(raw: unknown): State | null {
  if (!raw || typeof raw !== "object") return null;
  const s = raw as Partial<State>;
  if (!s.me || !Array.isArray(s.bookings) || !Array.isArray(s.joined) || !Array.isArray(s.orders) || !Array.isArray(s.rentals)) return null;
  const okMatch = new Set(OPEN_MATCHES.map((m) => m.id));
  const okDrink = new Set(DRINKS.map((d) => d.id));
  const okRacket = new Set(RACKETS.map((r) => r.id));
  const okPlayer = new Set(["me", ...PLAYERS.map((p) => p.id)]);
  return {
    ...INITIAL,
    me: { name: String(s.me.name || "Alex").slice(0, 20), level: Number(s.me.level) || 3.5 },
    bookings: s.bookings.filter((b) => b && typeof b.id === "string").map((b) => ({ ...b, players: b.players.filter((p) => okPlayer.has(p)) })),
    joined: s.joined.filter((j) => okMatch.has(j)),
    orders: s.orders.filter((o) => o && o.lines?.every((l) => okDrink.has(l.id))),
    rentals: s.rentals.filter((r) => r && okRacket.has(r.racket)),
    americano: s.americano && Array.isArray(s.americano.rounds) ? s.americano : null,
    prefill: null,
  };
}

type Ctx = { s: State; d: React.Dispatch<Action> };
const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [s, d] = useReducer(reduce, INITIAL);
  const loaded = useRef(false);
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      const ok = raw ? sane(JSON.parse(raw)) : null;
      if (ok) d({ t: "load", s: ok });
    } catch {
      /* Speicher nicht verfügbar: Demo läuft ohne Speichern weiter */
    }
    loaded.current = true;
  }, []);
  useEffect(() => {
    if (!loaded.current) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify({ ...s, prefill: null }));
    } catch {
      /* ignorieren */
    }
  }, [s]);
  return <StoreCtx.Provider value={{ s, d }}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useStore außerhalb von StoreProvider");
  return c;
}

export const uid = () => Math.random().toString(36).slice(2, 9);

export const isoDay = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export const dayOffset = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  const a = new Date(y, m - 1, d, 12);
  const b = new Date();
  b.setHours(12, 0, 0, 0);
  return Math.round((a.getTime() - b.getTime()) / 86400000);
};
