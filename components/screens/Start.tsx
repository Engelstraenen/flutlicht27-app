"use client";
import { useEffect, useMemo, useState } from "react";
import { LIVE, OPEN_MATCHES, TIMES, dayLabel, euro, levelName, player, type CourtLive } from "@/lib/data";
import { dayOffset, useStore } from "@/lib/store";
import { Avatar, CourtMini, Icon, LevelPill, Sheet, useToast } from "../ui";
import { ScreenHead, type Go } from "../App";

const greet = () => {
  const h = new Date().getHours();
  return h < 11 ? "Guten Morgen" : h < 17 ? "Hallo" : "Guten Abend";
};

// Nächste volle oder halbe Stunde als Zeit-Index (07:00 bis 22:00)
export const nextSlot = () => {
  const d = new Date();
  const m = d.getHours() * 60 + d.getMinutes();
  const i = Math.ceil((m - 7 * 60) / 30);
  return Math.max(0, Math.min(TIMES.length - 3, i));
};

export function StartScreen({ go }: { go: Go }) {
  const { s, d } = useStore();
  const toast = useToast();
  const [mins, setMins] = useState(0);
  const [sel, setSel] = useState<CourtLive | null>(null);

  // Live-Takt: jede Minute laufen die Restzeiten herunter
  useEffect(() => {
    const t = window.setInterval(() => setMins((m) => m + 1), 60000);
    return () => window.clearInterval(t);
  }, []);

  const courts = useMemo(
    () =>
      LIVE.map((c) => {
        if (c.state !== "spiel" || c.left === undefined) return c;
        const left = c.left - mins;
        return left > 0 ? { ...c, left } : { id: c.id, state: "frei" as const, players: [] };
      }),
    [mins],
  );
  const count = (st: CourtLive["state"]) => courts.filter((c) => c.state === st).length;

  const upcoming = s.bookings.filter((b) => dayOffset(b.day) >= 0)[0];
  const joined = OPEN_MATCHES.filter((m) => s.joined.includes(m.id));
  const fit = OPEN_MATCHES.filter((m) => !s.joined.includes(m.id) && s.me.level >= m.level[0] - 0.5 && s.me.level <= m.level[1] + 0.5).slice(0, 4);

  const bookCourt = (court: number) => {
    d({ t: "prefill", p: { court, day: 0, time: TIMES[nextSlot()] } });
    setSel(null);
    go("buchen");
  };
  const joinFromCourt = (court: number) => {
    const m = OPEN_MATCHES.find((x) => x.court === court && x.day === 0);
    if (!m) return;
    d({ t: "join", id: m.id });
    toast(`Dabei: Court ${court}, heute ${m.time}`);
    setSel(null);
  };

  return (
    <div className="scr">
      <ScreenHead img="/img/hall-1280.jpg" kicker={`${greet()}, ${s.me.name}`} title={<>Heute in<br />der Halle</>} go={go} />

      <section className="live" aria-labelledby="live-h">
        <div className="live-top">
          <h2 id="live-h" className="sec-h">
            <span className="pulse" aria-hidden="true" /> Live-Belegung
          </h2>
          <p className="live-sum">
            <b>{count("frei")}</b> frei · <b>{count("sucht")}</b> suchen · <b>{count("spiel")}</b> im Spiel
          </p>
        </div>
        <div className="hall" role="list">
          {courts.map((c) => {
            const label =
              c.state === "frei" ? `Court ${c.id}: frei` : c.state === "sucht" ? `Court ${c.id}: sucht ${4 - c.players.length} Spieler, Level ${c.level}` : `Court ${c.id}: im Spiel bis ${c.until}, noch ${c.left} Minuten`;
            return (
              <button key={c.id} role="listitem" className={`hall-c st-${c.state}`} onClick={() => setSel(c)} aria-label={label}>
                <CourtMini state={c.state} players={c.players} label="" progress={c.state === "spiel" && c.left ? 1 - c.left / 90 : undefined} />
                <span className="hc-no">{c.id}</span>
                <span className="hc-st">{c.state === "frei" ? "Frei" : c.state === "sucht" ? `+${4 - c.players.length}` : `${c.left}′`}</span>
              </button>
            );
          })}
        </div>
        <div className="legend" aria-hidden="true">
          <span><i className="lg frei" /> frei</span>
          <span><i className="lg sucht" /> sucht Spieler</span>
          <span><i className="lg spiel" /> im Spiel</span>
        </div>
      </section>

      {upcoming ? (
        <section className="card next" aria-label="Deine nächste Buchung">
          <p className="kicker dark">Dein nächstes Match</p>
          <p className="next-when">
            {dayLabel(dayOffset(upcoming.day))}, {upcoming.time}
          </p>
          <p className="next-meta">
            Court {upcoming.court} · {upcoming.minutes} Min · {euro(upcoming.price)}
          </p>
          <div className="av-row">
            {[0, 1, 2, 3].map((i) => (
              <Avatar key={i} id={upcoming.players[i] ?? null} size={32} />
            ))}
          </div>
          <button className="btn dark small" onClick={() => go("bar")}>
            Schläger & Drinks dazu <Icon name="arrow" size={16} />
          </button>
        </section>
      ) : (
        <section className="card cta" aria-label="Court buchen">
          <p className="kicker dark">Noch nichts geplant</p>
          <p className="cta-t">Court ab {TIMES[nextSlot()]} frei.</p>
          <button className="btn dark" onClick={() => go("buchen")}>
            Court buchen <Icon name="arrow" size={18} />
          </button>
        </section>
      )}

      {joined.length > 0 && (
        <section className="block" aria-labelledby="joined-h">
          <h2 id="joined-h" className="sec-h">Du spielst mit</h2>
          {joined.map((m) => (
            <div className="row-card" key={m.id}>
              <div>
                <b>{dayLabel(m.day)}, {m.time}</b>
                <span>Court {m.court} · bei {player(m.host).name}</span>
              </div>
              <LevelPill range={m.level} />
            </div>
          ))}
        </section>
      )}

      <section className="block" aria-labelledby="fit-h">
        <div className="sec-row">
          <h2 id="fit-h" className="sec-h">Passt zu deinem Level</h2>
          <button className="link" onClick={() => go("mitspielen")}>
            Alle
          </button>
        </div>
        <div className="hscroll">
          {fit.map((m) => (
            <article className="mini-match" key={m.id}>
              <p className="mm-when">{dayLabel(m.day)}</p>
              <p className="mm-time">{m.time}</p>
              <p className="mm-meta">Court {m.court}</p>
              <div className="av-row sm">
                {[0, 1, 2, 3].map((i) => (
                  <Avatar key={i} id={m.players[i] ?? null} size={24} />
                ))}
              </div>
              <LevelPill range={m.level} />
            </article>
          ))}
          {fit.length === 0 && <p className="muted">Gerade nichts offen. Erstell selbst ein Match unter „Buchen“.</p>}
        </div>
      </section>

      <section className="tiles" aria-label="Schnellzugriff">
        <button className="tile t-bar" onClick={() => go("bar")}>
          <Icon name="bar" size={26} />
          <b>Bar</b>
          <span>Drinks an den Court</span>
        </button>
        <button className="tile t-rent" onClick={() => go("bar")}>
          <Icon name="racket" size={26} />
          <b>Verleih</b>
          <span>Schläger reservieren</span>
        </button>
        <button className="tile t-tour" onClick={() => go("turnier")}>
          <Icon name="turnier" size={26} />
          <b>Americano</b>
          <span>Turnier in 1 Minute</span>
        </button>
        <button className="tile t-me" onClick={() => go("profil")}>
          <Icon name="profil" size={26} />
          <b>Level {String(s.me.level).replace(".", ",")}</b>
          <span>{levelName(s.me.level)}</span>
        </button>
      </section>

      <Sheet open={!!sel} onClose={() => setSel(null)} title={sel ? `Court ${sel.id}` : ""}>
        {sel && (
          <div className="court-sheet">
            <div className="cs-art">
              <CourtMini state={sel.state} players={sel.players} label={`Court ${sel.id}`} />
            </div>
            <div className="cs-info">
              {sel.state === "spiel" && (
                <>
                  <p className="cs-big">Im Spiel</p>
                  <p className="muted">
                    Bis {sel.until} · noch {sel.left} Min
                  </p>
                  <div className="cs-names">
                    {sel.players.map((p) => (
                      <span key={p}>
                        <Avatar id={p} size={26} /> {player(p).name}
                      </span>
                    ))}
                  </div>
                  <button className="btn ghost" onClick={() => bookCourt(sel.id)}>
                    Danach buchen
                  </button>
                </>
              )}
              {sel.state === "sucht" && (
                <>
                  <p className="cs-big">Sucht {4 - sel.players.length}</p>
                  <p className="muted">
                    Level {sel.level} · {levelName(sel.level ?? 3)} · bis {sel.until}
                  </p>
                  <div className="cs-names">
                    {sel.players.map((p) => (
                      <span key={p}>
                        <Avatar id={p} size={26} /> {player(p).name}
                      </span>
                    ))}
                  </div>
                  {OPEN_MATCHES.some((m) => m.court === sel.id && m.day === 0 && s.joined.includes(m.id)) ? (
                    <p className="ok-line">
                      <Icon name="check" size={18} /> Du bist dabei
                    </p>
                  ) : (
                    <button className="btn" onClick={() => joinFromCourt(sel.id)}>
                      Mitspielen
                    </button>
                  )}
                </>
              )}
              {sel.state === "frei" && (
                <>
                  <p className="cs-big">Frei</p>
                  <p className="muted">Ab {TIMES[nextSlot()]} buchbar</p>
                  <button className="btn" onClick={() => bookCourt(sel.id)}>
                    Jetzt buchen
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}
