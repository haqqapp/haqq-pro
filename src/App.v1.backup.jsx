
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { supabase, supabaseConfigured } from "./supabase.js";

/* ---------------------------------------------------------------- Konstanten */
const KEY = "firtinaspor3-v1";
const POS = ["TW", "IV", "LV", "RV", "DM", "ZM", "OM", "LM", "RM", "MS"];
const POS_LANG = {
  TW: "Torwart", IV: "Innenverteidiger", LV: "Linksverteidiger", RV: "Rechtsverteidiger",
  DM: "Sechser", ZM: "Zentrales Mittelfeld", OM: "Zehner", LM: "Linkes Mittelfeld",
  RM: "Rechtes Mittelfeld", MS: "Mittelstürmer",
};
const FORMATIONEN = {
  "4-2-3-1": [
    { p: "TW", r: "Torwart" }, { p: "RV", r: "Rechtsverteidiger" },
    { p: "IV", r: "Innenverteidiger rechts" }, { p: "IV", r: "Innenverteidiger links" },
    { p: "LV", r: "Linksverteidiger" }, { p: "DM", r: "Sechser rechts" },
    { p: "DM", r: "Sechser links" }, { p: "RM", r: "Rechtsaußen" },
    { p: "OM", r: "Zehner" }, { p: "LM", r: "Linksaußen" }, { p: "MS", r: "Mittelstürmer" },
  ],
  "4-1-4-1": [
    { p: "TW", r: "Torwart" }, { p: "RV", r: "Rechtsverteidiger" },
    { p: "IV", r: "Innenverteidiger rechts" }, { p: "IV", r: "Innenverteidiger links" },
    { p: "LV", r: "Linksverteidiger" }, { p: "DM", r: "Sechser" },
    { p: "RM", r: "Rechtes Mittelfeld" }, { p: "ZM", r: "Zentrum rechts" },
    { p: "ZM", r: "Zentrum links" }, { p: "LM", r: "Linkes Mittelfeld" },
    { p: "MS", r: "Mittelstürmer" },
  ],
};
// Reihen des Spielfelds: [slotIndex, ...] von der Abwehr nach vorne
const REIHEN = {
  "4-2-3-1": [[10], [9, 8, 7], [6, 5], [4, 3, 2, 1], [0]],
  "4-1-4-1": [[10], [9, 8, 7, 6], [5], [4, 3, 2, 1], [0]],
};

/* ---------------------------------------------------------------- Startdaten */
const T_DATEN = {
  Ahmad: [14, 15], Ayhan: [1, 3, 5, 6, 7, 9, 10, 14, 15], Burak: [],
  Cemil: [1, 2, 3, 4, 5, 6, 7, 8, 9, 12, 13, 14], Dawin: [1, 2, 4, 6, 7, 8, 9, 10, 12],
  Emre: [1, 3, 12, 13, 14], Ercan: [1, 8, 9, 11], Fabian: [1, 2, 4, 6, 10, 12],
  Fatih: [1, 10, 11], Gökhan: [1], Göktan: [2, 4, 10, 12], Konate: [],
  Marcel: [1, 9], Max: [4, 6, 8, 9, 10, 11, 12], Mevlüt: [15], Muharrem: [9],
  Nesat: [], Okan: [4, 5, 8, 9, 10, 11, 12, 13, 14, 15], Ridvan: [1, 2], Sait: [7, 10],
  Selçuk: [1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14, 15],
  Serdar: [1, 2, 6, 7, 8, 9, 10, 11, 12, 13, 14], Stephan: [],
  Timur: [1, 5, 10, 11, 14], Tobias: [1, 7, 8, 9, 10, 12, 15],
  Tolga: [1, 2, 3, 4, 6, 7, 12, 13, 14, 15], Tugay: [1, 2], Yassin: [14, 15],
};
const T_TERMINE = ["2026-07-07","2026-07-09","2026-07-14","2026-07-21","2026-07-23",
  "2026-08-04","2026-08-11","2026-08-18","2026-08-20","2026-08-25","2026-08-27",
  "2026-09-01","2026-09-03","2026-09-08","2026-09-10","2026-09-15"];

const N_DATEN = {
  Ayhan: { 1: 7.5, 2: 8, 3: 8, 4: 6, 5: 8.25 }, Burak: { 6: 7.5 },
  Cemil: { 1: 6.5, 2: 7.25, 3: 8, 4: 8, 5: 8, 7: 6.5 },
  Dawin: { 1: 7.5, 2: 7.25, 3: 8.5, 4: 8, 5: 7.5, 6: 8 },
  Emre: { 1: 7, 2: 6, 6: 7, 7: 7 }, Ercan: { 1: 7.5, 2: 6.25, 5: 7.75, 6: 8, 7: 9 },
  Fabian: { 1: 4, 2: 5.5, 4: 5, 5: 4.5 }, Fatih: { 6: 9, 7: 8 }, Gökhan: { 4: 6 },
  Göktan: { 1: 7, 2: 6.25, 3: 6, 5: 6.75, 6: 8 }, Konate: { 1: 7, 2: 7.75, 3: 8, 4: 8.5 },
  Marcel: { 3: 8, 4: 6, 5: 8, 6: 8, 7: 8 }, Max: { 1: 6.5, 2: 7.25, 3: 7.5, 4: 6, 5: 7.25, 6: 7.5 },
  Okan: { 3: 6.5, 6: 6.5, 7: 6 }, Ridvan: { 1: 8, 2: 6, 7: 7.5 }, Sait: { 2: 8.5, 5: 8, 6: 9 },
  Selçuk: { 2: 7.25, 5: 7.5, 6: 8.5, 7: 7.5 }, Serdar: { 3: 7.5, 4: 8.5, 5: 7.75, 6: 9, 7: 8 },
  Stephan: { 5: 9, 6: 10, 7: 8 }, Timur: { 1: 6, 2: 6.5, 3: 7, 4: 6, 6: 7, 7: 6 },
  Tobias: { 4: 6.5, 5: 6, 6: 8, 7: 8 }, Tolga: { 1: 7.5, 2: 7.25, 4: 7.5, 6: 7, 7: 7 },
  Tugay: { 1: 7.5, 5: 8, 7: 8 },
};

