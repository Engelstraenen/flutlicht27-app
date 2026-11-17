"use client";
import { useEffect, useState } from "react";
import { DRINKS, dayLabel, euro, levelName, LEVELS } from "@/lib/data";
import { dayOffset, useStore } from "@/lib/store";
import { Avatar, Icon, useToast } from "../ui";
import { ScreenHead, type Go } from "../App";

const HISTORY = [2.5, 2.5, 3, 3, 3, 3.5, 3, 3.5, 3.5, 3.5, 4, 3.5];
const FORM = ["S", "S", "N", "S", "S", "N", "S", "N", "S", "S"];

type BIP = Event & { prompt: () => Promise<void> };

export function ProfileScreen({ go }: { go: Go }) {
  const { s, d } = useStore();
  const toast = useToast();
  const [bip, setBip] = useState<BIP | null>(null);
  const [standalone, setStandalone] = useState(false);

  useEffect(() => {
    setStandalone(window.matchMedia("(display-mode: standalone)").matches);
    const h = (e: Event) => {
      e.preventDefault();
      setBip(e as BIP);
    };
    window.addEventListener("beforeinstallprompt", h);
    return () => window.removeEventListener("beforeinstallprompt", h);
  }, []);

  const lv = s.me.level;
  const setLevel = (v: number) => d({ t: "load", s: { ...s, me: { ...s.me, level: Math.max(1, Math.min(7, v)) } } });
  const upcoming = s.bookings.filter((b) => dayOffset(b.day) >= 0);

  // Sparkline Level-Verlauf
  const W = 300, H = 70;
  const pts = HISTORY.map((v, i) => [(i / (HISTORY.length - 1)) * W, H - ((v - 2) / 2.5) * H] as const);
  const line = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");

  return (
    <div className="scr">
      <ScreenHead kicker="Profil" title={<>{s.me.name}</>} right={<button className="icon-btn" onClick={() => go("start")} aria-label="Zurück zum Start"><Icon name="close" /></button>} />

      <section className="card level-card" aria-label="Dein Level">
        <div className="lc-top">
          <Avatar id="me" size={56} />
          <div>
            <p className="lc-num">
              {String(lv).replace(".", ",")}
              <small>/7</small>
            </p>
            <p className="lc-name">{levelName(lv)}</p>
          </div>
          <div className="stepper">
            <button onClick={() => setLevel(lv - 0.5)} aria-label="Level senken">
              <Icon name="minus" size={16} />
            </button>
            <button onClick={() => setLevel(lv + 0.5)} aria-label="Level erhöhen">
              <Icon name="plus" size={16} />
            </button>
          </div>
        </div>
        <div className="lv-scale" aria-hidden="true">
          {LEVELS.map((l, i) => (
            <i key={l} className={i + 1 <= lv ? "on" : i + 0.5 < lv ? "half" : ""} />
          ))}
        </div>
        <p className="small">Dein Level bestimmt, welche offenen Matches dir angezeigt werden.</p>
      </section>

      <section className="stats" aria-label="Statistik">
        <div><b>42</b><span>Matches</span></div>
        <div><b>61 %</b><span>Siege</span></div>
        <div><b>63 h</b><span>auf dem Court</span></div>
        <div><b>3</b><span>Siege in Folge</span></div>
      </section>

      <section className="block" aria-labelledby="form-h">
        <h2 id="form-h" className="sec-h">Letzte 10 Matches</h2>
        <div className="form-row" aria-label={`Bilanz: ${FORM.filter((f) => f === "S").length} Siege, ${FORM.filter((f) => f === "N").length} Niederlagen`}>
          {FORM.map((f, i) => (
            <span key={i} className={f === "S" ? "w" : "l"}>{f}</span>
          ))}
        </div>
        <h2 className="sec-h">Level-Verlauf · 12 Monate</h2>
        <svg className="spark" viewBox={`-4 -6 ${W + 8} ${H + 12}`} role="img" aria-label="Level-Verlauf von 2,5 auf 3,5">
          <path d={`${line} L${W} ${H} L0 ${H} Z`} className="spark-fill" />
          <path d={line} className="spark-line" />
          <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="5" className="spark-dot" />
        </svg>
      </section>

      <section className="block" aria-labelledby="bk-h">
        <h2 id="bk-h" className="sec-h">Deine Buchungen</h2>
        {upcoming.length === 0 && (
          <div className="empty-state">
            <p>Keine anstehenden Buchungen.</p>
            <button className="btn small" onClick={() => go("buchen")}>Court buchen</button>
          </div>
        )}
        {upcoming.map((b) => (
          <div className="row-card" key={b.id}>
            <div>
              <b>{dayLabel(dayOffset(b.day))}, {b.time}</b>
              <span>Court {b.court} · {b.minutes} Min · {euro(b.price)}</span>
            </div>
            <button className="icon-btn" onClick={() => { d({ t: "cancel", id: b.id }); toast("Buchung storniert"); }} aria-label={`Buchung ${b.time} stornieren`}>
              <Icon name="trash" size={18} />
            </button>
          </div>
        ))}
      </section>

      {s.orders.length > 0 && (
        <section className="block" aria-labelledby="or-h">
          <h2 id="or-h" className="sec-h">Letzte Bestellungen</h2>
          {s.orders.slice(0, 4).map((o) => (
            <div className="row-card" key={o.id}>
              <div>
                <b>{euro(o.total)} · Court {o.court}</b>
                <span>{o.lines.map((l) => `${l.qty}× ${DRINKS.find((x) => x.id === l.id)!.name}`).join(", ")}</span>
              </div>
            </div>
          ))}
        </section>
      )}

      {!standalone && (
        <section className="card install" aria-labelledby="in-h">
          <h2 id="in-h" className="sec-h">Als App installieren</h2>
          {bip ? (
            <button className="btn" onClick={() => bip.prompt().then(() => setBip(null))}>
              <Icon name="install" size={18} /> Installieren
            </button>
          ) : (
            <p className="small">
              iPhone: unten auf <b>Teilen</b>, dann <b>Zum Home-Bildschirm</b>. Android: Menü oben rechts, dann <b>App installieren</b>.
            </p>
          )}
        </section>
      )}

      <button className="link danger" onClick={() => { d({ t: "reset" }); toast("Demo zurückgesetzt"); }}>
        Demo-Daten zurücksetzen
      </button>
      <p className="hint">Demo der Padelhalle FLUTLICHT 27. Namen, Preise und Zeiten sind Platzhalter, es wird nichts gebucht oder bezahlt.</p>
    </div>
  );
}
