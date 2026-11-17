"use client";
import { useState } from "react";
import { OPEN_MATCHES, addMinutes, dayLabel, levelName, player } from "@/lib/data";
import { dayOffset, useStore } from "@/lib/store";
import { Avatar, Icon, LevelPill, Segments, useToast } from "../ui";
import { ScreenHead, type Go } from "../App";

type Filter = "passend" | "alle";
type When = "alle" | "heute" | "morgen";

export function PlayScreen({ go }: { go: Go }) {
  const { s, d } = useStore();
  const toast = useToast();
  const [filter, setFilter] = useState<Filter>("passend");
  const [when, setWhen] = useState<When>("alle");

  const fits = (r: [number, number]) => s.me.level >= r[0] - 0.5 && s.me.level <= r[1] + 0.5;
  const list = OPEN_MATCHES.filter((m) => (filter === "alle" || fits(m.level)) && (when === "alle" || (when === "heute" ? m.day === 0 : m.day === 1)));
  const mine = s.bookings.filter((b) => b.open && b.players.length < 4 && dayOffset(b.day) >= 0);

  const join = (id: string, court: number, time: string) => {
    d({ t: "join", id });
    toast(`Du bist dabei: Court ${court}, ${time}`);
  };

  return (
    <div className="scr">
      <ScreenHead kicker="Mitspielen" title={<>Offene<br />Matches</>} go={go} />

      <div className="filters">
        <Segments label="Level-Filter" value={filter} onChange={setFilter} options={[{ v: "passend", l: `Mein Level ${String(s.me.level).replace(".", ",")}` }, { v: "alle", l: "Alle Level" }]} />
        <Segments label="Zeitraum" value={when} onChange={setWhen} options={[{ v: "alle", l: "Diese Woche" }, { v: "heute", l: "Heute" }, { v: "morgen", l: "Morgen" }]} />
      </div>

      <div className="matches">
        {list.map((m) => {
          const joined = s.joined.includes(m.id);
          const slots = [...m.players, ...(joined ? ["me"] : [])];
          const left = 4 - slots.length;
          const ok = fits(m.level);
          return (
            <article className={`match${joined ? " joined" : ""}`} key={m.id}>
              <header>
                <div className="m-when">
                  <span>{dayLabel(m.day)}</span>
                  <b>{m.time}</b>
                  <small>bis {addMinutes(m.time, 90)}</small>
                </div>
                <div className="m-side">
                  <LevelPill range={m.level} />
                  <span className="m-court">Court {m.court}</span>
                </div>
              </header>
              <div className="m-teams" aria-label={`Spieler: ${slots.map((p) => (p === "me" ? "du" : player(p).name)).join(", ")}, ${left} frei`}>
                <div className="team">
                  <Avatar id={slots[0] ?? null} size={40} />
                  <Avatar id={slots[1] ?? null} size={40} />
                </div>
                <span className="vs" aria-hidden="true">vs</span>
                <div className="team">
                  <Avatar id={slots[2] ?? null} size={40} />
                  <Avatar id={slots[3] ?? null} size={40} />
                </div>
              </div>
              <footer>
                <p className="m-host">
                  Erstellt von <b>{player(m.host).name}</b>
                  {!ok && <span className="warn"> · über/unter deinem Level</span>}
                </p>
                {joined ? (
                  <button className="btn ghost small" onClick={() => { d({ t: "leave", id: m.id }); toast("Abgesagt"); }}>
                    Absagen
                  </button>
                ) : left > 0 ? (
                  <button className="btn small" onClick={() => join(m.id, m.court, m.time)}>
                    Mitspielen · {left} frei
                  </button>
                ) : (
                  <span className="muted small">Voll</span>
                )}
              </footer>
            </article>
          );
        })}
        {list.length === 0 && (
          <div className="empty-state">
            <p>Für diesen Filter ist gerade nichts offen.</p>
            <button className="btn" onClick={() => go("buchen")}>
              Eigenes Match erstellen
            </button>
          </div>
        )}
      </div>

      {mine.length > 0 && (
        <section className="block" aria-labelledby="mine-h">
          <h2 id="mine-h" className="sec-h">Deine offenen Matches</h2>
          {mine.map((b) => (
            <div className="row-card" key={b.id}>
              <div>
                <b>{dayLabel(dayOffset(b.day))}, {b.time}</b>
                <span>Court {b.court} · sucht noch {4 - b.players.length}</span>
              </div>
              <div className="av-row sm">
                {[0, 1, 2, 3].map((i) => (
                  <Avatar key={i} id={b.players[i] ?? null} size={24} />
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      <section className="card cta alt">
        <p className="kicker dark">Nichts dabei?</p>
        <p className="cta-t">Erstell dein eigenes Match. Wir zeigen es Spielern mit Level {levelName(s.me.level)}.</p>
        <button className="btn dark" onClick={() => go("buchen")}>
          Match erstellen <Icon name="arrow" size={18} />
        </button>
      </section>
    </div>
  );
}