const KADER_START = [
  ["Ahmad", "TW", 0, false], ["Ayhan", "TW", 0, true], ["Burak", "ZM", 0, false],
  ["Cemil", "LV", 0, false], ["Dawin", "RV", 0, true], ["Emre", "IV", 0, true],
  ["Ercan", "MS", 0, true], ["Fabian", "RM", 0, false], ["Fatih", "LV", 0, true],
  ["Gökhan", "MS", 0, false], ["Göktan", "IV", 0, true], ["Konate", "LM", 5, false],
  ["Marcel", "LV", 0, true], ["Max", "ZM", 0, true], ["Mevlüt", "DM", 8, false],
  ["Muharrem", "IV", 0, false], ["Nesat", "TW", 0, false], ["Okan", "RM", 0, true],
  ["Ridvan", "IV", 0, true], ["Sait", "DM", 0, true], ["Selçuk", "OM", 0, true],
  ["Serdar", "ZM", 0, true], ["Stephan", "LM", 0, true], ["Timur", "DM", 0, true],
  ["Tobias", "RV", 0, true], ["Tolga", "ZM", 0, true], ["Tugay", "MS", 0, false],
  ["Yassin", "IV", 0, true],
];

const SPIELE_START = [
  [1, "2026-07-12", "11:00", "TGD Essen-West 4", "", "Freundschaft", null, null],
  [2, "2026-07-19", "13:00", "RWT Herne 79/09 II", "", "Freundschaft", null, null],
  [3, "2026-07-26", "13:00", "OB HL", "", "Freundschaft", null, null],
  [4, "2026-08-02", "17:00", "Ugarit FC", "", "Freundschaft", null, null],
  [5, "2026-08-23", "15:00", "FC Herne 57", "A", "Kreisliga C", 5, 4],
  [6, "2026-08-30", "17:00", "Zonguldakspor Bickern II", "H", "Kreisliga C", 8, 1],
  [7, "2026-09-06", "11:00", "SC Constantin Herne II", "A", "Kreisliga C", 6, 3],
  [8, "", "", "SF Stuckenbusch-Hochlarmark", "", "Freundschaft", null, null],
  [9, "2026-09-27", "17:00", "VfB Börnig III", "H", "Kreisliga C", null, null],
  [10, "2026-10-04", "13:00", "SpVgg. Röhlinghausen III", "A", "Kreisliga C", null, null],
  [11, "2026-10-11", "13:00", "ESV Herne III", "H", "Kreisliga C", null, null],
  [12, "2026-10-18", "13:00", "RSV Wanne II", "A", "Kreisliga C", null, null],
  [13, "2026-10-25", "19:00", "Spvg. Arminia Holsterhausen II", "H", "Kreisliga C", null, null],
  [14, "2026-11-08", "15:00", "DJK Wanne-Eickel 88 II", "A", "Kreisliga C", null, null],
  [15, "2026-11-15", "17:00", "ASC Leone III", "A", "Kreisliga C", null, null],
  [16, "2026-11-29", "17:00", "Eintracht Ickern III", "H", "Kreisliga C", null, null],
  [17, "2026-12-06", "17:00", "Spiel-Club Röhlinghausen", "H", "Kreisliga C", null, null],
  [18, "2026-12-13", "13:00", "Blau Weiß Börnig II", "A", "Kreisliga C", null, null],
];

function startDaten() {
  const trainings = T_TERMINE.map((d, i) => ({ id: "t" + (i + 1), datum: d }));
  const anwesend = {};
  trainings.forEach((t, i) => {
    anwesend[t.id] = Object.keys(T_DATEN).filter((n) => T_DATEN[n].includes(i + 1));
  });
  const noten = {};
  SPIELE_START.forEach(([nr]) => {
    const m = {};
    Object.keys(N_DATEN).forEach((n) => {
      if (N_DATEN[n][nr] != null) m[n] = N_DATEN[n][nr];
    });
    noten["g" + nr] = m;
  });
  return {
    spieler: KADER_START.map(([name, hp, sperre, verf]) => ({
      name, haupt: hp, neben: [], sperre, verfuegbar: verf, fix: false,
    })),
    trainings, anwesend,
    spiele: SPIELE_START.map(([nr, datum, zeit, gegner, ha, wb, tf, tg]) => ({
      nr, datum, zeit, gegner, ha, wb, tf, tg,
    })),
    noten,
    wNote: 0.7, wTraining: 0.3, kaderGroesse: 15, reserve: 1,
    formation: "4-2-3-1", elf: {},
  };
}

/* ---------------------------------------------------------------- Helfer */
const heute = () => new Date().toISOString().slice(0, 10);
const fmtDatum = (s) => {
  if (!s) return "—";
  const d = new Date(s + "T12:00:00");
  return d.toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit" });
};
const fmtNote = (v) => (v == null ? "—" : v.toFixed(2).replace(".", ","));
const fmtProz = (v) => (v == null ? "—" : Math.round(v * 100) + " %");

