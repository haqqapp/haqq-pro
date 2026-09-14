
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { supabase, supabaseConfigured } from "./supabase.js";

/* ---------------------------------------------------------------- Konstanten */
const KEY = "haqq-pro-demo-v1";
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
  "4-1-2-1-2": [
    { p: "TW", r: "Torwart" }, { p: "RV", r: "Rechtsverteidiger" },
    { p: "IV", r: "Innenverteidiger rechts" }, { p: "IV", r: "Innenverteidiger links" },
    { p: "LV", r: "Linksverteidiger" }, { p: "DM", r: "Sechser" },
    { p: "ZM", r: "Zentrum rechts" }, { p: "ZM", r: "Zentrum links" },
    { p: "OM", r: "Zehner" }, { p: "MS", r: "Stürmer rechts" }, { p: "MS", r: "Stürmer links" },
  ],
  "4-3-3": [
    { p: "TW", r: "Torwart" }, { p: "RV", r: "Rechtsverteidiger" },
    { p: "IV", r: "Innenverteidiger rechts" }, { p: "IV", r: "Innenverteidiger links" },
    { p: "LV", r: "Linksverteidiger" }, { p: "DM", r: "Sechser" },
    { p: "ZM", r: "Achter rechts" }, { p: "ZM", r: "Achter links" },
    { p: "RM", r: "Rechtsaußen" }, { p: "LM", r: "Linksaußen" }, { p: "MS", r: "Mittelstürmer" },
  ],
  "3-6-1": [
    { p: "TW", r: "Torwart" }, { p: "IV", r: "Innenverteidiger rechts" },
    { p: "IV", r: "Innenverteidiger zentral" }, { p: "IV", r: "Innenverteidiger links" },
    { p: "RM", r: "Rechte Bahn" }, { p: "DM", r: "Sechser rechts" },
    { p: "ZM", r: "Zentrum rechts" }, { p: "ZM", r: "Zentrum links" },
    { p: "DM", r: "Sechser links" }, { p: "LM", r: "Linke Bahn" }, { p: "MS", r: "Mittelstürmer" },
  ],
};
const REIHEN = {
  "4-2-3-1": [[10], [9, 8, 7], [6, 5], [4, 3, 2, 1], [0]],
  "4-1-4-1": [[10], [9, 8, 7, 6], [5], [4, 3, 2, 1], [0]],
  "4-1-2-1-2": [[10, 9], [8], [7, 6], [5], [4, 3, 2, 1], [0]],
  "4-3-3": [[9, 10, 8], [7, 6, 5], [4, 3, 2, 1], [0]],
  "3-6-1": [[10], [9, 8, 7, 6, 5, 4], [3, 2, 1], [0]],
};

/* ---------------------------------------------------------------- Startdaten */
const T_DATEN = {
  Leon: [14, 15], Jonas: [1, 3, 5, 6, 7, 9, 10, 14, 15], Emir: [],
  Milan: [1, 2, 3, 4, 5, 6, 7, 8, 9, 12, 13, 14], Noah: [1, 2, 4, 6, 7, 8, 9, 10, 12],
  Luca: [1, 3, 12, 13, 14], Elias: [1, 8, 9, 11], Finn: [1, 2, 4, 6, 10, 12],
  Kerem: [1, 10, 11], Mert: [1], David: [2, 4, 10, 12], Malik: [],
  Julian: [1, 9], Paul: [4, 6, 8, 9, 10, 11, 12], Can: [15], Nico: [9],
  Tim: [], Ben: [4, 5, 8, 9, 10, 11, 12, 13, 14, 15], Deniz: [1, 2], Samuel: [7, 10],
  Arda: [1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14, 15],
  Robin: [1, 2, 6, 7, 8, 9, 10, 11, 12, 13, 14], Tom: [],
  Yusuf: [1, 5, 10, 11, 14], Jan: [1, 7, 8, 9, 10, 12, 15],
  Mika: [1, 2, 3, 4, 6, 7, 12, 13, 14, 15], Ali: [1, 2], Kaan: [14, 15],
};
const T_TERMINE = ["2026-07-07","2026-07-09","2026-07-14","2026-07-21","2026-07-23",
  "2026-08-04","2026-08-11","2026-08-18","2026-08-20","2026-08-25","2026-08-27",
  "2026-09-01","2026-09-03","2026-09-08","2026-09-10","2026-09-15"];

const N_DATEN = {
  Jonas: { 1: 7.5, 2: 8, 3: 8, 4: 6, 5: 8.25 }, Emir: { 6: 7.5 },
  Milan: { 1: 6.5, 2: 7.25, 3: 8, 4: 8, 5: 8, 7: 6.5 },
  Noah: { 1: 7.5, 2: 7.25, 3: 8.5, 4: 8, 5: 7.5, 6: 8 },
  Luca: { 1: 7, 2: 6, 6: 7, 7: 7 }, Elias: { 1: 7.5, 2: 6.25, 5: 7.75, 6: 8, 7: 9 },
  Finn: { 1: 4, 2: 5.5, 4: 5, 5: 4.5 }, Kerem: { 6: 9, 7: 8 }, Mert: { 4: 6 },
  David: { 1: 7, 2: 6.25, 3: 6, 5: 6.75, 6: 8 }, Malik: { 1: 7, 2: 7.75, 3: 8, 4: 8.5 },
  Julian: { 3: 8, 4: 6, 5: 8, 6: 8, 7: 8 }, Paul: { 1: 6.5, 2: 7.25, 3: 7.5, 4: 6, 5: 7.25, 6: 7.5 },
  Ben: { 3: 6.5, 6: 6.5, 7: 6 }, Deniz: { 1: 8, 2: 6, 7: 7.5 }, Samuel: { 2: 8.5, 5: 8, 6: 9 },
  Arda: { 2: 7.25, 5: 7.5, 6: 8.5, 7: 7.5 }, Robin: { 3: 7.5, 4: 8.5, 5: 7.75, 6: 9, 7: 8 },
  Tom: { 5: 9, 6: 10, 7: 8 }, Yusuf: { 1: 6, 2: 6.5, 3: 7, 4: 6, 6: 7, 7: 6 },
  Jan: { 4: 6.5, 5: 6, 6: 8, 7: 8 }, Mika: { 1: 7.5, 2: 7.25, 4: 7.5, 6: 7, 7: 7 },
  Ali: { 1: 7.5, 5: 8, 7: 8 },
};

const KADER_START = [
  ["Leon", "TW", 0, false], ["Jonas", "TW", 0, true], ["Emir", "ZM", 0, false],
  ["Milan", "LV", 0, false], ["Noah", "RV", 0, true], ["Luca", "IV", 0, true],
  ["Elias", "MS", 0, true], ["Finn", "RM", 0, false], ["Kerem", "LV", 0, true],
  ["Mert", "MS", 0, false], ["David", "IV", 0, true], ["Malik", "LM", 5, false],
  ["Julian", "LV", 0, true], ["Paul", "ZM", 0, true], ["Can", "DM", 8, false],
  ["Nico", "IV", 0, false], ["Tim", "TW", 0, false], ["Ben", "RM", 0, true],
  ["Deniz", "IV", 0, true], ["Samuel", "DM", 0, true], ["Arda", "OM", 0, true],
  ["Robin", "ZM", 0, true], ["Tom", "LM", 0, true], ["Yusuf", "DM", 0, true],
  ["Jan", "RV", 0, true], ["Mika", "ZM", 0, true], ["Ali", "MS", 0, false],
  ["Kaan", "IV", 0, true],
];

const SPIELE_START = [
  [1, "2026-07-12", "11:00", "SV Weststadt IV", "", "Freundschaft", null, null],
  [2, "2026-07-19", "13:00", "FC Nordring II", "", "Freundschaft", null, null],
  [3, "2026-07-26", "13:00", "VfL Höhenfeld", "", "Freundschaft", null, null],
  [4, "2026-08-02", "17:00", "Anadolu 09", "", "Freundschaft", null, null],
  [5, "2026-08-23", "15:00", "SV Grün-Weiß 57", "A", "Kreisliga C", 5, 4],
  [6, "2026-08-30", "17:00", "SC Rot-Weiß Bickern II", "H", "Kreisliga C", 8, 1],
  [7, "2026-09-06", "11:00", "TSV Constantin II", "A", "Kreisliga C", 6, 3],
  [8, "", "", "Sportfreunde Hochfeld", "", "Freundschaft", null, null],
  [9, "2026-09-27", "17:00", "VfB Nordstadt III", "H", "Kreisliga C", null, null],
  [10, "2026-10-04", "13:00", "SpVgg. Südpark III", "A", "Kreisliga C", null, null],
  [11, "2026-10-11", "13:00", "ESV West III", "H", "Kreisliga C", null, null],
  [12, "2026-10-18", "13:00", "RSV Mitte II", "A", "Kreisliga C", null, null],
  [13, "2026-10-25", "19:00", "Arminia West II", "H", "Kreisliga C", null, null],
  [14, "2026-11-08", "15:00", "DJK Eichen 88 II", "A", "Kreisliga C", null, null],
  [15, "2026-11-15", "17:00", "ASC Viktoria III", "A", "Kreisliga C", null, null],
  [16, "2026-11-29", "17:00", "Eintracht Ost III", "H", "Kreisliga C", null, null],
  [17, "2026-12-06", "17:00", "SC Südpark", "H", "Kreisliga C", null, null],
  [18, "2026-12-13", "13:00", "Blau-Weiß Nord II", "A", "Kreisliga C", null, null],
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
      name, haupt: hp, neben: [], posStaerke: hp ? { [hp]: 100 } : {}, sperre, verfuegbar: verf, fix: false,
      dabeiSeit: "2026-07-01", aktivBis: "", aktiv: true,
    })),
    trainings, anwesend,
    spiele: SPIELE_START.map(([nr, datum, zeit, gegner, ha, wb, tf, tg]) => ({
      nr, datum, zeit, gegner, ha, wb, tf, tg,
    })),
    noten,
    wNote: 0.7, wTraining: 0.3, kaderGroesse: 15, reserve: 1,
    formation: "4-2-3-1", elf: {},
    trainerNoten: {}, spielPositionen: {}, spielberichte: {}, aenderungen: [],
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

