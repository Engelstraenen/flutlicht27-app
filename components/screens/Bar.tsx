"use client";
import { useEffect, useState } from "react";
import { DRINKS, RACKETS, dayLabel, euro, type Racket } from "@/lib/data";
import { dayOffset, uid, useStore, type Order } from "@/lib/store";
import { RacketArt } from "../RacketArt";
import { Icon, Segments, Sheet, useToast } from "../ui";
import { ScreenHead, type Go } from "../App";

type View = "bar" | "verleih";
const STEPS = ["Bestellt", "Wird gemacht", "Unterwegs", "Am Court"];
const STEP_MS = 25000;

export function BarScreen({ go }: { go: Go }) {
  const [view, setView] = useState<View>("bar");
  return (
    <div className="scr">
      <ScreenHead img="/img/bar-1280.jpg" kicker="Bar & Verleih" title={view === "bar" ? <>Direkt an<br />den Court</> : <>Schläger<br />leihen</>} go={go} />
      <Segments label="Bereich" value={view} onChange={setView} options={[{ v: "bar", l: "Bar" }, { v: "verleih", l: "Verleih" }]} />
      {view === "bar" ? <BarView /> : <RentView />}
    </div>
  );
}

function OrderTracker({ o }: { o: Order }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);
  const step = Math.min(3, Math.floor((now - o.at) / STEP_MS));
  return (
    <div className="tracker" aria-live="polite">
      <p className="kicker dark">Bestellung an Court {o.court}</p>
      <p className="tr-now">{STEPS[step]}</p>
      <ol className="tr-steps">
        {STEPS.map((st, i) => (
          <li key={st} className={i <= step ? "on" : ""}>
            <i />
            <span>{st}</span>
          </li>
        ))}
      </ol>
      <p className="small">
        {o.lines.map((l) => `${l.qty}× ${DRINKS.find((d) => d.id === l.id)!.name}`).join(" · ")}
      </p>
    </div>
  );
}