function useDaten(session) {
  const [daten, setDaten] = useState(null);
  const [status, setStatus] = useState("laden");

  useEffect(() => {
    if (!session || !supabase) return;
    let aktiv = true;

    const laden = async () => {
      setStatus("laden");
      const { data, error } = await supabase
        .from("app_state")
        .select("data")
        .eq("id", "main")
        .maybeSingle();

      if (!aktiv) return;
      if (error) {
        console.error(error);
        setStatus("fehler");
        return;
      }

      if (data?.data) {
        setDaten(data.data);
        setStatus("bereit");
        return;
      }

      const initial = startDaten();
      const { error: insertError } = await supabase
        .from("app_state")
        .upsert({ id: "main", data: initial, updated_by: session.user.id });

      if (!aktiv) return;
      if (insertError) {
        console.error(insertError);
        setStatus("fehler");
      } else {
        setDaten(initial);
        setStatus("bereit");
      }
    };

    laden();

    const channel = supabase
      .channel("firtinaspor-app-state")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "app_state", filter: "id=eq.main" },
        (payload) => {
          if (payload.new?.data) {
            setDaten(payload.new.data);
            setStatus("bereit");
          }
        }
      )
      .subscribe();

    return () => {
      aktiv = false;
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id]);

  const speichern = useCallback(async (neu) => {
    if (!session || !supabase) return;
    setDaten(neu);
    setStatus("speichert");

    const { error } = await supabase
      .from("app_state")
      .upsert({ id: "main", data: neu, updated_by: session.user.id });

    if (error) {
      console.error(error);
      setStatus("fehler");
    } else {
      setStatus("bereit");
    }
  }, [session?.user?.id]);

  return [daten, speichern, status];
}
/* ---------------------------------------------------------------- Berechnung */
function rechne(d) {
  // Ein Training zählt, wenn es bereits stattgefunden hat ODER wenn dafür
  // schon Anwesenheit eingetragen wurde. So wirken Änderungen sofort auf
  // Quote, Score, Rangliste, Kader und Aufstellung.
  const relevanteTrainings = d.trainings.filter((t) => {
    if (!t.datum) return false;
    const hatEintrag = (d.anwesend[t.id] || []).length > 0;
    return t.datum <= heute() || hatEintrag;
  });
  const nTrain = relevanteTrainings.length;
  const werte = d.spieler.map((s) => {
    const dabei = relevanteTrainings.filter((t) => (d.anwesend[t.id] || []).includes(s.name)).length;
    const quote = nTrain ? dabei / nTrain : null;
    const noten = d.spiele
      .map((sp) => (d.noten["g" + sp.nr] || {})[s.name])
      .filter((v) => typeof v === "number");
    const oNote = noten.length ? noten.reduce((a, b) => a + b, 0) / noten.length : null;
    const score = Math.round(
      ((oNote || 0) * 10 * d.wNote + (quote || 0) * 100 * d.wTraining) * 10
    ) / 10;
    return { ...s, trainings: dabei, quote, oNote, einsaetze: noten.length, score };
  });

  // Sonntagskader
  const fixe = werte.filter((w) => w.fix && w.verfuegbar && w.sperre === 0);
  const frei = d.kaderGroesse - fixe.length;
  const kandidaten = werte
    .filter((w) => w.verfuegbar && w.sperre === 0 && !w.fix)
    .sort((a, b) => b.score - a.score);
  const kader = {};
  fixe.forEach((w) => (kader[w.name] = "fix"));
  kandidaten.forEach((w, i) => {
    if (i < frei) kader[w.name] = "dabei";
    else if (i < frei + d.reserve) kader[w.name] = "reserve";
  });
  werte.forEach((w) => {
    w.kader = w.sperre > 0 ? "gesperrt" : kader[w.name] || null;
    w.imKader = w.kader === "dabei" || w.kader === "fix";
  });

  const rang = [...werte].sort((a, b) => b.score - a.score);
  rang.forEach((w, i) => (w.rang = i + 1));
  return { werte, rang, nTrain };
}

const kannSpielen = (s, code) => s.haupt === code || (s.neben || []).includes(code);

function vorschlaege(werte, formation, elf) {
  const slots = FORMATIONEN[formation];
  const out = Array(slots.length).fill(null);
  const belegt = new Set();

  // Manuelle Auswahl hat Vorrang, solange der Spieler noch im Kader ist.
  // Sie darf bewusst auch positionsfremd sein (SlotWahl bietet diese Spieler
  // explizit unter "Spielt eigentlich woanders" an).
  slots.forEach((slot, i) => {
    const manuell = elf[formation + ":" + i];
    const mw = manuell ? werte.find((w) => w.name === manuell) : null;
    if (mw && mw.imKader && !belegt.has(manuell)) {
      out[i] = manuell;
      belegt.add(manuell);
    }
  });

  const freieSlots = slots
    .map((slot, i) => ({ ...slot, index: i }))
    .filter((slot) => !out[slot.index]);
  const kandidaten = werte
    .filter((w) => w.imKader && !belegt.has(w.name))
    .sort((a, b) => b.score - a.score);

  // Globale Optimierung statt gieriger Einzelwahl:
  // 1) möglichst viele Positionen besetzen
  // 2) bei gleicher Anzahl die höchste Gesamtscore-Elf wählen
  // Dadurch werden Neben-/Alternativpositionen so verteilt, dass ein
  // vielseitiger Spieler nicht unnötig einen später benötigten Spezialisten
  // blockiert. Bei höchstens 11 Slots ist eine Bitmasken-DP sehr klein.
  const n = freieSlots.length;
  const maxMask = 1 << n;
  let dp = Array(maxMask).fill(null);
  dp[0] = { count: 0, score: 0, picks: [] };

  kandidaten.forEach((w) => {
    const next = dp.map((x) => x && ({ ...x, picks: [...x.picks] }));
    for (let mask = 0; mask < maxMask; mask++) {
      const zustand = dp[mask];
      if (!zustand) continue;
      for (let j = 0; j < n; j++) {
        if (mask & (1 << j)) continue;
        if (!kannSpielen(w, freieSlots[j].p)) continue;
        const neuMask = mask | (1 << j);
        const kandidat = {
          count: zustand.count + 1,
          score: zustand.score + (w.score || 0),
          picks: [...zustand.picks, [j, w.name]],
        };
        const alt = next[neuMask];
        if (!alt || kandidat.count > alt.count ||
            (kandidat.count === alt.count && kandidat.score > alt.score)) {
          next[neuMask] = kandidat;
        }
      }
    }
    dp = next;
  });

  let best = dp[0];
  dp.forEach((zustand) => {
    if (!zustand) return;
    if (!best || zustand.count > best.count ||
        (zustand.count === best.count && zustand.score > best.score)) {
      best = zustand;
    }
  });

  (best?.picks || []).forEach(([j, name]) => {
    out[freieSlots[j].index] = name;
  });

  return out;
}

/* ---------------------------------------------------------------- UI-Bausteine */
const C = {
  rot: "#9B1B30", rotTief: "#6E0F20", papier: "#FBF8F6", tinte: "#1C1614",
  grau: "#7A716C", linie: "#E3DAD5", rasen: "#2F6B3E", rasenHell: "#EAF1E9",
  gold: "#C8A14A", warn: "#B3372B", gut: "#2F6B3E",
};

function Kopf({ titel, rechts }) {
  return (
    <div className="flex items-end justify-between px-4 pt-5 pb-3">
      <h2 className="text-2xl font-black tracking-tight" style={{ color: C.tinte }}>{titel}</h2>
      {rechts}
    </div>
  );
}

function Zeile({ children, onClick, aktiv }) {
  return (
    <div
      onClick={onClick}
      className={"flex items-center gap-3 px-4 py-3 " + (onClick ? "cursor-pointer active:opacity-60" : "")}
      style={{ borderBottom: `1px solid ${C.linie}`, background: aktiv ? "#F3EDE9" : "transparent" }}
    >
      {children}
    </div>
  );
}

function Wahl({ werte, wert, setzen }) {
  return (
    <div className="flex rounded-full p-1" style={{ background: "#EFE7E3" }}>
      {werte.map((w) => (
        <button key={w} onClick={() => setzen(w)}
          className="flex-1 px-3 py-1.5 text-sm font-bold rounded-full transition-colors"
          style={{
            background: wert === w ? C.rot : "transparent",
            color: wert === w ? "#fff" : C.grau,
          }}>
          {w}
        </button>
      ))}
    </div>
  );
}

