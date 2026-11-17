"use client";
import { useEffect, useMemo, useState } from "react";
import { DURATIONS, PLAYERS, TIMES, addMinutes, dayDate, dayLabel, euro, freeCourts, isPrime, levelName, price, DAY_NAMES } from "@/lib/data";
import { isoDay, uid, useStore } from "@/lib/store";
import { Avatar, CourtMini, Icon, Segments, Sheet, useToast } from "../ui";
import { ScreenHead, type Go } from "../App";
import { nextSlot } from "./Start";

const DAYS = Array.from({ length: 14 }, (_, i) => i);

export function BookScreen({ go }: { go: Go }) {
  const { s, d } = useStore();
  const toast = useToast();
  const pre = s.prefill;
  const [day, setDay] = useState(pre?.day ?? 0);
  const [minutes, setMinutes] = useState<number>(90);
  const [ti, setTi] = useState(() => (pre?.time ? Math.max(0, TIMES.indexOf(pre.time)) : -1));
  const [court, setCourt] = useState<number | null>(pre?.court ?? null);
  const [mates, setMates] = useState<string[]>([]);
  const [open, setOpen] = useState(true);
  const [done, setDone] = useState<null | { court: number; when: string }>(null);
  // Vom Start-Screen gewählter freier Court bleibt zur gewählten Zeit buchbar
  const [held] = useState(() => (pre?.court && pre.time ? { court: pre.court, day: pre.day ?? 0, ti: TIMES.indexOf(pre.time) } : null));

  useEffect(() => {
    if (pre) d({ t: "prefill", p: null });
  }, [pre, d]);

  const firstToday = nextSlot();
  const freeAt = (i: number) => {
    const f = freeCourts(day, i, minutes);
    return held && held.day === day && held.ti === i && !f.includes(held.court) ? [...f, held.court].sort((a, b) => a - b) : f;
  };
  const slotOk = (i: number) => (day > 0 || i >= firstToday) && freeAt(i).length > 0;
  const free = ti >= 0 ? freeAt(ti) : [];

  // Ungültige Auswahl nach Tag-/Dauerwechsel zurücksetzen
  useEffect(() => {
    if (ti >= 0 && !slotOk(ti)) setTi(-1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day, minutes]);
  useEffect(() => {
    if (court !== null && ti >= 0 && !free.includes(court)) setCourt(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ti, day, minutes]);

  const total = ti >= 0 ? price(TIMES[ti], minutes) : 0;
  const ready = ti >= 0 && court !== null && free.includes(court);
  const suggestions = useMemo(() => [...PLAYERS].sort((a, b) => Math.abs(a.level - s.me.level) - Math.abs(b.level - s.me.level)), [s.me.level]);

  const toggleMate = (id: string) => setMates((m) => (m.includes(id) ? m.filter((x) => x !== id) : m.length >= 3 ? m : [...m, id]));

  const book = () => {
    if (!ready || court === null) return;
    d({
      t: "book",
      b: { id: uid(), day: isoDay(day), time: TIMES[ti], minutes, court, players: ["me", ...mates], price: total, open: open && mates.length < 3 },
    });
    toast(`Court ${court} gebucht`);
    setDone({ court, when: `${dayLabel(day)}, ${TIMES[ti]}–${addMinutes(TIMES[ti], minutes)}` });
  };

  const reset = () => {
    setDone(null);
    setTi(-1);
    setCourt(null);
    setMates([]);
  };

  return (
    <div className="scr book">
      <ScreenHead img="/img/court-top-1280.jpg" kicker="Court buchen" title={<>Wann<br />spielst du?</>} go={go} />

      <section className="block" aria-labelledby="b-day">
        <h2 id="b-day" className="step-h"><i>1</i> Tag</h2>
        <div className="hscroll days" role="listbox" aria-label="Tag wählen">
          {DAYS.map((o) => {
            const dt = dayDate(o);
            return (
              <button key={o} role="option" aria-selected={day === o} className={`day${day === o ? " on" : ""}`} onClick={() => setDay(o)}>
                <span>{o === 0 ? "Heute" : o === 1 ? "Morgen" : DAY_NAMES[dt.getDay()]}</span>
                <b>{dt.getDate()}</b>
              </button>
            );
          })}
        </div>
      </section>

      <section className="block" aria-labelledby="b-dur">
        <h2 id="b-dur" className="step-h"><i>2</i> Dauer</h2>
        <Segments label="Dauer" value={String(minutes)} options={DURATIONS.map((m) => ({ v: String(m), l: `${m} Min` }))} onChange={(v) => setMinutes(Number(v))} />
      </section>

      <section className="block" aria-labelledby="b-time">
        <h2 id="b-time" className="step-h"><i>3</i> Uhrzeit</h2>
        <div className="times" role="listbox" aria-label="Uhrzeit wählen">
          {TIMES.slice(0, TIMES.length - minutes / 30 + 1).map((t, i) => {
            const ok = slotOk(i);
            return (
              <button key={t} role="option" aria-selected={ti === i} disabled={!ok} className={`time${ti === i ? " on" : ""}${isPrime(t) ? " prime" : ""}`} onClick={() => setTi(i)}>
                {t}
              </button>
            );
          })}
        </div>
        <p className="hint"><i className="prime-dot" aria-hidden="true" /> Flutlicht-Zeit 17–22 Uhr: 32 € pro Stunde, sonst 24 €.</p>
      </section>

      <section className="block" aria-labelledby="b-court">
        <h2 id="b-court" className="step-h"><i>4</i> Court</h2>
        {ti < 0 ? (
          <p className="muted">Wähl erst eine Uhrzeit, dann siehst du, welche Courts frei sind.</p>
        ) : (
          <div className="hall pick" role="listbox" aria-label="Court wählen">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((c) => {
              const ok = free.includes(c);
              return (
                <button key={c} role="option" aria-selected={court === c} disabled={!ok} className={`hall-c${court === c ? " chosen" : ""}${ok ? "" : " taken"}`} onClick={() => setCourt(c)} aria-label={`Court ${c}${ok ? "" : ", belegt"}`}>
                  <CourtMini state={court === c ? "mine" : ok ? "frei" : "spiel"} players={court === c ? ["me", ...mates] : []} label="" />
                  <span className="hc-no">{c}</span>
                  <span className="hc-st">{ok ? (court === c ? "Deiner" : "Frei") : "Belegt"}</span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <section className="block" aria-labelledby="b-mates">
        <h2 id="b-mates" className="step-h"><i>5</i> Mitspieler einladen</h2>
        <div className="mates-slots" aria-live="polite">
          <Avatar id="me" size={44} />
          {[0, 1, 2].map((i) => (
            <Avatar key={i} id={mates[i] ?? null} size={44} />
          ))}
          <span className="muted small">{3 - mates.length === 0 ? "Doppel komplett" : `noch ${3 - mates.length} frei`}</span>
        </div>
        <div className="mate-list">
          {suggestions.slice(0, 10).map((p) => {
            const on = mates.includes(p.id);
            return (
              <button key={p.id} className={`mate${on ? " on" : ""}`} aria-pressed={on} onClick={() => toggleMate(p.id)}>
                <Avatar id={p.id} size={30} />
                <span>
                  <b>{p.name}</b>
                  <small>Lv {String(p.level).replace(".", ",")} · {levelName(p.level)}</small>
                </span>
                <i aria-hidden="true">{on ? <Icon name="check" size={16} stroke={3} /> : <Icon name="plus" size={16} />}</i>
              </button>
            );
          })}
        </div>
        <label className="switch">
          <input type="checkbox" checked={open} onChange={(e) => setOpen(e.target.checked)} disabled={mates.length >= 3} />
          <span className="sw" aria-hidden="true" />
          Freie Plätze als offenes Match zeigen
        </label>
      </section>

      <div className="book-bar">
        <div>
          <b>{ready ? `Court ${court} · ${dayLabel(day)} ${TIMES[ti]}` : "Noch nicht vollständig"}</b>
          <span>{ti >= 0 ? `${minutes} Min · ${euro(total)} · ${euro(total / 4)} p. P.` : "Tag, Uhrzeit und Court wählen"}</span>
        </div>
        <button className="btn" disabled={!ready} onClick={book}>
          Buchen
        </button>
      </div>

      <Sheet open={!!done} onClose={reset} title="Gebucht">
        {done && (
          <div className="done">
            <div className="done-badge" aria-hidden="true">
              <Icon name="check" size={40} stroke={3} />
            </div>
            <p className="done-t">Court {done.court}</p>
            <p className="muted">{done.when}</p>
            <p className="small muted">{mates.length ? `Einladung an ${mates.length} Mitspieler verschickt (Demo).` : open ? "Dein Match ist jetzt für passende Spieler sichtbar." : ""}</p>
            <div className="done-actions">
              <button className="btn" onClick={() => { reset(); go("bar"); }}>
                Schläger & Drinks dazu
              </button>
              <button className="btn ghost" onClick={() => { reset(); go("start"); }}>
                Zur Übersicht
              </button>
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}
