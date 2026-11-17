"use client";
import { useMemo, useState } from "react";
import { PLAYERS, RANKING } from "@/lib/data";
import { useStore, type Americano } from "@/lib/store";
import { Icon, Segments, useToast } from "../ui";
import { ScreenHead } from "../App";

type View = "rangliste" | "americano";

// Americano für 8: jede Person spielt einmal mit jeder anderen zusammen (Kreis-Verfahren), 7 Runden auf 2 Courts.
function makeRounds(n: number): Americano["rounds"] {
  const ids = Array.from({ length: n }, (_, i) => i);
  const rounds: Americano["rounds"] = [];
  for (let r = 0; r < n - 1; r++) {
    const pairs: [number, number][] = [];
    for (let i = 0; i < n / 2; i++) pairs.push([ids[i], ids[n - 1 - i]]);
    const games: [number, number, number, number][] = [];
    for (let g = 0; g < pairs.length; g += 2) games.push([pairs[g][0], pairs[g][1], pairs[g + 1][0], pairs[g + 1][1]]);
    rounds.push(games);
    ids.splice(1, 0, ids.pop()!);
  }
  return rounds;
}

export function TourScreen() {
  const { s } = useStore();
  const [view, setView] = useState<View>(s.americano ? "americano" : "rangliste");
  return (
    <div className="scr">
      <ScreenHead kicker="Turnier" title={view === "rangliste" ? <>Hallen-<br />Rangliste</> : <>Americano</>} right={<span />} />
      <Segments label="Ansicht" value={view} onChange={setView} options={[{ v: "rangliste", l: "Rangliste" }, { v: "americano", l: "Americano" }]} />
      {view === "rangliste" ? <Ranking /> : <AmericanoView />}
    </div>
  );
}

function Ranking() {
  const top = RANKING.slice(0, 3);
  const order = [top[1], top[0], top[2]];
  return (
    <section className="block" aria-label="Rangliste der Paare">
      <div className="podium" aria-hidden="true">
        {order.map((r, i) => {
          const place = i === 1 ? 1 : i === 0 ? 2 : 3;
          return (
            <div key={r.name} className={`pod p${place}`}>
              <b className="pod-name">{r.name.replace(" & ", "\n& ")}</b>
              <span className="pod-pts">{r.points.toLocaleString("de-DE")}</span>
              <div className="pod-col">
                <i>{place}</i>
              </div>
            </div>
          );
        })}
      </div>
      <ol className="rank">
        {RANKING.map((r, i) => (
          <li key={r.name}>
            <span className="rk-pos">{i + 1}</span>
            <span className="rk-name">{r.name}</span>
            <span className={`rk-trend ${r.trend > 0 ? "up" : r.trend < 0 ? "down" : ""}`} aria-label={r.trend > 0 ? `${r.trend} Plätze hoch` : r.trend < 0 ? `${-r.trend} Plätze runter` : "unverändert"}>
              {r.trend > 0 ? `▲${r.trend}` : r.trend < 0 ? `▼${-r.trend}` : "–"}
            </span>
            <span className="rk-pts">{r.points.toLocaleString("de-DE")}</span>
          </li>
        ))}
        <li className="rk-me">
          <span className="rk-pos">14</span>
          <span className="rk-name">Du & Malik</span>
          <span className="rk-trend up">▲4</span>
          <span className="rk-pts">1.388</span>
        </li>
      </ol>
      <p className="hint">Punkte aus gewerteten Matches der letzten 90 Tage. Siege gegen stärkere Paare zählen mehr.</p>
    </section>
  );
}