function Balken({ anteil, farbe }) {
  return (
    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#EAE1DC" }}>
      <div className="h-full rounded-full" style={{ width: `${Math.min(100, anteil * 100)}%`, background: farbe }} />
    </div>
  );
}

/* ---------------------------------------------------------------- Training */
function Training({ d, save }) {
  const sortiert = [...d.trainings].sort((a, b) => (a.datum < b.datum ? 1 : -1));
  const vergangen = sortiert.filter((t) => t.datum <= heute());
  const [akt, setAkt] = useState((vergangen[0] || sortiert[0] || {}).id);
  const termin = d.trainings.find((t) => t.id === akt);
  const da = (d.anwesend[akt] || []);

  const toggle = (name) => {
    const neu = { ...d.anwesend };
    const liste = new Set(neu[akt] || []);
    liste.has(name) ? liste.delete(name) : liste.add(name);
    neu[akt] = [...liste];
    save({ ...d, anwesend: neu });
  };

  const neuerTermin = () => {
    const datum = prompt("Datum des Trainings (JJJJ-MM-TT)", heute());
    if (!datum || !/^\d{4}-\d{2}-\d{2}$/.test(datum)) return;
    const id = "t" + (Date.now() % 1000000);
    save({ ...d, trainings: [...d.trainings, { id, datum }], anwesend: { ...d.anwesend, [id]: [] } });
    setAkt(id);
  };

  return (
    <div className="pb-24">
      <Kopf titel="Training" rechts={
        <button onClick={neuerTermin} className="text-sm font-bold px-3 py-1.5 rounded-full"
          style={{ background: C.rot, color: "#fff" }}>+ Termin</button>} />
      <div className="px-4 pb-3 flex gap-2 overflow-x-auto">
        {sortiert.map((t) => (
          <button key={t.id} onClick={() => setAkt(t.id)}
            className="shrink-0 px-3 py-2 rounded-lg text-sm font-bold"
            style={{
              background: t.id === akt ? C.rot : "#fff",
              color: t.id === akt ? "#fff" : t.datum > heute() ? C.grau : C.tinte,
              border: `1px solid ${t.id === akt ? C.rot : C.linie}`,
            }}>
            {fmtDatum(t.datum)}
          </button>
        ))}
      </div>
      <div className="px-4 pb-2 text-sm" style={{ color: C.grau }}>
        {da.length} von {d.spieler.length} da
        {termin && termin.datum > heute() && " · Termin liegt noch vor uns"}
      </div>
      <div style={{ borderTop: `1px solid ${C.linie}` }}>
        {d.spieler.map((s) => {
          const an = da.includes(s.name);
          return (
            <Zeile key={s.name} onClick={() => toggle(s.name)}>
              <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 text-white text-sm font-black"
                style={{ background: an ? C.gut : "#DDD3CE" }}>
                {an ? "✓" : ""}
              </div>
              <span className="font-bold flex-1">{s.name}</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded"
                style={{ background: "#F0E9E5", color: C.grau }}>{s.haupt || "—"}</span>
            </Zeile>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Noten */
function Noten({ d, save }) {
  const gespielt = [...d.spiele].sort((a, b) => b.nr - a.nr);
  const [nr, setNr] = useState((gespielt.find((s) => s.datum && s.datum <= heute()) || gespielt[0]).nr);
  const spiel = d.spiele.find((s) => s.nr === nr);
  const m = d.noten["g" + nr] || {};

  const setze = (name, wert) => {
    const neu = { ...d.noten, ["g" + nr]: { ...m } };
    if (wert == null) delete neu["g" + nr][name];
    else neu["g" + nr][name] = wert;
    save({ ...d, noten: neu });
  };

  return (
    <div className="pb-24">
      <Kopf titel="Noten" />
      <div className="px-4 pb-3 flex gap-2 overflow-x-auto">
        {gespielt.map((s) => (
          <button key={s.nr} onClick={() => setNr(s.nr)}
            className="shrink-0 px-3 py-2 rounded-lg text-left"
            style={{
              background: s.nr === nr ? C.rot : "#fff",
              color: s.nr === nr ? "#fff" : C.tinte,
              border: `1px solid ${s.nr === nr ? C.rot : C.linie}`, minWidth: 120,
            }}>
            <div className="text-xs opacity-70">{s.datum ? fmtDatum(s.datum) : "Datum offen"}</div>
            <div className="text-sm font-bold truncate">{s.gegner}</div>
          </button>
        ))}
      </div>
      {spiel && (
        <div className="px-4 pb-3 text-sm" style={{ color: C.grau }}>
          {spiel.wb}{spiel.ha ? ` · ${spiel.ha === "H" ? "Heim" : "Auswärts"}` : ""}
          {spiel.tf != null ? ` · ${spiel.tf}:${spiel.tg}` : ""}
          {" · "}{Object.keys(m).length} bewertet
        </div>
      )}
      <div style={{ borderTop: `1px solid ${C.linie}` }}>
        {d.spieler.map((s) => {
          const v = m[s.name];
          return (
            <Zeile key={s.name}>
              <span className="font-bold flex-1 truncate">{s.name}</span>
              {v == null ? (
                <button onClick={() => setze(s.name, 7)}
                  className="text-sm font-bold px-3 py-1.5 rounded-lg"
                  style={{ border: `1px solid ${C.linie}`, color: C.grau }}>
                  bewerten
                </button>
              ) : (
                <div className="flex items-center gap-1">
                  <button onClick={() => setze(s.name, Math.max(0, Math.round((v - 0.25) * 100) / 100))}
                    className="w-9 h-9 rounded-lg text-lg font-black"
                    style={{ border: `1px solid ${C.linie}` }}>–</button>
                  <div className="w-14 text-center text-lg font-black tabular-nums"
                    style={{ color: v >= 8 ? C.gut : v < 6 ? C.warn : C.tinte }}>
                    {fmtNote(v)}
                  </div>
                  <button onClick={() => setze(s.name, Math.min(10, Math.round((v + 0.25) * 100) / 100))}
                    className="w-9 h-9 rounded-lg text-lg font-black"
                    style={{ border: `1px solid ${C.linie}` }}>+</button>
                  <button onClick={() => setze(s.name, null)}
                    className="w-8 h-9 text-sm" style={{ color: C.grau }}>✕</button>
                </div>
              )}
            </Zeile>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Übersicht */
function Uebersicht({ d, berechnet }) {
  const [sort, setSort] = useState("score");
  const spalten = [
    { k: "name", t: "Spieler" }, { k: "trainings", t: "Tr." },
    { k: "quote", t: "Quote" }, { k: "oNote", t: "Ø Note" },
    { k: "einsaetze", t: "Eins." }, { k: "score", t: "Score" },
  ];
  const reihen = useMemo(() => {
    const r = [...berechnet.werte];
    r.sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name, "de");
      const av = a[sort], bv = b[sort];
      if (av == null) return 1;
      if (bv == null) return -1;
      return bv - av;
    });
    return r;
  }, [berechnet.werte, sort]);

  return (
    <div className="pb-24">
      <Kopf titel="Übersicht" />
      <div className="px-4 pb-3 text-sm" style={{ color: C.grau }}>
        Tippe auf eine Spalte, um danach zu sortieren.
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ minWidth: 520 }}>
          <thead>
            <tr style={{ background: C.rot }}>
              {spalten.map((s) => (
                <th key={s.k} onClick={() => setSort(s.k)}
                  className="px-3 py-2.5 font-bold text-white text-left whitespace-nowrap cursor-pointer"
                  style={{ opacity: sort === s.k ? 1 : 0.75 }}>
                  {s.t}{sort === s.k ? " ▾" : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reihen.map((w, i) => (
              <tr key={w.name} style={{ background: i % 2 ? "#F6F0ED" : "#fff" }}>
                <td className="px-3 py-2.5 font-bold whitespace-nowrap">
                  {w.name}
                  <span className="ml-2 text-xs font-bold" style={{ color: C.grau }}>{w.haupt}</span>
                </td>
                <td className="px-3 py-2.5 tabular-nums">{w.trainings}</td>
                <td className="px-3 py-2.5 tabular-nums font-bold"
                  style={{ color: w.quote >= 0.7 ? C.gut : w.quote < 0.4 ? C.warn : C.tinte }}>
                  {fmtProz(w.quote)}
                </td>
                <td className="px-3 py-2.5 tabular-nums font-bold"
                  style={{ color: w.oNote >= 7.5 ? C.gut : w.oNote < 6 ? C.warn : C.tinte }}>
                  {fmtNote(w.oNote)}
                </td>
                <td className="px-3 py-2.5 tabular-nums">{w.einsaetze}</td>
                <td className="px-3 py-2.5 tabular-nums font-black">{w.score.toFixed(1).replace(".", ",")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Aushang */
function Aushang({ berechnet }) {
  const liste = berechnet.rang;
  const medaille = ["#C8A14A", "#B6B2AE", "#B08256"];
  return (
    <div className="pb-24">
      <div className="px-4 pt-5 pb-1">
        <h2 className="text-2xl font-black tracking-tight" style={{ color: C.tinte }}>Rangliste</h2>
        <p className="text-sm mt-1" style={{ color: C.grau }}>
          Für die Mannschaft. Punkte aus Einsatz und Leistung – einzelne Spielnoten stehen hier nicht.
        </p>
      </div>
      <div className="px-4 pt-3">
        {liste.map((w, i) => (
          <div key={w.name} className="flex items-center gap-3 py-3"
            style={{ borderBottom: `1px solid ${C.linie}` }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black shrink-0"
              style={{
                background: i < 3 ? medaille[i] : "#F0E9E5",
                color: i < 3 ? "#fff" : C.grau,
              }}>
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-black text-lg leading-tight truncate">{w.name}</div>
              <div className="text-xs mt-0.5" style={{ color: C.grau }}>
                {POS_LANG[w.haupt] || "Position offen"} · {w.einsaetze} Einsätze
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-2xl font-black tabular-nums" style={{ color: C.rot }}>
                {Math.round(w.score)}
              </div>
              <div className="text-xs" style={{ color: C.grau }}>
                {i < 5 ? "Top 5" : i < 15 ? "Stammkader" : "Kaderrand"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Spielplan */
function Spielplan({ d, save }) {
  const setTor = (nr, feld, wert) => {
    const v = wert === "" ? null : Math.max(0, parseInt(wert, 10) || 0);
    save({ ...d, spiele: d.spiele.map((s) => (s.nr === nr ? { ...s, [feld]: v } : s)) });
  };
  const setDatum = (nr) => {
    const s = d.spiele.find((x) => x.nr === nr);
    const datum = prompt("Datum (JJJJ-MM-TT)", s.datum || heute());
    if (datum == null) return;
    save({ ...d, spiele: d.spiele.map((x) => (x.nr === nr ? { ...x, datum } : x)) });
  };
  return (
    <div className="pb-24">
      <Kopf titel="Spielplan" />
      <div className="px-4 pb-3 text-sm" style={{ color: C.grau }}>
        Kreisliga C2 Kreis Herne · Saison 26/27
      </div>
      <div style={{ borderTop: `1px solid ${C.linie}` }}>
        {d.spiele.map((s) => (
          <div key={s.nr} className="px-4 py-3" style={{ borderBottom: `1px solid ${C.linie}` }}>
            <div className="flex items-center gap-3">
              <div className="w-14 shrink-0">
                <button onClick={() => setDatum(s.nr)} className="text-left">
                  <div className="text-xs font-bold" style={{ color: s.datum ? C.tinte : C.warn }}>
                    {s.datum ? fmtDatum(s.datum) : "Datum?"}
                  </div>
                  <div className="text-xs" style={{ color: C.grau }}>{s.zeit || ""}</div>
                </button>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold truncate">{s.gegner}</div>
                <div className="text-xs" style={{ color: C.grau }}>
                  {s.wb}{s.ha ? ` · ${s.ha === "H" ? "Heim" : "Auswärts"}` : ""}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <input inputMode="numeric" value={s.tf ?? ""} onChange={(e) => setTor(s.nr, "tf", e.target.value)}
                  className="w-9 h-9 text-center font-black rounded-lg tabular-nums"
                  style={{ border: `1px solid ${C.linie}` }} />
                <span className="font-black" style={{ color: C.grau }}>:</span>
                <input inputMode="numeric" value={s.tg ?? ""} onChange={(e) => setTor(s.nr, "tg", e.target.value)}
                  className="w-9 h-9 text-center font-black rounded-lg tabular-nums"
                  style={{ border: `1px solid ${C.linie}` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Kaderplanung */
function Kaderplanung({ d, save, berechnet }) {
  const upd = (name, feld, wert) =>
    save({ ...d, spieler: d.spieler.map((s) => (s.name === name ? { ...s, [feld]: wert } : s)) });

  const liste = [...berechnet.werte].sort((a, b) => b.score - a.score);
  const dabei = liste.filter((w) => w.imKader);
  const besetzung = POS.map((p) => ({ p, n: dabei.filter((w) => kannSpielen(w, p)).length }));

  return (
    <div className="pb-24">
      <Kopf titel="Sonntagskader" />
      <div className="px-4 pb-4">
        <div className="rounded-xl p-4" style={{ background: "#fff", border: `1px solid ${C.linie}` }}>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black tabular-nums" style={{ color: C.rot }}>{dabei.length}</span>
            <span className="text-sm" style={{ color: C.grau }}>
              von {d.kaderGroesse} Plätzen · {liste.filter((w) => w.kader === "reserve").length} Reserve ·{" "}
              {liste.filter((w) => w.sperre > 0).length} gesperrt
            </span>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs font-bold mb-1.5">
              <span>Leistung {Math.round(d.wNote * 100)} %</span>
              <span style={{ color: C.grau }}>Training {Math.round(d.wTraining * 100)} %</span>
            </div>
            <input type="range" min="0" max="100" step="5" value={Math.round(d.wNote * 100)}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10) / 100;
                save({ ...d, wNote: v, wTraining: Math.round((1 - v) * 100) / 100 });
              }}
              className="w-full" style={{ accentColor: C.rot }} />
          </div>
          <div className="mt-3 flex flex-wrap gap-1">
            {besetzung.map((b) => (
              <span key={b.p} className="text-xs font-bold px-2 py-1 rounded"
                style={{ background: b.n ? C.rasenHell : "#FAE3E0", color: b.n ? C.rasen : C.warn }}>
                {b.p} {b.n}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div style={{ borderTop: `1px solid ${C.linie}` }}>
        {liste.map((w) => {
          const badge = w.kader === "gesperrt" ? ["gesperrt", C.warn, "#FAE3E0"]
            : w.kader === "fix" ? ["fix dabei", C.rasen, C.rasenHell]
            : w.kader === "dabei" ? ["dabei", C.rasen, C.rasenHell]
            : w.kader === "reserve" ? ["Reserve", "#8A6D1F", "#FBF0D2"]
            : ["nicht dabei", C.grau, "#F0E9E5"];
          return (
            <div key={w.name} className="px-4 py-3" style={{ borderBottom: `1px solid ${C.linie}` }}>
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-bold truncate">
                    {w.name}
                    <span className="ml-2 text-xs" style={{ color: C.grau }}>{w.haupt}</span>
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: C.grau }}>
                    Ø {fmtNote(w.oNote)} · {fmtProz(w.quote)} Training
                  </div>
                </div>
                <div className="text-xl font-black tabular-nums shrink-0">{w.score.toFixed(1).replace(".", ",")}</div>
                <span className="text-xs font-bold px-2 py-1 rounded shrink-0"
                  style={{ color: badge[1], background: badge[2] }}>{badge[0]}</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <button onClick={() => upd(w.name, "verfuegbar", !w.verfuegbar)}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg"
                  style={{
                    background: w.verfuegbar ? C.rasenHell : "#F0E9E5",
                    color: w.verfuegbar ? C.rasen : C.grau,
                  }}>
                  {w.verfuegbar ? "verfügbar" : "abgesagt"}
                </button>
                <button onClick={() => upd(w.name, "fix", !w.fix)}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg"
                  style={{
                    background: w.fix ? C.rot : "#F0E9E5",
                    color: w.fix ? "#fff" : C.grau,
                  }}>
                  fix
                </button>
                <div className="flex items-center gap-1 ml-auto">
                  <span className="text-xs" style={{ color: C.grau }}>Sperre</span>
                  <button onClick={() => upd(w.name, "sperre", Math.max(0, w.sperre - 1))}
                    className="w-7 h-7 rounded font-black" style={{ border: `1px solid ${C.linie}` }}>–</button>
                  <span className="w-5 text-center font-black tabular-nums">{w.sperre}</span>
                  <button onClick={() => upd(w.name, "sperre", w.sperre + 1)}
                    className="w-7 h-7 rounded font-black" style={{ border: `1px solid ${C.linie}` }}>+</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Aufstellung */
function Aufstellung({ d, save, berechnet }) {
  const [offen, setOffen] = useState(null);
  const formation = d.formation;
  const slots = FORMATIONEN[formation];
  const elf = vorschlaege(berechnet.werte, formation, d.elf);
  const nachName = Object.fromEntries(berechnet.werte.map((w) => [w.name, w]));

  const setzeSlot = (i, name) => {
    const neu = { ...d.elf };
    if (name == null) delete neu[formation + ":" + i];
    else {
      Object.keys(neu).forEach((k) => {
        if (k.startsWith(formation + ":") && neu[k] === name) delete neu[k];
      });
      neu[formation + ":" + i] = name;
    }
    save({ ...d, elf: neu });
    setOffen(null);
  };

  const bank = berechnet.werte
    .filter((w) => w.imKader && !elf.includes(w.name))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return (
    <div className="pb-24">
      <Kopf titel="Aufstellung" />
      <div className="px-4 pb-4">
        <Wahl werte={["4-2-3-1", "4-1-4-1"]} wert={formation}
          setzen={(f) => save({ ...d, formation: f })} />
      </div>

      <div className="mx-4 rounded-2xl overflow-hidden" style={{ background: C.rasen }}>
        <div className="py-4 px-2" style={{
          backgroundImage: `repeating-linear-gradient(180deg, rgba(255,255,255,.05) 0 34px, transparent 34px 68px)`,
        }}>
          {REIHEN[formation].map((reihe, ri) => (
            <div key={ri} className="flex justify-center gap-2 py-2">
              {reihe.map((si) => {
                const name = elf[si];
                const w = name ? nachName[name] : null;
                const manuell = !!d.elf[formation + ":" + si];
                return (
                  <button key={si} onClick={() => setOffen(si)}
                    className="rounded-lg px-1 py-2 text-center active:opacity-70"
                    style={{
                      width: `${Math.floor(88 / reihe.length)}%`, maxWidth: 96,
                      background: name ? "rgba(255,255,255,.94)" : "rgba(255,255,255,.18)",
                      border: manuell ? `2px solid ${C.gold}` : "2px solid transparent",
                    }}>
                    <div className="font-black tracking-wide"
                      style={{ fontSize: 10, color: name ? C.rasen : "rgba(255,255,255,.85)" }}>
                      {slots[si].p}
                    </div>
                    <div className="font-black leading-tight truncate"
                      style={{ fontSize: 13, color: name ? C.tinte : "rgba(255,255,255,.7)" }}>
                      {name || "frei"}
                    </div>
                    {w && w.oNote != null && (
                      <div className="tabular-nums" style={{ fontSize: 10, color: C.grau }}>
                        {fmtNote(w.oNote)}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 pt-3 flex items-center gap-3">
        <span className="text-xs" style={{ color: C.grau }}>
          Goldener Rahmen = von dir gesetzt, alles andere ist Vorschlag.
        </span>
        {Object.keys(d.elf).some((k) => k.startsWith(formation + ":")) && (
          <button onClick={() => {
            const neu = { ...d.elf };
            Object.keys(neu).forEach((k) => { if (k.startsWith(formation + ":")) delete neu[k]; });
            save({ ...d, elf: neu });
          }} className="text-xs font-bold ml-auto shrink-0" style={{ color: C.rot }}>
            zurücksetzen
          </button>
        )}
      </div>

      <div className="px-4 pt-5 pb-2 text-sm font-black">Ersatzbank</div>
      <div style={{ borderTop: `1px solid ${C.linie}` }}>
        {bank.length === 0 && (
          <div className="px-4 py-4 text-sm" style={{ color: C.grau }}>
            Niemand übrig – im Sonntagskader stehen nur die elf.
          </div>
        )}
        {bank.map((w) => (
          <Zeile key={w.name}>
            <span className="font-bold flex-1">{w.name}</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded"
              style={{ background: "#F0E9E5", color: C.grau }}>{w.haupt}</span>
            <span className="tabular-nums font-black w-12 text-right">{fmtNote(w.oNote)}</span>
          </Zeile>
        ))}
      </div>

      {offen != null && (
        <SlotWahl slot={slots[offen]} werte={berechnet.werte} belegt={elf}
          aktuell={elf[offen]} onWahl={(n) => setzeSlot(offen, n)}
          onZu={() => setOffen(null)} />
      )}
    </div>
  );
}

function SlotWahl({ slot, werte, belegt, aktuell, onWahl, onZu }) {
  const passend = werte.filter((w) => w.imKader && kannSpielen(w, slot.p) && w.name !== aktuell)
    .sort((a, b) => b.score - a.score);
  const rest = werte.filter((w) => w.imKader && !kannSpielen(w, slot.p) && w.name !== aktuell)
    .sort((a, b) => b.score - a.score);

  const eintrag = (w, passt) => (
    <Zeile key={w.name} onClick={() => onWahl(w.name)}>
      <span className="font-bold flex-1">
        {w.name}
        {belegt.includes(w.name) && (
          <span className="ml-2 text-xs" style={{ color: C.grau }}>steht schon in der Elf</span>
        )}
      </span>
      <span className="text-xs font-bold px-2 py-0.5 rounded"
        style={{ background: passt ? C.rasenHell : "#F0E9E5", color: passt ? C.rasen : C.grau }}>
        {w.haupt}
      </span>
      <span className="tabular-nums font-black w-12 text-right">{fmtNote(w.oNote)}</span>
    </Zeile>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end" style={{ background: "rgba(28,22,20,.5)" }}
      onClick={onZu}>
      <div className="w-full rounded-t-2xl overflow-y-auto"
        style={{ background: C.papier, maxHeight: "80vh" }} onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 px-4 py-4 flex items-center justify-between"
          style={{ background: C.rot, color: "#fff" }}>
          <div>
            <div className="text-xs opacity-80">{slot.p}</div>
            <div className="font-black">{slot.r}</div>
          </div>
          <button onClick={onZu} className="text-2xl leading-none px-2">×</button>
        </div>
        {aktuell && (
          <Zeile onClick={() => onWahl(null)}>
            <span className="flex-1 font-bold" style={{ color: C.rot }}>
              {aktuell} entfernen und Vorschlag nutzen
            </span>
          </Zeile>
        )}
        {passend.map((w) => eintrag(w, true))}
        {rest.length > 0 && (
          <div className="px-4 pt-4 pb-2 text-xs font-bold" style={{ color: C.grau }}>
            Spielt eigentlich woanders
          </div>
        )}
        {rest.map((w) => eintrag(w, false))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Positionen */
function Positionen({ d, save }) {
  const upd = (name, feld, wert) =>
    save({ ...d, spieler: d.spieler.map((s) => (s.name === name ? { ...s, [feld]: wert } : s)) });

  const neuerSpieler = () => {
    const name = prompt("Name des Spielers");
    if (!name || !name.trim()) return;
    if (d.spieler.some((s) => s.name === name.trim())) { alert("Den Namen gibt es schon."); return; }
    save({
      ...d,
      spieler: [...d.spieler, { name: name.trim(), haupt: "", neben: [], sperre: 0, verfuegbar: true, fix: false }]
        .sort((a, b) => a.name.localeCompare(b.name, "de")),
    });
  };

  return (
    <div className="pb-24">
      <Kopf titel="Positionen" rechts={
        <button onClick={neuerSpieler} className="text-sm font-bold px-3 py-1.5 rounded-full"
          style={{ background: C.rot, color: "#fff" }}>+ Spieler</button>} />
      <div className="px-4 pb-3 text-sm" style={{ color: C.grau }}>
        Hauptposition antippen, weitere Positionen dazu wählen. Beides fließt in die Aufstellung ein.
      </div>
      <div style={{ borderTop: `1px solid ${C.linie}` }}>
        {d.spieler.map((s) => (
          <div key={s.name} className="px-4 py-3" style={{ borderBottom: `1px solid ${C.linie}` }}>
            <div className="font-bold mb-2">{s.name}</div>
            <div className="flex flex-wrap gap-1.5">
              {POS.map((p) => {
                const haupt = s.haupt === p;
                const neben = (s.neben || []).includes(p);
                return (
                  <button key={p}
                    onClick={() => {
                      if (haupt) { upd(s.name, "haupt", ""); return; }
                      if (neben) { upd(s.name, "neben", s.neben.filter((x) => x !== p)); return; }
                      if (!s.haupt) upd(s.name, "haupt", p);
                      else upd(s.name, "neben", [...(s.neben || []), p]);
                    }}
                    className="text-xs font-black px-2.5 py-1.5 rounded-lg"
                    style={{
                      background: haupt ? C.rot : neben ? C.rasenHell : "#fff",
                      color: haupt ? "#fff" : neben ? C.rasen : C.grau,
                      border: `1px solid ${haupt ? C.rot : neben ? C.rasen : C.linie}`,
                    }}>
                    {p}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- App */
const TABS = [
  ["Training", Training], ["Noten", Noten], ["Übersicht", Uebersicht],
  ["Aushang", Aushang], ["Spielplan", Spielplan], ["Kader", Kaderplanung],
  ["Aufstellung", Aufstellung], ["Positionen", Positionen],
];

function Login() {
  const [email, setEmail] = useState("");
  const [passwort, setPasswort] = useState("");
  const [meldung, setMeldung] = useState("");
  const [busy, setBusy] = useState(false);

  const anmelden = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMeldung("");
    const { error } = await supabase.auth.signInWithPassword({ email, password: passwort });
    if (error) setMeldung("Anmeldung fehlgeschlagen. E-Mail oder Passwort prüfen.");
    setBusy(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: C.papier, color: C.tinte }}>
      <form onSubmit={anmelden} className="w-full max-w-sm rounded-2xl p-5 shadow-sm" style={{ background: "#fff", border: `1px solid ${C.linie}` }}>
        <div className="text-xs font-black tracking-widest mb-2" style={{ color: C.rot }}>FIRTINASPOR III.</div>
        <h1 className="text-2xl font-black mb-1">Trainer-Login</h1>
        <p className="text-sm mb-5" style={{ color: C.grau }}>Melde dich mit deinem Trainerkonto an. Danach seht ihr beide denselben Live-Datenstand.</p>
        <label className="block text-xs font-bold mb-1">E-Mail</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required autoComplete="email"
          className="w-full rounded-lg px-3 py-2 mb-3" style={{ border: `1px solid ${C.linie}`, background: C.papier }} />
        <label className="block text-xs font-bold mb-1">Passwort</label>
        <input value={passwort} onChange={(e) => setPasswort(e.target.value)} type="password" required autoComplete="current-password"
          className="w-full rounded-lg px-3 py-2 mb-3" style={{ border: `1px solid ${C.linie}`, background: C.papier }} />
        {meldung && <div className="text-sm mb-3" style={{ color: C.warn }}>{meldung}</div>}
        <button disabled={busy} className="w-full py-2.5 rounded-lg font-black text-white" style={{ background: C.rot, opacity: busy ? .6 : 1 }}>
          {busy ? "Anmeldung …" : "Anmelden"}
        </button>
      </form>
    </div>
  );
}


function InstallAppButton() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [installiert, setInstalliert] = useState(() =>
    window.matchMedia?.("(display-mode: standalone)")?.matches || window.navigator.standalone === true
  );

  useEffect(() => {
    const bereit = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };
    const fertig = () => {
      setInstalliert(true);
      setInstallPrompt(null);
    };
    window.addEventListener("beforeinstallprompt", bereit);
    window.addEventListener("appinstalled", fertig);
    return () => {
      window.removeEventListener("beforeinstallprompt", bereit);
      window.removeEventListener("appinstalled", fertig);
    };
  }, []);

  if (installiert) return null;

  const installieren = async () => {
    if (installPrompt) {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === "accepted") setInstallPrompt(null);
      return;
    }
    const isiOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    if (isiOS) {
      alert("Auf iPhone: unten auf Teilen tippen und dann „Zum Home-Bildschirm“ auswählen. Danach startet Firtinaspor wie eine eigene App.");
    } else {
      alert("Öffne das Browser-Menü und wähle „App installieren“ oder „Zum Startbildschirm hinzufügen“.");
    }
  };

  return (
    <button onClick={installieren} className="text-xs font-bold px-2 py-1 rounded install-app-btn">
      Installieren
    </button>
  );
}

function HauptApp({ session }) {
  const [d, save, status] = useDaten(session);
  const [tab, setTab] = useState(0);
  const berechnet = useMemo(() => (d ? rechne(d) : null), [d]);

  if (!d) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.papier }}>
        <div className="text-sm" style={{ color: C.grau }}>
          {status === "laden" ? "Gemeinsame Daten werden geladen …" : "Daten konnten nicht geladen werden. Supabase-Einstellungen prüfen."}
        </div>
      </div>
    );
  }

  const Inhalt = TABS[tab][1];

  return (
    <div className="min-h-screen" style={{ background: C.papier, color: C.tinte,
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      <div className="app-header px-4 pb-3" style={{ background: C.rot }}>
        <div className="flex items-center justify-between gap-3">
          <div className="text-white">
            <div className="text-lg font-black leading-none tracking-tight">FIRTINASPOR III.</div>
            <div className="text-xs opacity-80 mt-1">Kreisliga C2 · Saison 26/27</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-white text-right" style={{ opacity: status === "speichert" ? 0.9 : 0.65 }}>
              {status === "speichert" ? "synchronisiert …" : status === "fehler" ? "Sync-Fehler" : "live synchronisiert"}
            </div>
            <InstallAppButton />
            <button onClick={() => supabase.auth.signOut()} className="text-xs font-bold px-2 py-1 rounded" style={{ background: "rgba(255,255,255,.15)", color: "#fff" }}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-1 px-2 py-2 overflow-x-auto sticky top-0 z-40" style={{ background: C.rotTief }}>
        {TABS.map(([name], i) => (
          <button key={name} onClick={() => setTab(i)} className="shrink-0 px-3 py-1.5 rounded-full text-sm font-bold"
            style={{ background: i === tab ? "#fff" : "transparent", color: i === tab ? C.rotTief : "rgba(255,255,255,.7)" }}>
            {name}
          </button>
        ))}
      </div>

      <Inhalt d={d} save={save} berechnet={berechnet} />

      <div className="px-4 py-4 text-xs" style={{ color: C.grau }}>
        Gemeinsamer Team-Datenstand über Supabase · Änderungen werden live zwischen euren Geräten synchronisiert.
      </div>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    if (!supabaseConfigured || !supabase) {
      setSession(null);
      return;
    }
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => listener.subscription.unsubscribe();
  }, []);

  if (!supabaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: C.papier, color: C.tinte }}>
        <div className="max-w-md rounded-2xl p-5" style={{ background: "#fff", border: `1px solid ${C.linie}` }}>
          <h1 className="text-xl font-black mb-2">Supabase noch nicht verbunden</h1>
          <p className="text-sm" style={{ color: C.grau }}>
            Trage in Vercel die Variablen VITE_SUPABASE_URL und VITE_SUPABASE_ANON_KEY ein und deploye die App neu.
          </p>
        </div>
      </div>
    );
  }

  if (session === undefined) {
    return <div className="min-h-screen flex items-center justify-center" style={{ background: C.papier }}>Lädt …</div>;
  }

  return session ? <HauptApp session={session} /> : <Login />;
}