function spielerAmDatum(s, datum) {
  if (s.aktiv === false && !s.aktivBis) return false;
  if (datum && s.dabeiSeit && datum < s.dabeiSeit) return false;
  if (datum && s.aktivBis && datum > s.aktivBis) return false;
  return true;
}

function normalisiereDaten(raw) {
  const basis = startDaten();
  return {
    ...basis,
    ...raw,
    trainerNoten: raw?.trainerNoten || {},
    spielPositionen: raw?.spielPositionen || {},
    spielberichte: raw?.spielberichte || {},
    aenderungen: raw?.aenderungen || [],
    spieler: (raw?.spieler || basis.spieler).map((s) => ({
      ...s,
      dabeiSeit: s.dabeiSeit || "2026-07-01",
      aktivBis: s.aktivBis || "",
      aktiv: s.aktiv !== false,
      posStaerke: s.posStaerke || (s.haupt ? { [s.haupt]: 100, ...Object.fromEntries((s.neben || []).map((p) => [p, 70])) } : {}),
    })),
    elf: raw?.elf || {},
  };
}

function aenderungsText(alt, neu) {
  if (!alt) return "App-Daten initialisiert";
  const anders = (k) => JSON.stringify(alt?.[k]) !== JSON.stringify(neu?.[k]);
  if (anders("trainerNoten") || anders("noten") || anders("spielPositionen")) return "Spielerbewertung geändert";
  if (anders("spielberichte")) return "Spielbericht geändert";
  if (anders("anwesend") || anders("trainings")) return "Training geändert";
  if (anders("elf") || anders("formation")) return "Aufstellung geändert";
  if (anders("spieler")) return "Spieler / Positionen geändert";
  if (anders("spiele")) return "Spielplan geändert";
  if (anders("wNote") || anders("wTraining") || anders("kaderGroesse") || anders("reserve")) return "Kader-Einstellungen geändert";
  return "Daten geändert";
}