function AmericanoView() {
  const { s, d } = useStore();
  const toast = useToast();
  const pool = useMemo(() => [{ id: "me", name: "Du" }, ...PLAYERS.map((p) => ({ id: p.id, name: p.name }))], []);
  const [picked, setPicked] = useState<string[]>(() => pool.slice(0, 8).map((p) => p.id));
  const [round, setRound] = useState(0);
  const a = s.americano;

  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length >= 8 ? p : [...p, id]));
  const start = () => {
    const names = picked.map((id) => pool.find((p) => p.id === id)!.name);
    const rounds = makeRounds(8);
    d({ t: "americano", a: { names, rounds, scores: rounds.map((r) => r.map(() => null)) } });
    setRound(0);
    toast("Americano gestartet: 7 Runden");
  };

  if (!a) {
    return (
      <section className="block" aria-labelledby="am-h">
        <h2 id="am-h" className="sec-h">8 Spieler wählen</h2>
        <p className="muted small">Jede Runde neue Partner, gespielt wird auf 24 Punkte. Am Ende zählen deine eigenen Punkte.</p>
        <div className="chips">
          {pool.map((p) => {
            const on = picked.includes(p.id);
            return (
              <button key={p.id} className={`chip${on ? " on" : ""}`} aria-pressed={on} onClick={() => toggle(p.id)}>
                {p.name}
              </button>
            );
          })}
        </div>
        <button className="btn wide" disabled={picked.length !== 8} onClick={start}>
          {picked.length === 8 ? "Runden auslosen" : `Noch ${8 - picked.length} wählen`}
        </button>
      </section>
    );
  }

  // Tabelle: Punkte je Person
  const pts = a.names.map(() => 0);
  const played = a.names.map(() => 0);
  a.rounds.forEach((r, ri) =>
    r.forEach((g, gi) => {
      const sc = a.scores[ri][gi];
      if (sc === null) return;
      pts[g[0]] += sc;
      pts[g[1]] += sc;
      pts[g[2]] += 24 - sc;
      pts[g[3]] += 24 - sc;
      g.forEach((p) => (played[p] += 1));
    }),
  );
  const table = a.names.map((n, i) => ({ n, p: pts[i], g: played[i] })).sort((x, y) => y.p - x.p);
  const done = a.scores.flat().filter((x) => x !== null).length;
  const games = a.rounds[round];

  return (
    <section className="block am" aria-label="Americano">
      <div className="am-nav">
        <button className="icon-btn" onClick={() => setRound((r) => Math.max(0, r - 1))} disabled={round === 0} aria-label="Vorherige Runde">
          <Icon name="back" />
        </button>
        <p>
          <span className="kicker">Runde</span>
          <b>
            {round + 1}
            <small>/7</small>
          </b>
        </p>
        <button className="icon-btn" onClick={() => setRound((r) => Math.min(6, r + 1))} disabled={round === 6} aria-label="Nächste Runde">
          <Icon name="arrow" />
        </button>
      </div>
      <div className="am-progress" aria-label={`${done} von 14 Spielen eingetragen`}>
        <i style={{ width: `${(done / 14) * 100}%` }} />
      </div>

      {games.map((g, gi) => {
        const sc = a.scores[round][gi];
        const setA = (v: number) => d({ t: "score", round, game: gi, a: Math.max(0, Math.min(24, v)) });
        return (
          <div className="am-game" key={gi}>
            <p className="am-court">Court {gi + 1}</p>
            <div className="am-row">
              <span className="am-team">{a.names[g[0]]} & {a.names[g[1]]}</span>
              <div className="stepper">
                <button onClick={() => setA((sc ?? 12) - 1)} aria-label="Team A minus">
                  <Icon name="minus" size={16} />
                </button>
                <b aria-live="polite">{sc ?? "–"}</b>
                <button onClick={() => setA((sc ?? 12) + 1)} aria-label="Team A plus">
                  <Icon name="plus" size={16} />
                </button>
              </div>
            </div>
            <div className="am-row">
              <span className="am-team">{a.names[g[2]]} & {a.names[g[3]]}</span>
              <b className="am-b">{sc === null ? "–" : 24 - sc}</b>
            </div>
            {sc === null && (
              <button className="link" onClick={() => setA(12)}>
                Ergebnis eintragen
              </button>
            )}
          </div>
        );
      })}

      <h2 className="sec-h">Tabelle</h2>
      <ol className="rank am-table">
        {table.map((r, i) => (
          <li key={r.n} className={r.n === "Du" ? "rk-me" : ""}>
            <span className="rk-pos">{i + 1}</span>
            <span className="rk-name">{r.n}</span>
            <span className="rk-trend">{r.g} Sp.</span>
            <span className="rk-pts">{r.p}</span>
          </li>
        ))}
      </ol>
      <button className="btn ghost wide" onClick={() => d({ t: "americano", a: null })}>
        Neues Americano
      </button>
    </section>
  );
}