function BarView() {
  const { s, d } = useStore();
  const toast = useToast();
  const [cart, setCart] = useState<Record<string, number>>({});
  const todays = s.bookings.find((b) => dayOffset(b.day) === 0);
  const [court, setCourt] = useState<number>(todays?.court ?? 3);
  const [, force] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => force((x) => x + 1), 5000);
    return () => window.clearInterval(t);
  }, []);

  const add = (id: string, n: number) => setCart((c) => {
    const q = Math.max(0, Math.min(9, (c[id] ?? 0) + n));
    const next = { ...c, [id]: q };
    if (!q) delete next[id];
    return next;
  });
  const lines = Object.entries(cart).map(([id, qty]) => ({ id, qty }));
  const total = lines.reduce((sum, l) => sum + DRINKS.find((x) => x.id === l.id)!.euro * l.qty, 0);
  const active = s.orders.find((o) => Date.now() - o.at < STEP_MS * 5);

  const order = () => {
    d({ t: "order", o: { id: uid(), lines, court, total, at: Date.now() } });
    setCart({});
    toast(`Bestellt, kommt an Court ${court}`);
  };

  return (
    <>
      {active && <OrderTracker o={active} />}
      {(["Soft", "Cocktail", "Snack"] as const).map((cat) => (
        <section className="block" key={cat} aria-labelledby={`cat-${cat}`}>
          <h2 id={`cat-${cat}`} className="sec-h">{cat === "Soft" ? "Erfrischung" : cat === "Cocktail" ? "Nach dem Match" : "Snacks"}</h2>
          <ul className="menu">
            {DRINKS.filter((x) => x.cat === cat).map((x) => {
              const q = cart[x.id] ?? 0;
              return (
                <li key={x.id} className={q ? "has" : ""}>
                  <div>
                    <b>{x.name}</b>
                    <span>{x.note}</span>
                  </div>
                  <span className="price">{euro(x.euro)}</span>
                  <div className="stepper sm">
                    {q > 0 && (
                      <>
                        <button onClick={() => add(x.id, -1)} aria-label={`${x.name} weniger`}>
                          <Icon name="minus" size={14} />
                        </button>
                        <b aria-label={`${q} im Warenkorb`}>{q}</b>
                      </>
                    )}
                    <button className="add" onClick={() => add(x.id, 1)} aria-label={`${x.name} hinzufügen`}>
                      <Icon name="plus" size={14} />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
      <p className="hint">Cocktails ab 18. Wir bringen alles in der nächsten Spielpause an den Court.</p>
      {lines.length > 0 && (
        <div className="book-bar">
          <label className="court-select">
            <span>An Court</span>
            <select value={court} onChange={(e) => setCourt(Number(e.target.value))}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <button className="btn" onClick={order}>
            Bestellen · {euro(total)}
          </button>
        </div>
      )}
    </>
  );
}

function RentView() {
  const { s, d } = useStore();
  const toast = useToast();
  const [pick, setPick] = useState<Racket | null>(null);
  const upcoming = s.bookings.filter((b) => dayOffset(b.day) >= 0);
  const fitId = s.me.level < 2.5 ? "r1" : s.me.level < 3.5 ? "r2" : s.me.level < 4.5 ? "r3" : s.me.level < 5.5 ? "r5" : "r6";

  const reserve = (label: string) => {
    if (!pick) return;
    d({ t: "rent", r: { id: uid(), racket: pick.id, label, at: Date.now() } });
    toast(`${pick.name} reserviert`);
    setPick(null);
  };

  return (
    <>
      <div className="rackets" role="list">
        {RACKETS.map((r) => (
          <article className={`racket${r.id === fitId ? " fit" : ""}`} key={r.id} role="listitem">
            {r.id === fitId && <span className="fit-tag">Passt zu dir</span>}
            <RacketArt racket={r} className="r-art" />
            <div className="r-info">
              <p className="r-shape">{r.shape === "rund" ? "Rund · Kontrolle" : r.shape === "tropfen" ? "Tropfen · Allround" : "Diamant · Power"}</p>
              <h3>{r.name}</h3>
              <p className="r-feel">{r.feel}</p>
              <p className="r-lv">{r.level}</p>
              <div className="r-foot">
                <span className="price">{r.price}<small> / Match</small></span>
                <button className="btn small" onClick={() => setPick(r)} aria-label={`${r.name} reservieren`}>
                  Leihen
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {s.rentals.length > 0 && (
        <section className="block" aria-labelledby="rent-h">
          <h2 id="rent-h" className="sec-h">Deine Reservierungen</h2>
          {s.rentals.map((r) => (
            <div className="row-card" key={r.id}>
              <div>
                <b>{RACKETS.find((x) => x.id === r.racket)!.name}</b>
                <span>{r.label}</span>
              </div>
              <button className="icon-btn" onClick={() => d({ t: "unrent", id: r.id })} aria-label="Reservierung löschen">
                <Icon name="trash" size={18} />
              </button>
            </div>
          ))}
        </section>
      )}

      <Sheet open={!!pick} onClose={() => setPick(null)} title={pick ? pick.name : ""}>
        {pick && (
          <div className="pick-sheet">
            <p className="muted">Für welches Match? Der Schläger liegt an der Theke bereit.</p>
            {upcoming.map((b) => (
              <button key={b.id} className="opt" onClick={() => reserve(`${dayLabel(dayOffset(b.day))}, ${b.time} · Court ${b.court}`)}>
                <span>
                  <b>{dayLabel(dayOffset(b.day))}, {b.time}</b>
                  <small>Court {b.court}</small>
                </span>
                <Icon name="arrow" size={18} />
              </button>
            ))}
            <button className="opt" onClick={() => reserve("Heute, an der Theke abholen")}>
              <span>
                <b>Heute</b>
                <small>Ohne Buchung, an der Theke abholen</small>
              </span>
              <Icon name="arrow" size={18} />
            </button>
          </div>
        )}
      </Sheet>
    </>
  );
}
