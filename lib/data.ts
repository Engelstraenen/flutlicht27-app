// Beispieldaten der Demo-App. Namen, Preise und Zeiten sind Platzhalter.

export type RacketShape = "rund" | "tropfen" | "diamant";
export type Racket = {
  id: string;
  name: string;
  shape: RacketShape;
  level: string;
  feel: string;
  price: string;
  euro: number;
  color: string;
  accent: string;
};

export const RACKETS: Racket[] = [
  { id: "r1", name: "Kontrolle 01", shape: "rund", level: "Einsteiger", feel: "Verzeiht fast alles. Großer Sweetspot.", price: "4 €", euro: 4, color: "#F4F7FF", accent: "#D8FF3C" },
  { id: "r2", name: "Kontrolle 02", shape: "rund", level: "Einsteiger bis Mittel", feel: "Weich im Treffpunkt, ruhig am Netz.", price: "4 €", euro: 4, color: "#0B0D12", accent: "#F4F7FF" },
  { id: "r3", name: "Allround 03", shape: "tropfen", level: "Mittel", feel: "Die Mitte aus Druck und Gefühl.", price: "5 €", euro: 5, color: "#D8FF3C", accent: "#0B0D12" },
  { id: "r4", name: "Allround 04", shape: "tropfen", level: "Mittel bis Fortgeschritten", feel: "Mehr Länge im Schlag, bleibt gutmütig.", price: "5 €", euro: 5, color: "#F2A23A", accent: "#0B0D12" },
  { id: "r5", name: "Power 05", shape: "diamant", level: "Fortgeschritten", feel: "Kopflastig. Für den Smash gebaut.", price: "6 €", euro: 6, color: "#FF4D3D", accent: "#F4F7FF" },
  { id: "r6", name: "Power 06 Carbon", shape: "diamant", level: "Turnier", feel: "Hart, direkt, kompromisslos.", price: "7 €", euro: 7, color: "#1A1D24", accent: "#D8FF3C" },
];

export const LEVELS = ["Erster Schlag", "Einsteiger", "Sicher im Spiel", "Mittel", "Fortgeschritten", "Stark", "Turnier"];
export const levelName = (l: number) => LEVELS[Math.max(0, Math.min(LEVELS.length - 1, Math.round(l) - 1))];

// Spielerinnen und Spieler (gemischt, wie auf der Seite)
export type Player = { id: string; name: string; level: number; tone: string };
export const PLAYERS: Player[] = [
  { id: "p1", name: "Ayla", level: 3.5, tone: "#ff6b57" },
  { id: "p2", name: "Malik", level: 4, tone: "#1848d8" },
  { id: "p3", name: "Jana", level: 3, tone: "#8b5cf6" },
  { id: "p4", name: "Tariq", level: 3.5, tone: "#f2a23a" },
  { id: "p5", name: "Lena", level: 3, tone: "#14b8a6" },
  { id: "p6", name: "Noah", level: 5, tone: "#e11d74" },
  { id: "p7", name: "Zoe", level: 5, tone: "#22c55e" },
  { id: "p8", name: "Greta", level: 2, tone: "#0ea5e9" },
  { id: "p9", name: "Deniz", level: 4, tone: "#eab308" },
  { id: "p10", name: "Mara", level: 4.5, tone: "#f97316" },
  { id: "p11", name: "Jonas", level: 4.5, tone: "#64748b" },
  { id: "p12", name: "Sofia", level: 5.5, tone: "#a855f7" },
  { id: "p13", name: "Karim", level: 5.5, tone: "#06b6d4" },
  { id: "p14", name: "Ida", level: 2.5, tone: "#84cc16" },
];
export const player = (id: string) => PLAYERS.find((p) => p.id === id)!;

// Live-Belegung jetzt (Demo)
export type CourtLive = { id: number; state: "frei" | "spiel" | "sucht"; until?: string; left?: number; players: string[]; level?: number };
export const LIVE: CourtLive[] = [
  { id: 1, state: "spiel", until: "20:30", left: 34, players: ["p10", "p11", "p12", "p13"], level: 5 },
  { id: 2, state: "sucht", until: "21:00", players: ["p4", "p5", "p3"], level: 3 },
  { id: 3, state: "spiel", until: "20:00", left: 12, players: ["p1", "p2", "p9", "p6"], level: 4 },
  { id: 4, state: "frei", players: [] },
  { id: 5, state: "spiel", until: "20:45", left: 51, players: ["p14", "p8", "p5", "p3"], level: 2 },
  { id: 6, state: "frei", players: [] },
  { id: 7, state: "sucht", until: "21:30", players: ["p6", "p7"], level: 5 },
  { id: 8, state: "spiel", until: "20:00", left: 5, players: ["p2", "p1", "p11", "p10"], level: 4 },
];