function useDaten(session) {
  const [daten, setDaten] = useState(null);
  const [status, setStatus] = useState("laden");
  const datenRef = React.useRef(null);

  useEffect(() => { datenRef.current = daten; }, [daten]);

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
        const normal = normalisiereDaten(data.data);
        setDaten(normal);
        datenRef.current = normal;
        setStatus("bereit");
        return;
      }

      const initial = normalisiereDaten(startDaten());
      const { error: insertError } = await supabase
        .from("app_state")
        .upsert({ id: "main", data: initial, updated_by: session.user.id });

      if (!aktiv) return;
      if (insertError) {
        console.error(insertError);
        setStatus("fehler");
      } else {
        setDaten(initial);
        datenRef.current = initial;
        setStatus("bereit");
      }
    };

    laden();

    const channel = supabase
      .channel("haqq-pro-app-state-v1")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "app_state", filter: "id=eq.main" },
        (payload) => {
          if (payload.new?.data) {
            const normal = normalisiereDaten(payload.new.data);
            setDaten(normal);
            datenRef.current = normal;
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

  const speichern = useCallback(async (neu, aktion) => {
    if (!session || !supabase) return;
    const alt = datenRef.current;
    const normal = normalisiereDaten(neu);
    const eintrag = {
      id: Date.now() + "-" + Math.random().toString(36).slice(2, 7),
      zeit: new Date().toISOString(),
      trainer: session?.user?.email || "Trainer",
      aktion: aktion || aenderungsText(alt, normal),
    };
    normal.aenderungen = [eintrag, ...(normal.aenderungen || [])].slice(0, 300);

    setDaten(normal);
    datenRef.current = normal;
    setStatus("speichert");

    const { error } = await supabase
      .from("app_state")
      .upsert({ id: "main", data: normal, updated_by: session.user.id });

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
function trainerEintraege(d, spielNr, name) {
  const g = d.trainerNoten?.["g" + spielNr]?.[name];
  if (!g || typeof g !== "object") return [];
  return Object.entries(g)
    .map(([id, x]) => ({ id, value: typeof x === "number" ? x : x?.value, email: typeof x === "number" ? id : (x?.email || id) }))
    .filter((x) => typeof x.value === "number");
}

function spielNote(d, spielNr, name) {
  const e = trainerEintraege(d, spielNr, name);
  if (e.length) return e.reduce((a, x) => a + x.value, 0) / e.length;
  const legacy = d.noten?.["g" + spielNr]?.[name];
  return typeof legacy === "number" ? legacy : null;
}

function formDaten(d, name) {
  const werte = d.spiele
    .filter((sp) => sp.datum && sp.datum <= heute())
    .sort((a, b) => (a.datum > b.datum ? 1 : -1))
    .map((sp) => ({ nr: sp.nr, datum: sp.datum, note: spielNote(d, sp.nr, name), pos: d.spielPositionen?.["g" + sp.nr]?.[name] || null }))
    .filter((x) => typeof x.note === "number");
  const letzte = werte.slice(-5);
  const gewichte = [1, 2, 3, 4, 5].slice(5 - letzte.length);
  const momentum = letzte.length
    ? letzte.reduce((sum, x, i) => sum + x.note * gewichte[i], 0) / gewichte.slice(-letzte.length).reduce((a, b) => a + b, 0)
    : null;
  const letzte3 = werte.slice(-3);
  const davor3 = werte.slice(-6, -3);
  const avg = (arr) => arr.length ? arr.reduce((a, x) => a + x.note, 0) / arr.length : null;
  const a = avg(letzte3), b = avg(davor3);
  const trend = a != null && b != null ? a - b : 0;
  const byPos = {};
  werte.forEach((x) => {
    if (!x.pos) return;
    (byPos[x.pos] ||= []).push(x.note);
  });
  const positionsform = Object.fromEntries(Object.entries(byPos).map(([p, arr]) => [p, arr.reduce((a,b)=>a+b,0)/arr.length]));
  const letzte5 = werte.slice(-5);
  const avg5 = letzte5.length ? letzte5.reduce((a,x)=>a+x.note,0)/letzte5.length : null;
  const avg3 = letzte3.length ? letzte3.reduce((a,x)=>a+x.note,0)/letzte3.length : null;
  return { werte, momentum, trend, positionsform, avg5, avg3 };
}

function spielerSpielStats(d, name) {
  let tore = 0, assists = 0;
  Object.values(d.spielberichte || {}).forEach((b) => {
    const st = b?.stats?.[name] || {};
    tore += Number(st.tore || 0);
    assists += Number(st.vorlagen || 0);
  });
  return { tore, assists };
}

function positionsStaerke(w, code) {
  if (w?.posStaerke && w.posStaerke[code] != null) return Math.max(0, Math.min(100, Number(w.posStaerke[code]) || 0));
  if (w?.haupt === code) return 100;
  if ((w?.neben || []).includes(code)) return 70;
  return 0;
}

function aufstellungsWert(w, code) {
  const fit = positionsStaerke(w, code) / 100;
  if (fit <= 0) return -Infinity;
  const basis = Number(w.score || 0);
  const form5 = w.avg5 == null ? basis / 10 : w.avg5;
  const momentum = w.momentum == null ? form5 : w.momentum;
  const spiele = Number(w.einsaetze || 0);
  // Neue Spieler mit kleiner Datenbasis werden nicht durch 1-2 starke/schwache Spiele überbewertet.
  const sicherheit = Math.min(1, spiele / 5);
  const formAnteil = 25 * sicherheit;
  const momentumAnteil = 10 * sicherheit;
  const basisAnteil = 45 + (25 - formAnteil) + (10 - momentumAnteil);
  const wert = basisAnteil * (basis / 100) + formAnteil * (form5 / 10) + 20 * fit + momentumAnteil * (momentum / 10);
  return wert * 100;
}

function rechne(d) {
  const relevanteTrainings = d.trainings.filter((t) => {
    if (!t.datum) return false;
    const hatEintrag = (d.anwesend[t.id] || []).length > 0;
    return t.datum <= heute() || hatEintrag;
  });
  const nTrain = relevanteTrainings.length;
  const werte = d.spieler.map((s) => {
    const trainingsFuerSpieler = relevanteTrainings.filter((t) => {
      if (s.dabeiSeit && t.datum < s.dabeiSeit) return false;
      if (s.aktivBis && t.datum > s.aktivBis) return false;
      return true;
    });
    const dabei = trainingsFuerSpieler.filter((t) => (d.anwesend[t.id] || []).includes(s.name)).length;
    const quote = trainingsFuerSpieler.length ? dabei / trainingsFuerSpieler.length : null;
    const noten = d.spiele
      .map((sp) => spielNote(d, sp.nr, s.name))
      .filter((v) => typeof v === "number");
    const oNote = noten.length ? noten.reduce((a, b) => a + b, 0) / noten.length : null;
    const form = formDaten(d, s.name);
    const stats = spielerSpielStats(d, s.name);
    const score = Math.round(
      ((oNote || 0) * 10 * d.wNote + (quote || 0) * 100 * d.wTraining) * 10
    ) / 10;
    const datenstatus = noten.length >= 5 ? "voll bewertet" : noten.length ? `provisorisch · ${noten.length} Spiel${noten.length===1?"":"e"}` : "neu · noch ohne Spielnote";
    return { ...s, trainings: dabei, quote, oNote, einsaetze: noten.length, score, ...form, ...stats, datenstatus };
  });

  // Kaderregel: Im gesamten 16er-Aufgebot wird genau ein Torwart eingeplant.
  // Die restlichen Plätze (inkl. Reserve/16. Mann) gehören Feldspielern.
  const verfuegbar = werte.filter((w) => w.aktiv !== false && w.verfuegbar && w.sperre === 0 && (!w.aktivBis || w.aktivBis >= heute()));
  const torhueter = verfuegbar.filter((w) => w.haupt === "TW").sort((a, b) => b.score - a.score);
  const fixerTW = torhueter.filter((w) => w.fix).sort((a, b) => b.score - a.score)[0];
  const gewaehlterTW = fixerTW || torhueter[0] || null;

  const feldspieler = verfuegbar.filter((w) => w.haupt !== "TW");
  const fixeFeld = feldspieler.filter((w) => w.fix).sort((a, b) => b.score - a.score);
  const feldPlaetze = Math.max(0, d.kaderGroesse - (gewaehlterTW ? 1 : 0));
  const fixeImKader = fixeFeld.slice(0, feldPlaetze);
  const freieFeldPlaetze = Math.max(0, feldPlaetze - fixeImKader.length);
  const kandidaten = feldspieler
    .filter((w) => !fixeImKader.some((f) => f.name === w.name))
    .sort((a, b) => b.score - a.score);

  const kader = {};
  if (gewaehlterTW) kader[gewaehlterTW.name] = gewaehlterTW.fix ? "fix" : "dabei";
  fixeImKader.forEach((w) => (kader[w.name] = "fix"));
  kandidaten.forEach((w, i) => {
    if (i < freieFeldPlaetze) kader[w.name] = "dabei";
    else if (i < freieFeldPlaetze + d.reserve) kader[w.name] = "reserve";
  });
  werte.forEach((w) => {
    w.kader = w.sperre > 0 ? "gesperrt" : kader[w.name] || null;
    w.imKader = w.kader === "dabei" || w.kader === "fix";
  });

  const rang = [...werte].sort((a, b) => b.score - a.score);
  rang.forEach((w, i) => (w.rang = i + 1));
  return { werte, rang, nTrain };
}

const kannSpielen = (s, code) => positionsStaerke(s, code) > 0;

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
          score: zustand.score + aufstellungsWert(w, freieSlots[j].p),
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


function positionsGruppe(code) {
  if (code === "TW") return "TW";
  if (["RV", "IV", "LV"].includes(code)) return "DEF";
  if (["DM", "ZM", "RM", "LM", "OM"].includes(code)) return "MID";
  if (code === "ST") return "ATT";
  return "SONST";
}

function spielerGruppen(w) {
  return [...new Set([w.haupt, ...(w.neben || [])].filter(Boolean).map(positionsGruppe))];
}

function bankEmpfehlung(werte, elf, max = 4) {
  // Der einzige Torwart des Kaders steht in der Startelf. Die Bank besteht nur aus Feldspielern.
  const rest = werte.filter((w) => w.imKader && w.haupt !== "TW" && !elf.includes(w.name));
  const gewählt = [];
  const ziel = ["DEF", "MID", "ATT"];

  // Erst jede Mannschaftszone möglichst einmal absichern.
  ziel.forEach((gruppe) => {
    if (gewählt.length >= max) return;
    const kandidaten = rest
      .filter((w) => !gewählt.some((g) => g.name === w.name) && spielerGruppen(w).includes(gruppe))
      .sort((a, b) => b.score - a.score);
    if (kandidaten[0]) gewählt.push(kandidaten[0]);
  });

  // Falls eine Zone nicht besetzt werden konnte, mit vielseitigen Spielern auffüllen.
  while (gewählt.length < Math.min(max, rest.length)) {
    const abgedecktePos = new Set(gewählt.flatMap((w) => [w.haupt, ...(w.neben || [])].filter(Boolean)));
    const offen = rest.filter((w) => !gewählt.some((g) => g.name === w.name));
    if (!offen.length) break;
    offen.sort((a, b) => {
      const ga = [a.haupt, ...(a.neben || [])].filter(Boolean).filter((p) => !abgedecktePos.has(p)).length * 12 + a.score;
      const gb = [b.haupt, ...(b.neben || [])].filter(Boolean).filter((p) => !abgedecktePos.has(p)).length * 12 + b.score;
      return gb - ga;
    });
    gewählt.push(offen[0]);
  }

  const gruppenZaehler = {};
  gewählt.forEach((w) => spielerGruppen(w).forEach((g) => { gruppenZaehler[g] = (gruppenZaehler[g] || 0) + 1; }));
  return gewählt.map((w) => {
    const gruppen = spielerGruppen(w);
    const einzig = gruppen.filter((g) => gruppenZaehler[g] === 1);
    const wichtigkeit = einzig.length > 0 ? "hoch" : gruppen.length > 1 ? "mittel" : "normal";
    return { ...w, bankWichtigkeit: wichtigkeit, bankGrund: gruppen.join(" / ") };
  });
}

function reserveEmpfehlung(werte, elf, bank) {
  const kandidaten = werte.filter((w) => w.kader === "reserve" && w.haupt !== "TW" && !elf.includes(w.name));
  if (!kandidaten.length) return null;
  const bankGruppen = new Set(bank.flatMap((w) => spielerGruppen(w)));
  kandidaten.sort((a, b) => {
    const ga = spielerGruppen(a).filter((g) => !bankGruppen.has(g)).length * 30 + spielerGruppen(a).length * 5 + a.score;
    const gb = spielerGruppen(b).filter((g) => !bankGruppen.has(g)).length * 30 + spielerGruppen(b).length * 5 + b.score;
    return gb - ga;
  });
  const w = kandidaten[0];
  const luecken = spielerGruppen(w).filter((g) => !bankGruppen.has(g));
  const wichtigkeit = luecken.length ? "hoch" : spielerGruppen(w).length > 1 ? "mittel" : "normal";
  return { ...w, reserveWichtigkeit: wichtigkeit, reserveGrund: luecken.length ? `schließt Lücke: ${luecken.join(" / ")}` : `deckt ${spielerGruppen(w).join(" / ")}` };
}

function meilensteine(w, d) {
  const out=[];
  if (w.trainings >= 10) out.push("10+ Trainings");
  if (w.trainings >= 25) out.push("25+ Trainings");
  if (w.einsaetze >= 5) out.push("5+ bewertete Spiele");
  if ((w.momentum||0) >= 8) out.push("Momentum 8+");
  const last5 = [...d.trainings].filter(t=>t.datum<=heute()).sort((a,b)=>a.datum>b.datum?1:-1).slice(-5);
  if (last5.length===5 && last5.every(t=>(d.anwesend[t.id]||[]).includes(w.name))) out.push("5 Trainings in Folge");
  if ((w.werte||[]).slice(-5).filter(x=>x.note>=8).length>=3) out.push("3× Note 8+ zuletzt");
  return out;
}

function sparkPath(values, width=260, height=70) {
  if (!values.length) return "";
  const min=0,max=10;
  return values.map((v,i)=>{
    const x=values.length===1?width/2:(i/(values.length-1))*width;
    const y=height-((v-min)/(max-min))*height;
    return `${i===0?'M':'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');
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
  const terminSpieler = d.spieler.filter((s)=>spielerAmDatum(s, termin?.datum || heute()));

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
    const trainings = [...d.trainings, { id, datum }].sort((a,b)=>(a.datum||"").localeCompare(b.datum||""));
    save({ ...d, trainings, anwesend: { ...d.anwesend, [id]: [] } });
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
        {da.filter(n=>terminSpieler.some(s=>s.name===n)).length} von {terminSpieler.length} da
        {termin && termin.datum > heute() && " · Termin liegt noch vor uns"}
      </div>
      <div style={{ borderTop: `1px solid ${C.linie}` }}>
        {terminSpieler.map((s) => {
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
function Noten({ d, save, session }) {
  const gespielt = [...d.spiele].sort((a, b) => (b.datum || "").localeCompare(a.datum || "") || b.nr - a.nr);
  const [nr, setNr] = useState((gespielt.find((s) => s.datum && s.datum <= heute()) || gespielt[0]).nr);
  const spiel = d.spiele.find((s) => s.nr === nr);
  const uid = session?.user?.id || "trainer";
  const email = session?.user?.email || "Trainer";

  const setze = (name, wert) => {
    const gkey = "g" + nr;
    const altMap = d.trainerNoten?.[gkey] || {};
    const pMap = { ...(altMap[name] || {}) };
    if (wert == null) delete pMap[uid];
    else pMap[uid] = { value: wert, email };
    const neuTrainer = {
      ...d.trainerNoten,
      [gkey]: { ...altMap, [name]: pMap },
    };
    const eintraege = Object.values(pMap)
      .map((x) => typeof x === "number" ? x : x?.value)
      .filter((v) => typeof v === "number");
    const avg = eintraege.length ? eintraege.reduce((a,b)=>a+b,0)/eintraege.length : null;
    const neuNoten = { ...d.noten, [gkey]: { ...(d.noten[gkey] || {}) } };
    if (avg == null) delete neuNoten[gkey][name]; else neuNoten[gkey][name] = avg;
    save({ ...d, trainerNoten: neuTrainer, noten: neuNoten }, `Bewertung ${name} gegen ${spiel?.gegner || "Gegner"} geändert`);
  };



  return (
    <div className="pb-24">
      <Kopf titel="Spielerbewertung" />
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
          {" · "}Durchschnitt aus allen Trainerbewertungen
        </div>
      )}
      <div style={{ borderTop: `1px solid ${C.linie}` }}>
        {d.spieler.filter((s)=>spielerAmDatum(s, spiel?.datum || heute())).map((s) => {
          const entries = trainerEintraege(d, nr, s.name);
          const avg = spielNote(d, nr, s.name);
          const eigener = entries.find((x) => x.id === uid)?.value ?? null;
          const st = d.spielberichte?.["g" + nr]?.stats?.[s.name] || {};
          const hinweis = [Number(st.tore||0)>0 ? `⚽ ${st.tore} Tor${Number(st.tore)===1?"":"e"}` : "", Number(st.vorlagen||0)>0 ? `🎯 ${st.vorlagen} Assist${Number(st.vorlagen)===1?"":"s"}` : ""].filter(Boolean).join(" · ");
          return (
            <div key={s.name} className="px-4 py-3" style={{ borderBottom: `1px solid ${C.linie}` }}>
              <div className="flex items-center gap-2">
                <div className="flex-1 min-w-0"><div className="font-bold truncate">{s.name}</div>{hinweis && <div className="text-xs font-bold mt-0.5" style={{color:C.rasen}}>{hinweis}</div>}</div>
                <div className="w-16 text-right">
                  <div className="text-xs" style={{ color: C.grau }}>Ø Trainer</div>
                  <div className="font-black tabular-nums" style={{ color: avg >= 8 ? C.gut : avg < 6 ? C.warn : C.tinte }}>{fmtNote(avg)}</div>
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2">
                {eigener == null ? (
                  <button onClick={() => setze(s.name, 7)} className="text-sm font-bold px-3 py-1.5 rounded-lg"
                    style={{ border: `1px solid ${C.linie}`, color: C.grau }}>meine Note setzen</button>
                ) : (
                  <>
                    <button onClick={() => setze(s.name, Math.max(0, Math.round((eigener - .25) * 100) / 100))}
                      className="w-9 h-9 rounded-lg text-lg font-black" style={{ border: `1px solid ${C.linie}` }}>–</button>
                    <div className="w-14 text-center text-lg font-black tabular-nums">{fmtNote(eigener)}</div>
                    <button onClick={() => setze(s.name, Math.min(10, Math.round((eigener + .25) * 100) / 100))}
                      className="w-9 h-9 rounded-lg text-lg font-black" style={{ border: `1px solid ${C.linie}` }}>+</button>
                    <button onClick={() => setze(s.name, null)} className="w-8 h-9 text-sm" style={{ color: C.grau }}>✕</button>
                  </>
                )}
                <div className="ml-auto text-xs text-right" style={{ color: C.grau }}>
                  {entries.length > 1 ? entries.map((x) => `${(x.email || "Trainer").split("@")[0]} ${fmtNote(x.value)}`).join(" · ")
                    : entries.length === 1 ? `1 Trainer · ${fmtNote(entries[0].value)}`
                    : avg != null ? `Altbestand · ${fmtNote(avg)}` : "noch nicht bewertet"}
                </div>
              </div>
            </div>
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
function SpielDetails({ d, save, sp }) {
  const key = "g" + sp.nr;
  const bericht = d.spielberichte?.[key] || { text: "", kommentar: "", stats: {} };
  const [kommentar, setKommentar] = useState(bericht.kommentar || "");

  useEffect(() => {
    setKommentar(bericht.kommentar || "");
  }, [key, bericht.kommentar]);

  const speichereKommentar = (wert) => {
    const aktuell = d.spielberichte?.[key] || { text: "", kommentar: "", stats: {} };
    save({
      ...d,
      spielberichte: {
        ...(d.spielberichte || {}),
        [key]: { ...aktuell, kommentar: wert },
      },
    }, `Trainer-Kommentar gegen ${sp.gegner} geändert`);
  };

  const stat = (name, feld, delta) => {
    const aktuell = d.spielberichte?.[key] || { text: "", kommentar: "", stats: {} };
    const cur = aktuell.stats?.[name] || {};
    const stats = {
      ...(aktuell.stats || {}),
      [name]: { ...cur, [feld]: Math.max(0, (cur[feld] || 0) + delta) },
    };
    save({
      ...d,
      spielberichte: {
        ...(d.spielberichte || {}),
        [key]: { ...aktuell, stats },
      },
    }, `Spielstatistik ${name} gegen ${sp.gegner} geändert`);
  };

  return <div className="mt-3 rounded-xl overflow-hidden" style={{ background: C.papier, border: `1px solid ${C.linie}` }}>
    <div className="p-3">
      <div className="font-black text-base mb-1">Trainer-Kommentar</div>
      <textarea
        value={kommentar}
        onChange={(e) => setKommentar(e.target.value)}
        onBlur={() => { if (kommentar !== (bericht.kommentar || "")) speichereKommentar(kommentar); }}
        placeholder="Was lief gut? Was müssen wir verbessern? Besondere Spielsituationen …"
        className="w-full rounded-lg p-3 text-base"
        rows="4"
        style={{ border: `1px solid ${C.linie}`, background: "#fff" }}
      />
    </div>

    <div className="px-3 py-3" style={{ borderTop: `1px solid ${C.linie}` }}>
      <div className="font-black text-base">Tore & Assists</div>
      <div className="text-sm" style={{ color: C.grau }}>Große Ansicht für schnelle Eingabe am Spieltag.</div>
    </div>
    {d.spieler.map((s) => {
      const st = bericht.stats?.[s.name] || {};
      return <div key={s.name} className="px-3 py-3" style={{ borderTop: `1px solid ${C.linie}`, background: "#fff" }}>
        <div className="font-black text-base mb-2">{s.name}</div>
        <div className="grid grid-cols-2 gap-3">
          {[["⚽ Tore", "tore"], ["A Assists", "vorlagen"]].map(([lab, f]) =>
            <div key={f} className="flex items-center justify-between gap-2 rounded-lg p-2" style={{ background: C.papier, border: `1px solid ${C.linie}` }}>
              <span className="text-sm font-bold">{lab}</span>
              <div className="flex items-center gap-2">
                <button onClick={() => stat(s.name, f, -1)} className="w-9 h-9 rounded-lg text-lg font-black" style={{ border: `1px solid ${C.linie}`, background: "#fff" }}>−</button>
                <span className="text-lg font-black tabular-nums w-7 text-center">{st[f] || 0}</span>
                <button onClick={() => stat(s.name, f, 1)} className="w-9 h-9 rounded-lg text-lg font-black" style={{ border: `1px solid ${C.linie}`, background: "#fff" }}>+</button>
              </div>
            </div>
          )}
        </div>
      </div>;
    })}
  </div>;
}

function Spielplan({ d, save }) {
  const [offen, setOffen] = useState(null);
  const neuesSpiel = () => {
    const gegner = prompt("Gegner");
    if (!gegner?.trim()) return;
    const datum = prompt("Datum (JJJJ-MM-TT)", heute()) || "";
    const zeit = prompt("Uhrzeit", "15:00") || "";
    const art = (prompt("Wettbewerb", "Freundschaft") || "Freundschaft").trim();
    const ort = (prompt("Heim oder Auswärts? H / A", "H") || "").toUpperCase();
    const nr = Math.max(0, ...d.spiele.map((s) => Number(s.nr) || 0)) + 1;
    const spiele = [...d.spiele, { nr, datum, zeit, gegner: gegner.trim(), ha: ort === "A" ? "A" : ort === "H" ? "H" : "", wb: art, tf: null, tg: null }].sort((a,b)=>(a.datum||"9999-99-99").localeCompare(b.datum||"9999-99-99") || a.nr-b.nr);
    save({ ...d, spiele }, `Spiel gegen ${gegner.trim()} angelegt`);
    setOffen(nr);
  };
  const setTor = (nr, feld, wert) => {
    const v = wert === "" ? null : Math.max(0, parseInt(wert, 10) || 0);
    save({ ...d, spiele: d.spiele.map((s) => (s.nr === nr ? { ...s, [feld]: v } : s)) });
  };
  const setDatum = (nr) => {
    const s = d.spiele.find((x) => x.nr === nr);
    const datum = prompt("Datum (JJJJ-MM-TT)", s.datum || heute());
    if (datum == null) return;
    const spiele = d.spiele.map((x) => (x.nr === nr ? { ...x, datum } : x)).sort((a,b)=>(a.datum||"9999-99-99").localeCompare(b.datum||"9999-99-99") || a.nr-b.nr);
    save({ ...d, spiele });
  };

  const gespielt = d.spiele.filter((s) => s.tf != null && s.tg != null);
  const tore = gespielt.reduce((sum, s) => sum + (s.tf || 0), 0);
  const gegentore = gespielt.reduce((sum, s) => sum + (s.tg || 0), 0);
  const siege = gespielt.filter((s) => s.tf > s.tg).length;
  const remis = gespielt.filter((s) => s.tf === s.tg).length;
  const niederlagen = gespielt.filter((s) => s.tf < s.tg).length;
  const torjaegerMap = {};
  Object.values(d.spielberichte || {}).forEach((b) => {
    Object.entries(b?.stats || {}).forEach(([name, st]) => {
      torjaegerMap[name] = (torjaegerMap[name] || 0) + (st?.tore || 0);
    });
  });
  const torjaeger = Object.entries(torjaegerMap).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]);

  return (
    <div className="pb-24">
      <Kopf titel="Spielplan" rechts={<button onClick={neuesSpiel} className="text-sm font-bold px-3 py-1.5 rounded-full" style={{background:C.rot,color:'#fff'}}>+ Spiel</button>} />
      <div className="px-4 pb-3 text-sm" style={{ color: C.grau }}>
        Bezirksliga Demo · Saison 26/27
      </div>

      <div className="px-4 pb-4">
        <div className="rounded-xl p-3" style={{ background: "#fff", border: `1px solid ${C.linie}` }}>
          <div className="font-black mb-3">Saisonstatistik</div>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div><div className="text-xl font-black">{gespielt.length}</div><div className="text-xs" style={{ color: C.grau }}>Spiele</div></div>
            <div><div className="text-xl font-black" style={{ color: C.rasen }}>{tore}</div><div className="text-xs" style={{ color: C.grau }}>Tore</div></div>
            <div><div className="text-xl font-black">{gegentore}</div><div className="text-xs" style={{ color: C.grau }}>Gegentore</div></div>
            <div><div className="text-xl font-black">{tore - gegentore > 0 ? "+" : ""}{tore - gegentore}</div><div className="text-xs" style={{ color: C.grau }}>Differenz</div></div>
          </div>
          <div className="text-xs mt-3" style={{ color: C.grau }}>{siege} Siege · {remis} Remis · {niederlagen} Niederlagen</div>
          {torjaeger.length > 0 && <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${C.linie}` }}>
            <div className="text-xs font-black mb-2">Torjäger</div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {torjaeger.slice(0, 6).map(([name, n], i) => <div key={name} className="shrink-0 px-3 py-2 rounded-lg text-xs" style={{ background: i === 0 ? "#FBF0D2" : C.papier }}>
                <span className="font-black">{name}</span> · {n} ⚽
              </div>)}
            </div>
          </div>}
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${C.linie}` }}>
        {[...d.spiele].sort((a,b)=>(a.datum||"9999-99-99").localeCompare(b.datum||"9999-99-99") || a.nr-b.nr).map((s) => {
          const hatInhalt = !!(d.spielberichte?.["g" + s.nr]?.kommentar || Object.values(d.spielberichte?.["g" + s.nr]?.stats || {}).some((st) => (st?.tore || 0) > 0 || (st?.vorlagen || 0) > 0));
          return <div key={s.nr} className="px-4 py-3" style={{ borderBottom: `1px solid ${C.linie}` }}>
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
                  {hatInhalt ? " · Kommentar/Statistik vorhanden" : ""}
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
            <button onClick={() => setOffen(offen === s.nr ? null : s.nr)} className="mt-2 text-xs font-bold px-3 py-1.5 rounded-lg" style={{ background: offen === s.nr ? C.rot : C.papier, color: offen === s.nr ? "#fff" : C.tinte, border: `1px solid ${offen === s.nr ? C.rot : C.linie}` }}>
              {offen === s.nr ? "Details schließen" : hatInhalt ? "Kommentar / Tore bearbeiten" : "Kommentar / Tore hinzufügen"}
            </button>
            {offen === s.nr && <SpielDetails d={d} save={save} sp={s} />}
          </div>;
        })}
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

  const bank = bankEmpfehlung(berechnet.werte, elf, 4);
  const reserve = reserveEmpfehlung(berechnet.werte, elf, bank);

  return (
    <div className="pb-24">
      <Kopf titel="Aufstellung" />
      <div className="px-4 pb-4">
        <div className="flex gap-2 overflow-x-auto">{Object.keys(FORMATIONEN).map((f)=><button key={f} onClick={()=>save({...d,formation:f})} className="shrink-0 px-3 py-2 rounded-full text-sm font-bold" style={{background:formation===f?C.rot:"#EFE7E3",color:formation===f?"#fff":C.grau}}>{f}</button>)}</div>
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

      <div className="px-4 pt-5 pb-2">
        <div className="text-sm font-black">Bank-Empfehlung · 4 Spieler</div>
        <div className="text-xs mt-1" style={{color:C.grau}}>Bewusst ausgeglichen: nur Feldspieler – möglichst Defensive, Mittelfeld und Offensive mehrfach abgedeckt.</div>
        <div className="text-xs mt-1" style={{color:C.grau}}>Automatik berücksichtigt Gesamtscore, letzte 5 Spiele, Positionsstärke und Momentum. Bei weniger als 5 Spielnoten wird die Form vorsichtiger gewichtet.</div>
      </div>
      <div style={{ borderTop: `1px solid ${C.linie}` }}>
        {bank.length === 0 && (
          <div className="px-4 py-4 text-sm" style={{ color: C.grau }}>
            Niemand übrig – im Sonntagskader stehen nur die elf.
          </div>
        )}
        {bank.map((w, i) => (
          <Zeile key={w.name}>
            <span className="text-xs font-black w-5" style={{color:C.grau}}>{i + 12}.</span>
            <div className="flex-1 min-w-0">
              <div className="font-bold truncate">{w.name}</div>
              <div className="text-xs" style={{color:C.grau}}>{w.bankGrund} · Wichtigkeit {w.bankWichtigkeit}</div>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: "#F0E9E5", color: C.grau }}>{w.haupt}</span>
            <span className="tabular-nums font-black w-12 text-right">{fmtNote(w.oNote)}</span>
          </Zeile>
        ))}
      </div>

      <div className="px-4 pt-5 pb-2">
        <div className="text-sm font-black">16. Mann · Reserve</div>
        <div className="text-xs mt-1" style={{color:C.grau}}>Erste Nachrück-Option, passend zur Abdeckung der vier Bankspieler.</div>
      </div>
      <div style={{ borderTop: `1px solid ${C.linie}`, borderBottom: `1px solid ${C.linie}` }}>
        {reserve ? (
          <Zeile>
            <span className="text-xs font-black w-5" style={{color:'#8A6D1F'}}>16.</span>
            <div className="flex-1 min-w-0">
              <div className="font-black truncate">{reserve.name}</div>
              <div className="text-xs" style={{color:C.grau}}>{reserve.reserveGrund} · Wichtigkeit {reserve.reserveWichtigkeit}</div>
            </div>
            <span className="text-xs font-bold px-2 py-1 rounded" style={{background:'#FBF0D2',color:'#8A6D1F'}}>RESERVE</span>
            <span className="tabular-nums font-black w-12 text-right">{fmtNote(reserve.oNote)}</span>
          </Zeile>
        ) : (
          <div className="px-4 py-4 text-sm" style={{color:C.grau}}>Kein Reserve-Spieler festgelegt.</div>
        )}
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


/* ---------------------------------------------------------------- Spielerprofile / Analyse */
function Spielerprofile({ d, berechnet }) {
  const [name, setName] = useState(berechnet.rang[0]?.name || d.spieler[0]?.name);
  const w = berechnet.werte.find((x)=>x.name===name) || berechnet.werte[0];
  if (!w) return null;
  const ms = meilensteine(w,d);
  const kurve=(w.werte||[]).slice(-10);
  const entries = d.spiele.map(sp=>({sp, trainer:trainerEintraege(d,sp.nr,w.name), avg:spielNote(d,sp.nr,w.name)})).filter(x=>x.avg!=null).slice(-8).reverse();
  return <div className="pb-24">
    <Kopf titel="Spielerprofil" />
    <div className="px-4 pb-4">
      <select value={w.name} onChange={e=>setName(e.target.value)} className="w-full rounded-xl px-3 py-3 font-bold" style={{border:`1px solid ${C.linie}`,background:'#fff'}}>
        {[...d.spieler].sort((a,b)=>a.name.localeCompare(b.name,'de')).map(s=><option key={s.name}>{s.name}</option>)}
      </select>
    </div>
    <div className="px-4">
      <div className="rounded-2xl p-4" style={{background:'#fff',border:`1px solid ${C.linie}`}}>
        <div className="flex justify-between gap-3">
          <div><div className="text-2xl font-black">{w.name}</div><div className="text-sm" style={{color:C.grau}}>{w.haupt||'—'}{(w.neben||[]).length?` · Alternativ ${(w.neben||[]).join(', ')}`:''}</div></div>
          <div className="text-right"><div className="text-xs" style={{color:C.grau}}>Score</div><div className="text-2xl font-black" style={{color:C.rot}}>{w.score.toFixed(1).replace('.',',')}</div></div>
        </div>
        <div className="flex gap-2 flex-wrap mt-4">
          <span className="text-xs font-bold px-2 py-1 rounded" style={{background:C.rasenHell,color:C.rasen}}>Saison Ø {fmtNote(w.oNote)}</span>
          <span className="text-xs font-bold px-2 py-1 rounded" style={{background:C.rasenHell,color:C.rasen}}>Letzte 5 Ø {fmtNote(w.avg5)}</span>
          <span className="text-xs font-bold px-2 py-1 rounded" style={{background:C.rasenHell,color:C.rasen}}>Letzte 3 Ø {fmtNote(w.avg3)}</span>
          <span className="text-xs font-bold px-2 py-1 rounded" style={{background:'#F0E9E5'}}>Training seit {w.dabeiSeit ? fmtDatum(w.dabeiSeit) : 'Eintritt'} · {fmtProz(w.quote)}</span>
          <span className="text-xs font-bold px-2 py-1 rounded" style={{background:'#FBF0D2',color:'#8A6D1F'}}>Momentum {fmtNote(w.momentum)}</span>
          <span className="text-xs font-bold px-2 py-1 rounded" style={{background:w.trend>.25?C.rasenHell:w.trend<-.25?'#FAE3E0':'#F0E9E5',color:w.trend>.25?C.rasen:w.trend<-.25?C.warn:C.grau}}>Form {w.trend>.25?'↑':w.trend<-.25?'↓':'→'}</span>
          <span className="text-xs font-bold px-2 py-1 rounded" style={{background:'#F0E9E5'}}>⚽ {w.tore || 0}</span>
          <span className="text-xs font-bold px-2 py-1 rounded" style={{background:'#F0E9E5'}}>A {w.assists || 0}</span>
          <span className="text-xs font-bold px-2 py-1 rounded" style={{background:w.einsaetze>=5?'#E8F4EA':'#FFF3D6',color:w.einsaetze>=5?C.rasen:'#8A6D1F'}}>{w.datenstatus}</span>
        </div>
      </div>
    </div>
    <div className="px-4 pt-5"><div className="font-black mb-2">Formkurve · letzte 10 Spiele</div>
      <div className="rounded-xl p-3" style={{background:'#fff',border:`1px solid ${C.linie}`}}>
        {kurve.length?<><svg viewBox="0 0 260 70" className="w-full" style={{height:100}}><line x1="0" y1="35" x2="260" y2="35" stroke={C.linie}/><path d={sparkPath(kurve.map(x=>x.note))} fill="none" stroke={C.rot} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg><div className="flex justify-between text-xs" style={{color:C.grau}}>{kurve.map((x,i)=><span key={i}>{x.note.toFixed(1)}</span>)}</div></>:<div className="text-sm" style={{color:C.grau}}>Noch keine Spielbewertungen.</div>}
      </div>
    </div>
    <div className="px-4 pt-5"><div className="font-black mb-2">Positionsform & Eignung</div><div className="flex gap-2 flex-wrap">{[...new Set([w.haupt,...(w.neben||[])].filter(Boolean))].map((p)=><span key={p} className="px-3 py-2 rounded-lg text-sm font-bold" style={{background:C.rasenHell,color:C.rasen}}>{p} · {positionsStaerke(w,p)} % {w.positionsform?.[p]!=null?`· Form ${fmtNote(w.positionsform[p])}`:''}</span>)}</div></div>
    <div className="px-4 pt-5"><div className="font-black mb-2">Meilensteine</div><div className="flex gap-2 flex-wrap">{ms.length?ms.map(x=><span key={x} className="px-3 py-2 rounded-lg text-xs font-bold" style={{background:'#FBF0D2',color:'#8A6D1F'}}>★ {x}</span>):<span className="text-sm" style={{color:C.grau}}>Noch kein Meilenstein erreicht.</span>}</div></div>
    <div className="px-4 pt-5"><div className="font-black mb-2">Trainervergleich</div><div className="rounded-xl overflow-hidden" style={{border:`1px solid ${C.linie}`,background:'#fff'}}>
      {entries.length?entries.map(({sp,trainer,avg})=><div key={sp.nr} className="px-3 py-3" style={{borderBottom:`1px solid ${C.linie}`}}><div className="flex justify-between"><span className="font-bold truncate">{sp.gegner}</span><span className="font-black">Ø {fmtNote(avg)}</span></div><div className="text-xs mt-1" style={{color:C.grau}}>{trainer.length?trainer.map(t=>`${(t.email||'Trainer').split('@')[0]} ${fmtNote(t.value)}`).join(' · '):'Altbewertung ohne Trainer-Zuordnung'}</div></div>):<div className="p-4 text-sm" style={{color:C.grau}}>Noch keine Vergleiche vorhanden.</div>}
    </div></div>
  </div>;
}

/* ---------------------------------------------------------------- Spielbericht */
function Spielbericht({ d, save }) {
  const gespielt=[...d.spiele].filter(s=>s.datum&&s.datum<=heute()).sort((a,b)=>b.datum.localeCompare(a.datum));
  const [nr,setNr]=useState(gespielt[0]?.nr || d.spiele[0]?.nr);
  const sp=d.spiele.find(x=>x.nr===nr); if(!sp) return null;
  const key='g'+nr; const b=d.spielberichte?.[key] || {text:'',stats:{}};
  const [draft,setDraft]=useState(b.text||'');
  useEffect(()=>setDraft(b.text||''),[nr,b.text]);
  const setText=(text)=>save({...d,spielberichte:{...d.spielberichte,[key]:{...b,text}}},`Spielbericht gegen ${sp.gegner} geändert`);
  const stat=(name,feld,delta)=>{const cur=b.stats?.[name]||{}; const stats={...(b.stats||{}),[name]:{...cur,[feld]:Math.max(0,(cur[feld]||0)+delta)}};save({...d,spielberichte:{...d.spielberichte,[key]:{...b,stats}}},`Spielstatistik ${name} geändert`)};
  return <div className="pb-24"><Kopf titel="Spielbericht"/><div className="px-4 pb-3 flex gap-2 overflow-x-auto">{gespielt.map(s=><button key={s.nr} onClick={()=>setNr(s.nr)} className="shrink-0 px-3 py-2 rounded-lg text-sm font-bold" style={{background:s.nr===nr?C.rot:'#fff',color:s.nr===nr?'#fff':C.tinte,border:`1px solid ${s.nr===nr?C.rot:C.linie}`}}>{s.gegner}</button>)}</div>
    <div className="px-4"><div className="rounded-xl p-4" style={{background:'#fff',border:`1px solid ${C.linie}`}}><div className="font-black text-lg">{sp.gegner} {sp.tf!=null?`${sp.tf}:${sp.tg}`:''}</div><div className="text-xs mb-3" style={{color:C.grau}}>{fmtDatum(sp.datum)} · {sp.ha==='H'?'Heim':sp.ha==='A'?'Auswärts':''}</div><textarea value={draft} onChange={e=>setDraft(e.target.value)} onBlur={()=>{if(draft!==(b.text||''))setText(draft)}} placeholder="Spielverlauf, taktische Beobachtungen, besondere Situationen …" className="w-full rounded-lg p-3" rows="5" style={{border:`1px solid ${C.linie}`,background:C.papier}}/></div></div>
    <div className="px-4 pt-5 pb-2"><div className="font-black">Spielerstatistik</div><div className="text-xs" style={{color:C.grau}}>Tore, Vorlagen und Karten für den Spielbericht.</div></div>
    {d.spieler.map(s=>{const st=b.stats?.[s.name]||{};return <div key={s.name} className="px-4 py-2 flex items-center gap-2" style={{borderTop:`1px solid ${C.linie}`}}><span className="font-bold flex-1 truncate">{s.name}</span>{[['⚽','tore'],['A','vorlagen'],['🟨','gelb']].map(([lab,f])=><div key={f} className="flex items-center gap-1"><button onClick={()=>stat(s.name,f,-1)} className="w-7 h-7 rounded" style={{border:`1px solid ${C.linie}`}}>−</button><span className="text-xs w-8 text-center">{lab} {st[f]||0}</span><button onClick={()=>stat(s.name,f,1)} className="w-7 h-7 rounded" style={{border:`1px solid ${C.linie}`}}>+</button></div>)}</div>})}
  </div>;
}

/* ---------------------------------------------------------------- Verlauf & Export */
function VerlaufExport({ d, save, berechnet }) {
  const escXml=(v)=>String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
  const excelExport=async()=>{
    const rows=[["Spieler","Hauptposition","Alternativpositionen","Positionsstärken","Trainings","Trainingsquote","Ø Note","Momentum","Score","Einsätze","Tore","Assists"]];
    berechnet.werte.forEach(w=>rows.push([w.name,w.haupt,(w.neben||[]).join(' | '),Object.entries(w.posStaerke||{}).map(([p,v])=>`${p}:${v}%`).join(' | '),w.trainings,fmtProz(w.quote),w.oNote?.toFixed(2)||'',w.momentum?.toFixed(2)||'',w.score.toFixed(1),w.einsaetze,w.tore||0,w.assists||0]));
    rows.push([],['Spielbewertungen'],['Spiel','Datum','Spieler','Ø Trainer','Position']);
    d.spiele.forEach(sp=>d.spieler.forEach(s=>{const n=spielNote(d,sp.nr,s.name);if(n!=null)rows.push([sp.gegner,sp.datum,s.name,n.toFixed(2),d.spielPositionen?.['g'+sp.nr]?.[s.name]||''])}));

    const sheetRows=rows.map(r=>`<Row>${r.map(v=>`<Cell><Data ss:Type="String">${escXml(v)}</Data></Cell>`).join('')}</Row>`).join('');
    const xml=`<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>\n<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="HAQQ Pro"><Table>${sheetRows}</Table></Worksheet></Workbook>`;
    const filename=`haqq-pro-export-${heute()}.xls`;
    const blob=new Blob([xml],{type:'application/vnd.ms-excel;charset=utf-8'});
    const file=new File([blob],filename,{type:'application/vnd.ms-excel'});

    // iPhone/PWA: Teilen-Dialog ist zuverlässiger als ein unsichtbarer Browser-Download.
    if (navigator.share && navigator.canShare?.({files:[file]})) {
      try { await navigator.share({files:[file],title:'HAQQ Pro Excel Export'}); return; }
      catch (e) { if (e?.name === 'AbortError') return; }
    }

    // Desktop/Android-Fallback: echter Download-Link im DOM.
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url; a.download=filename; a.style.display='none';
    document.body.appendChild(a); a.click();
    setTimeout(()=>{a.remove();URL.revokeObjectURL(url)},1500);
  };
  const excelImport=async(file)=>{
    if(!file) return;
    try {
      const text=await file.text();
      let rows=[];
      if(file.name.toLowerCase().endsWith('.xls')) {
        const doc=new DOMParser().parseFromString(text,'application/xml');
        rows=[...doc.getElementsByTagName('Row')].map(r=>[...r.getElementsByTagName('Data')].map(x=>x.textContent||''));
      } else {
        rows=text.split(/\r?\n/).filter(Boolean).map(line=>line.split(/[;,]/).map(x=>x.replace(/^"|"$/g,'').trim()));
      }
      if(!rows.length) throw new Error('leer');
      const neu=JSON.parse(JSON.stringify(d));
      const head=rows.findIndex(r=>r[0]==='Spieler');
      if(head>=0){
        for(let i=head+1;i<rows.length && rows[i][0];i++){
          const [name,haupt,alternativen,staerken]=rows[i];
          const sp=neu.spieler.find(s=>s.name===name); if(!sp) continue;
          sp.haupt=haupt||sp.haupt;
          sp.neben=(alternativen||'').split('|').map(x=>x.trim()).filter(Boolean);
          sp.posStaerke=sp.posStaerke||{};
          if(sp.haupt && sp.posStaerke[sp.haupt]==null) sp.posStaerke[sp.haupt]=100;
          sp.neben.forEach(p=>{if(sp.posStaerke[p]==null) sp.posStaerke[p]=70});
          (staerken||'').split('|').map(x=>x.trim()).filter(Boolean).forEach(x=>{const [p,v]=x.split(':'); const n=Number(String(v||'').replace('%','')); if(p && Number.isFinite(n)) sp.posStaerke[p.trim()]=n;});
        }
      }
      const bh=rows.findIndex(r=>r[0]==='Spiel' && r[2]==='Spieler');
      if(bh>=0){
        for(let i=bh+1;i<rows.length && rows[i][0];i++){
          const [gegner,datum,name,note,pos]=rows[i];
          const sp=neu.spiele.find(s=>s.gegner===gegner && (!datum || s.datum===datum));
          if(!sp || !name || note==='') continue;
          const n=Number(String(note).replace(',','.')); if(!Number.isFinite(n)) continue;
          const key='g'+sp.nr; neu.noten[key]={...(neu.noten[key]||{}),[name]:n};
          if(pos) neu.spielPositionen[key]={...(neu.spielPositionen[key]||{}),[name]:pos};
        }
      }
      save(neu,`Excel/CSV importiert: ${file.name}`);
      alert('Import erfolgreich. Positionen und Spielbewertungen wurden übernommen.');
    } catch(e) { console.error(e); alert('Import nicht erkannt. Unterstützt werden der Export dieser App (.xls) oder CSV mit passenden Spalten.'); }
  };
  return <div className="pb-24"><Kopf titel="Verlauf & Export" rechts={<div className="flex gap-2"><label className="text-sm font-bold px-3 py-1.5 rounded-full cursor-pointer" style={{background:'#fff',color:C.rot,border:`1px solid ${C.rot}`}}>Import<input type="file" accept=".xls,.csv,text/csv,application/vnd.ms-excel" className="hidden" onChange={(e)=>{excelImport(e.target.files?.[0]);e.target.value=''}}/></label><button onClick={excelExport} className="text-sm font-bold px-3 py-1.5 rounded-full" style={{background:C.rot,color:'#fff'}}>Excel Export</button></div>}/><div className="px-4 pb-3 text-sm" style={{color:C.grau}}>Export: Excel-Datei. Import: der Export dieser App (.xls) oder CSV. Positionen, Positionsstärken und Spielbewertungen werden übernommen.</div><div style={{borderTop:`1px solid ${C.linie}`}}>{(d.aenderungen||[]).length?(d.aenderungen||[]).map(x=><div key={x.id} className="px-4 py-3" style={{borderBottom:`1px solid ${C.linie}`}}><div className="font-bold">{x.aktion}</div><div className="text-xs mt-1" style={{color:C.grau}}>{x.trainer} · {new Date(x.zeit).toLocaleString('de-DE')}</div></div>):<div className="p-4 text-sm" style={{color:C.grau}}>Der Verlauf beginnt mit Änderungen ab Version 2.</div>}</div></div>;
}

/* ---------------------------------------------------------------- Positionen */
function Positionen({ d, save }) {
  const upd = (name, feld, wert) =>
    save({ ...d, spieler: d.spieler.map((s) => (s.name === name ? { ...s, [feld]: wert } : s)) });

  const neuerSpieler = () => {
    const name = prompt("Name des Spielers");
    if (!name || !name.trim()) return;
    if (d.spieler.some((s) => s.name === name.trim())) { alert("Den Namen gibt es schon."); return; }
    const dabeiSeit = prompt("Dabei seit (JJJJ-MM-TT)", heute()) || heute();
    save({
      ...d,
      spieler: [...d.spieler, { name: name.trim(), haupt: "", neben: [], posStaerke: {}, sperre: 0, verfuegbar: true, fix: false, dabeiSeit, aktivBis: "", aktiv: true }]
        .sort((a, b) => a.name.localeCompare(b.name, "de")),
    });
  };

  return (
    <div className="pb-24">
      <Kopf titel="Positionen" rechts={
        <button onClick={neuerSpieler} className="text-sm font-bold px-3 py-1.5 rounded-full"
          style={{ background: C.rot, color: "#fff" }}>+ Spieler</button>} />
      <div className="px-4 pb-3 text-sm" style={{ color: C.grau }}>
        Eintrittsdatum verhindert eine unfair schlechte Trainingsquote bei Neuzugängen. Positionsstärken fließen direkt in die automatische Aufstellung ein.
      </div>
      <div style={{ borderTop: `1px solid ${C.linie}` }}>
        {d.spieler.map((s) => (
          <div key={s.name} className="px-4 py-3" style={{ borderBottom: `1px solid ${C.linie}` }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="font-bold flex-1">{s.name}</div>
              <button onClick={()=>upd(s.name,"aktiv",s.aktiv===false)} className="text-xs font-bold px-2 py-1 rounded" style={{background:s.aktiv===false?'#FAE3E0':C.rasenHell,color:s.aktiv===false?C.warn:C.rasen}}>{s.aktiv===false?'inaktiv':'aktiv'}</button>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <label className="text-xs" style={{color:C.grau}}>Dabei seit<input type="date" value={s.dabeiSeit||''} onChange={e=>upd(s.name,"dabeiSeit",e.target.value)} className="mt-1 w-full rounded-lg px-2 py-1.5" style={{border:`1px solid ${C.linie}`,background:'#fff',color:C.tinte}}/></label>
              <label className="text-xs" style={{color:C.grau}}>Aktiv bis<input type="date" value={s.aktivBis||''} onChange={e=>upd(s.name,"aktivBis",e.target.value)} className="mt-1 w-full rounded-lg px-2 py-1.5" style={{border:`1px solid ${C.linie}`,background:'#fff',color:C.tinte}}/></label>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {POS.map((p) => {
                const haupt = s.haupt === p;
                const neben = (s.neben || []).includes(p);
                return (
                  <button key={p}
                    onClick={() => {
                      if (haupt) {
                        const neuStaerke = { ...(s.posStaerke || {}) }; delete neuStaerke[p];
                        save({ ...d, spieler: d.spieler.map((x) => x.name === s.name ? { ...x, haupt: "", posStaerke: neuStaerke } : x) }); return;
                      }
                      if (neben) {
                        const neuStaerke = { ...(s.posStaerke || {}) }; delete neuStaerke[p];
                        save({ ...d, spieler: d.spieler.map((x) => x.name === s.name ? { ...x, neben: (x.neben || []).filter((q) => q !== p), posStaerke: neuStaerke } : x) }); return;
                      }
                      if (!s.haupt) save({ ...d, spieler: d.spieler.map((x) => x.name === s.name ? { ...x, haupt: p, posStaerke: { ...(x.posStaerke || {}), [p]: 100 } } : x) });
                      else save({ ...d, spieler: d.spieler.map((x) => x.name === s.name ? { ...x, neben: [...(x.neben || []), p], posStaerke: { ...(x.posStaerke || {}), [p]: 70 } } : x) });
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
            {[...new Set([s.haupt, ...(s.neben || [])].filter(Boolean))].length > 0 && <div className="mt-3 space-y-2">
              {[...new Set([s.haupt, ...(s.neben || [])].filter(Boolean))].map((p) => <div key={p} className="flex items-center gap-3">
                <span className="w-8 text-xs font-black">{p}</span>
                <input type="range" min="10" max="100" step="5" value={positionsStaerke(s,p)} onChange={(e) => upd(s.name, "posStaerke", { ...(s.posStaerke || {}), [p]: Number(e.target.value) })} className="flex-1" style={{accentColor:C.rot}} />
                <span className="w-12 text-right text-xs font-black">{positionsStaerke(s,p)} %</span>
              </div>)}
              <div className="text-xs" style={{color:C.grau}}>100 % = beste Position. Beispiel: LM 50 % wird in der automatischen Aufstellung deutlich schwächer gewichtet.</div>
            </div>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- App */
const TABS = [
  ["Training", Training], ["Bewertung", Noten], ["Spieler", Spielerprofile],
  ["Übersicht", Uebersicht], ["Aushang", Aushang], ["Spielplan", Spielplan],
  ["Kader", Kaderplanung], ["Aufstellung", Aufstellung],
  ["Positionen", Positionen], ["Verlauf", VerlaufExport],
];

function Login() {
  const [modus, setModus] = useState("login");
  const [email, setEmail] = useState("");
  const [passwort, setPasswort] = useState("");
  const [meldung, setMeldung] = useState("");
  const [erfolg, setErfolg] = useState(false);
  const [busy, setBusy] = useState(false);

  const wechsel = (neu) => {
    setModus(neu);
    setMeldung("");
    setErfolg(false);
    setPasswort("");
  };

  const senden = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setMeldung("");
    setErfolg(false);

    try {
      if (modus === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password: passwort });
        if (error) throw error;
        return;
      }

      if (modus === "registrieren") {
        if (passwort.length < 8) {
          setMeldung("Bitte mindestens 8 Zeichen für das Passwort verwenden.");
          return;
        }
        const { data, error } = await supabase.auth.signUp({
          email,
          password: passwort,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        if (data.session) {
          setErfolg(true);
          setMeldung("Konto erstellt. Du wirst angemeldet …");
        } else {
          setErfolg(true);
          setMeldung("Konto erstellt. Bitte bestätige jetzt die E-Mail, die Supabase dir geschickt hat.");
        }
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      if (error) throw error;
      setErfolg(true);
      setMeldung("E-Mail zum Zurücksetzen wurde gesendet. Bitte öffne den Link in der E-Mail.");
    } catch (error) {
      console.error(error);
      if (modus === "login") setMeldung("Anmeldung fehlgeschlagen. E-Mail oder Passwort prüfen.");
      else if (modus === "registrieren") setMeldung(error?.message || "Registrierung fehlgeschlagen. Bitte erneut versuchen.");
      else setMeldung(error?.message || "Zurücksetzen fehlgeschlagen. Bitte erneut versuchen.");
    } finally {
      setBusy(false);
    }
  };

  const titel = modus === "login" ? "Trainer-Login" : modus === "registrieren" ? "Konto erstellen" : "Passwort vergessen";
  const beschreibung = modus === "login"
    ? "Melde dich mit deinem Trainerkonto an. Danach siehst du den gemeinsamen Team-Datenstand."
    : modus === "registrieren"
      ? "Erstelle dein HAQQ-Pro-Trainerkonto. Je nach Supabase-Einstellung bestätigst du danach einmal deine E-Mail."
      : "Gib deine E-Mail ein. Du erhältst einen Link, mit dem du ein neues Passwort setzen kannst.";

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: C.papier, color: C.tinte }}>
      <form onSubmit={senden} className="w-full max-w-sm rounded-2xl p-5 shadow-sm" style={{ background: "#fff", border: `1px solid ${C.linie}` }}>
        <div className="text-xs font-black tracking-widest mb-2" style={{ color: C.rot }}>HAQQ PRO</div>
        <h1 className="text-2xl font-black mb-1">{titel}</h1>
        <p className="text-sm mb-5" style={{ color: C.grau }}>{beschreibung}</p>

        <label className="block text-xs font-bold mb-1">E-Mail</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required autoComplete="email"
          className="w-full rounded-lg px-3 py-2 mb-3" style={{ border: `1px solid ${C.linie}`, background: C.papier }} />

        {modus !== "reset" && <>
          <label className="block text-xs font-bold mb-1">Passwort</label>
          <input value={passwort} onChange={(e) => setPasswort(e.target.value)} type="password" required minLength={modus === "registrieren" ? 8 : undefined}
            autoComplete={modus === "login" ? "current-password" : "new-password"}
            className="w-full rounded-lg px-3 py-2 mb-3" style={{ border: `1px solid ${C.linie}`, background: C.papier }} />
          {modus === "registrieren" && <div className="text-xs -mt-1 mb-3" style={{ color: C.grau }}>Mindestens 8 Zeichen.</div>}
        </>}

        {meldung && <div className="text-sm mb-3 rounded-lg px-3 py-2" style={{ color: erfolg ? C.gut : C.warn, background: erfolg ? C.rasenHell : "#FAE3E0" }}>{meldung}</div>}

        <button disabled={busy} className="w-full py-2.5 rounded-lg font-black text-white" style={{ background: C.rot, opacity: busy ? .6 : 1 }}>
          {busy ? "Bitte warten …" : modus === "login" ? "Anmelden" : modus === "registrieren" ? "Kostenlos registrieren" : "Reset-Link senden"}
        </button>

        <div className="mt-4 flex flex-col gap-2 text-center text-sm font-bold">
          {modus === "login" ? <>
            <button type="button" onClick={() => wechsel("reset")} style={{ color: C.grau }}>Passwort vergessen?</button>
            <button type="button" onClick={() => wechsel("registrieren")} style={{ color: C.rot }}>Noch kein Konto? Registrieren</button>
          </> : (
            <button type="button" onClick={() => wechsel("login")} style={{ color: C.rot }}>Zurück zur Anmeldung</button>
          )}
        </div>
      </form>
    </div>
  );
}

function NeuesPasswort({ onFertig }) {
  const [passwort, setPasswort] = useState("");
  const [wiederholen, setWiederholen] = useState("");
  const [meldung, setMeldung] = useState("");
  const [busy, setBusy] = useState(false);

  const speichern = async (e) => {
    e.preventDefault();
    setMeldung("");
    if (passwort.length < 8) return setMeldung("Bitte mindestens 8 Zeichen verwenden.");
    if (passwort !== wiederholen) return setMeldung("Die beiden Passwörter stimmen nicht überein.");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: passwort });
    setBusy(false);
    if (error) return setMeldung(error.message || "Passwort konnte nicht geändert werden.");
    alert("Dein Passwort wurde geändert.");
    onFertig();
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: C.papier, color: C.tinte }}>
      <form onSubmit={speichern} className="w-full max-w-sm rounded-2xl p-5 shadow-sm" style={{ background: "#fff", border: `1px solid ${C.linie}` }}>
        <div className="text-xs font-black tracking-widest mb-2" style={{ color: C.rot }}>HAQQ PRO</div>
        <h1 className="text-2xl font-black mb-1">Neues Passwort</h1>
        <p className="text-sm mb-5" style={{ color: C.grau }}>Lege jetzt dein neues Passwort fest.</p>
        <label className="block text-xs font-bold mb-1">Neues Passwort</label>
        <input value={passwort} onChange={(e) => setPasswort(e.target.value)} type="password" required minLength={8} autoComplete="new-password"
          className="w-full rounded-lg px-3 py-2 mb-3" style={{ border: `1px solid ${C.linie}`, background: C.papier }} />
        <label className="block text-xs font-bold mb-1">Passwort wiederholen</label>
        <input value={wiederholen} onChange={(e) => setWiederholen(e.target.value)} type="password" required minLength={8} autoComplete="new-password"
          className="w-full rounded-lg px-3 py-2 mb-3" style={{ border: `1px solid ${C.linie}`, background: C.papier }} />
        {meldung && <div className="text-sm mb-3" style={{ color: C.warn }}>{meldung}</div>}
        <button disabled={busy} className="w-full py-2.5 rounded-lg font-black text-white" style={{ background: C.rot, opacity: busy ? .6 : 1 }}>
          {busy ? "Speichert …" : "Passwort speichern"}
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
      alert("Auf iPhone: unten auf Teilen tippen und dann „Zum Home-Bildschirm“ auswählen. Danach startet HAQQ Pro wie eine eigene App.");
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
          {status === "laden" ? "Teamdaten werden geladen …" : "Daten konnten nicht geladen werden. Supabase-Einstellungen prüfen."}
        </div>
      </div>
    );
  }

  const Inhalt = TABS[tab][1];

  const abmelden = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error(error);
      alert("Abmelden fehlgeschlagen. Bitte erneut versuchen.");
    }
  };

  return (
    <div className="min-h-screen" style={{ background: C.papier, color: C.tinte,
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      <div className="app-header px-4 pb-3" style={{ background: C.rot }}>
        <div className="flex items-center justify-between gap-3">
          <div className="text-white">
            <div className="text-lg font-black leading-none tracking-tight">HAQQ PRO DEMO</div>
            <div className="text-xs opacity-80 mt-1">Demo-Team · Saison 26/27</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-white text-right" style={{ opacity: status === "speichert" ? 0.9 : 0.65 }}>
              {status === "speichert" ? "speichert …" : status === "fehler" ? "Speicherfehler" : "live synchronisiert"}
            </div>
            <InstallAppButton />
            <button
              onClick={abmelden}
              className="text-xs font-bold px-2 py-1 rounded"
              style={{ background: "rgba(255,255,255,.14)", color: "#fff", border: "1px solid rgba(255,255,255,.28)" }}
            >
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

      <Inhalt d={d} save={save} berechnet={berechnet} session={session} />

      <div className="px-4 py-4 text-xs" style={{ color: C.grau }}>
        Gemeinsamer Team-Datenstand über Supabase · Änderungen werden live zwischen euren Geräten synchronisiert.
      </div>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(undefined);
  const [passwortReset, setPasswortReset] = useState(false);

  useEffect(() => {
    if (!supabaseConfigured || !supabase) {
      setSession(null);
      return;
    }
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      if (event === "PASSWORD_RECOVERY") setPasswortReset(true);
    });
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

  if (passwortReset) return <NeuesPasswort onFertig={() => setPasswortReset(false)} />;

  return session ? <HauptApp session={session} /> : <Login />;
}