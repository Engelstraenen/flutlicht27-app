"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { StoreProvider, type Tab } from "@/lib/store";
import { Icon, ToastProvider } from "./ui";
import { StartScreen } from "./screens/Start";
import { BookScreen } from "./screens/Book";
import { PlayScreen } from "./screens/Play";
import { TourScreen } from "./screens/Tour";
import { BarScreen } from "./screens/Bar";
import { ProfileScreen } from "./screens/Profile";
import { asset } from "@/lib/asset";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "start", label: "Start", icon: "start" },
  { id: "buchen", label: "Buchen", icon: "buchen" },
  { id: "mitspielen", label: "Mitspielen", icon: "mitspielen" },
  { id: "turnier", label: "Turnier", icon: "turnier" },
  { id: "bar", label: "Bar", icon: "bar" },
];
const ALL: Tab[] = ["start", "buchen", "mitspielen", "turnier", "bar", "profil"];

export type Go = (t: Tab) => void;

export function App() {
  const [tab, setTab] = useState<Tab>("start");
  const [ready, setReady] = useState(false);
  const scroller = useRef<HTMLElement>(null);

  // Tab im Hash (#buchen), damit Zurück-Taste und Lesezeichen funktionieren
  useEffect(() => {
    const read = () => {
      const h = window.location.hash.slice(1) as Tab;
      setTab(ALL.includes(h) ? h : "start");
    };
    read();
    setReady(true);
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);

  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 });
  }, [tab]);

  // Offline-Speicher nur im echten Build
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register(asset("/sw.js")).catch(() => {});
  }, []);

  const go = useCallback<Go>((t) => {
    if (window.location.hash.slice(1) === t) return;
    window.location.hash = t;
  }, []);

  return (
    <StoreProvider>
      <ToastProvider>
        <div className="stage">
          <aside className="stage-copy" aria-hidden={false}>
            <p className="kicker">Demo-App</p>
            <h1 className="stage-title">
              Flutlicht
              <br />
              <span>27</span>
            </h1>
            <p className="stage-text">Live-Belegung, Court buchen, Mitspielen, Rangliste, Americano, Verleih und Bar an den Court. Auf dem Handy öffnen und zum Home-Bildschirm hinzufügen, dann läuft sie wie eine echte App.</p>
            <ul className="stage-list">
              <li>8 Courts live</li>
              <li>Buchen in drei Tipps</li>
              <li>Drinks an den Court</li>
            </ul>
          </aside>
          <div className="phone">
            <a className="skip" href="#main">
              Zum Inhalt
            </a>
            <main id="main" className="screen" ref={scroller} tabIndex={-1}>
              {ready && (
                <>
                  {tab === "start" && <StartScreen go={go} />}
                  {tab === "buchen" && <BookScreen go={go} />}
                  {tab === "mitspielen" && <PlayScreen go={go} />}
                  {tab === "turnier" && <TourScreen />}
                  {tab === "bar" && <BarScreen go={go} />}
                  {tab === "profil" && <ProfileScreen go={go} />}
                </>
              )}
              {!ready && <div className="boot" aria-label="App lädt" />}
            </main>
            <nav className="tabbar" aria-label="Hauptmenü">
              {TABS.map((t) => (
                <a key={t.id} href={`#${t.id}`} className={tab === t.id ? "on" : ""} aria-current={tab === t.id ? "page" : undefined}>
                  <Icon name={t.icon} size={23} />
                  <span>{t.label}</span>
                </a>
              ))}
            </nav>
          </div>
        </div>
      </ToastProvider>
    </StoreProvider>
  );
}

/* Gemeinsamer Kopf für alle Screens */
export function ScreenHead({ kicker, title, go, right, img }: { kicker: string; title: React.ReactNode; go?: Go; right?: React.ReactNode; img?: string }) {
  return (
    <header className={`shead${img ? " has-img" : ""}`}>
      {img && <img className="shead-img" src={asset(img)} alt="" aria-hidden="true" />}
      <div>
        <p className="kicker">{kicker}</p>
        <h1 className="stitle">{title}</h1>
      </div>
      {right ??
        (go && (
          <button className="me-btn" onClick={() => go("profil")} aria-label="Dein Profil">
            <span>Du</span>
          </button>
        ))}
    </header>
  );
}