// Offene Matches
export type OpenMatch = { id: string; day: number; time: string; court: number; level: [number, number]; players: string[]; host: string };
export const OPEN_MATCHES: OpenMatch[] = [
  { id: "m1", day: 0, time: "21:00", court: 2, level: [3, 4], players: ["p4", "p5", "p3"], host: "p4" },
  { id: "m2", day: 0, time: "21:30", court: 7, level: [4.5, 5.5], players: ["p6", "p7"], host: "p6" },
  { id: "m3", day: 1, time: "07:00", court: 4, level: [1.5, 2.5], players: ["p8"], host: "p8" },
  { id: "m4", day: 1, time: "18:30", court: 6, level: [3.5, 4.5], players: ["p9", "p1", "p2"], host: "p9" },
  { id: "m5", day: 2, time: "19:30", court: 1, level: [5, 6], players: ["p12", "p13"], host: "p12" },
  { id: "m6", day: 3, time: "20:00", court: 3, level: [2.5, 3.5], players: ["p14", "p3", "p5"], host: "p14" },
];

// Buchung: Tage, Zeiten, Preise
export const DAY_NAMES = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
export const dayDate = (offset: number) => {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  return d;
};
export const dayLabel = (offset: number) => {
  if (offset === 0) return "Heute";
  if (offset === 1) return "Morgen";
  const d = dayDate(offset);
  return `${DAY_NAMES[d.getDay()]} ${d.getDate()}.${d.getMonth() + 1}.`;
};
export const TIMES = Array.from({ length: 31 }, (_, i) => {
  const m = 7 * 60 + i * 30;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${m % 60 ? "30" : "00"}`;
}); // 07:00 bis 22:00
export const DURATIONS = [60, 90, 120] as const;
export const isPrime = (time: string) => {
  const h = parseInt(time, 10);
  return h >= 17 && h < 22;
};
// Preis pro Court (ganze Gruppe) in Euro
export const price = (time: string, minutes: number) => Math.round((isPrime(time) ? 32 : 24) * (minutes / 60));

// Pseudozufällige, aber stabile Belegung je Tag/Zeit/Court
const hash = (a: number, b: number, c: number) => {
  let h = (a * 73856093) ^ (b * 19349663) ^ (c * 83492791);
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
};
export const isTaken = (day: number, timeIndex: number, court: number) => {
  const prime = isPrime(TIMES[timeIndex]);
  const p = hash(day + 3, Math.floor(timeIndex / 3), court) ;
  return p < (prime ? 0.62 : 0.34) - day * 0.03;
};
export const freeCourts = (day: number, timeIndex: number, minutes: number) => {
  const steps = minutes / 30;
  return [1, 2, 3, 4, 5, 6, 7, 8].filter((c) => {
    for (let k = 0; k < steps; k++) {
      if (timeIndex + k >= TIMES.length || isTaken(day, timeIndex + k, c)) return false;
    }
    return true;
  });
};
export const addMinutes = (time: string, minutes: number) => {
  const [h, m] = time.split(":").map(Number);
  const t = h * 60 + m + minutes;
  return `${String(Math.floor(t / 60) % 24).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
};

// Bar
export type Drink = { id: string; name: string; note: string; euro: number; cat: "Soft" | "Cocktail" | "Snack" };
export const DRINKS: Drink[] = [
  { id: "d1", name: "Wasser still/sprudel", note: "0,5 l, eiskalt", euro: 3, cat: "Soft" },
  { id: "d2", name: "Iso Grapefruit", note: "Elektrolyte für den dritten Satz", euro: 4, cat: "Soft" },
  { id: "d3", name: "Hausgemachte Limo", note: "Ingwer, Limette, Minze", euro: 4.5, cat: "Soft" },
  { id: "d4", name: "Cold Brew Tonic", note: "Für späte Matches", euro: 5, cat: "Soft" },
  { id: "d5", name: "Flutlicht Spritz", note: "Aperitivo, Grapefruit, Soda", euro: 9, cat: "Cocktail" },
  { id: "d6", name: "Smash Mule", note: "Wodka, Ginger Beer, Limette", euro: 10, cat: "Cocktail" },
  { id: "d7", name: "Matchball (alkoholfrei)", note: "Passionsfrucht, Zitrone, Tonic", euro: 7.5, cat: "Cocktail" },
  { id: "d8", name: "Salzbrezel-Bites", note: "Mit Honigsenf", euro: 4, cat: "Snack" },
  { id: "d9", name: "Protein-Bowl", note: "Quinoa, Hähnchen oder Tofu", euro: 11, cat: "Snack" },
];

// Rangliste (Paare)
export const RANKING = [
  { name: "Sofia & Karim", points: 1840, trend: 2 },
  { name: "Mara & Jonas", points: 1765, trend: 0 },
  { name: "Noah & Zoe", points: 1690, trend: 1 },
  { name: "Ayla & Malik", points: 1612, trend: 3 },
  { name: "Deniz & Tariq", points: 1588, trend: -1 },
  { name: "Lena & Jana", points: 1540, trend: 0 },
  { name: "Ida & Greta", points: 1475, trend: -2 },
];

export const euro = (n: number) => `${n.toFixed(n % 1 ? 2 : 0).replace(".", ",")} €`;
