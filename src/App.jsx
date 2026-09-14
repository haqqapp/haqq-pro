import React, { useEffect, useMemo, useState } from 'react';
import { Users, CalendarDays, ClipboardList, Trophy, Settings, Plus, Check, X, ShieldCheck } from 'lucide-react';

const KEY = 'haqq-pro-v1';
const POS = ['TW','IV','LV','RV','DM','ZM','OM','LM','RM','MS'];
const emptyState = {
  team: null,
  players: [],
  trainings: [],
  matches: [],
  squadSize: 18,
  attendance: {},
  matchRatings: {}
};

function loadState(){
  try { return { ...emptyState, ...(JSON.parse(localStorage.getItem(KEY)) || {}) }; }
  catch { return emptyState; }
}

export default function App(){
  const [data,setData] = useState(loadState);
  const [tab,setTab] = useState('dashboard');
  useEffect(()=>localStorage.setItem(KEY, JSON.stringify(data)),[data]);

  if(!data.team) return <Onboarding onCreate={(team)=>setData({...data,team})}/>;

  const nav=[
    ['dashboard','Übersicht',ShieldCheck],['training','Training',CalendarDays],['players','Spieler',Users],
    ['matches','Spiele',Trophy],['squad','Kader',ClipboardList],['settings','Team',Settings]
  ];
  return <div className="app-shell">
    <header className="topbar">
      <div><div className="brand">HAQQ <span>PRO</span></div><div className="teamline">{data.team.club || 'Verein'} · {data.team.name} · {data.team.season}</div></div>
      <div className="save-dot">lokal gespeichert</div>
    </header>
    <nav className="tabs">{nav.map(([id,label,Icon])=><button key={id} onClick={()=>setTab(id)} className={tab===id?'active':''}><Icon size={16}/>{label}</button>)}</nav>
    <main>
      {tab==='dashboard' && <Dashboard data={data}/>} 
      {tab==='training' && <Training data={data} setData={setData}/>} 
      {tab==='players' && <Players data={data} setData={setData}/>} 
      {tab==='matches' && <Matches data={data} setData={setData}/>} 
      {tab==='squad' && <Squad data={data} setData={setData}/>} 
      {tab==='settings' && <TeamSettings data={data} setData={setData}/>} 
    </main>
    <footer>HAQQ Pro · neue, unabhängige Kunden-App · nächste Ausbaustufe: Login, Supabase, Trainer-Einladungen</footer>
  </div>
}

function Onboarding({onCreate}){
  const [club,setClub]=useState(''); const [name,setName]=useState(''); const [season,setSeason]=useState('2026/27');
  return <div className="onboarding"><div className="card setup">
    <div className="logo-badge">H</div><h1>HAQQ Pro</h1><p>Richte deine Mannschaft ein. Diese neue App enthält keine Firtinaspor-Daten.</p>
    <label>Verein<input value={club} onChange={e=>setClub(e.target.value)} placeholder="z. B. SV Musterstadt"/></label>
    <label>Mannschaft<input value={name} onChange={e=>setName(e.target.value)} placeholder="z. B. 1. Mannschaft"/></label>
    <label>Saison<input value={season} onChange={e=>setSeason(e.target.value)} /></label>
    <button className="primary" disabled={!name.trim()} onClick={()=>onCreate({club:club.trim(),name:name.trim(),season:season.trim()})}>Team anlegen</button>
  </div></div>
}

function Dashboard({data}){
  const lastTraining=[...data.trainings].sort((a,b)=>b.date.localeCompare(a.date))[0];
  const attended=lastTraining ? (data.attendance[lastTraining.id]||[]).length : 0;
  return <Page title="Übersicht" subtitle="Alles Wichtige für dein Trainerteam auf einen Blick.">
    <div className="stats">
      <Stat n={data.players.filter(p=>p.active!==false).length} label="aktive Spieler"/>
      <Stat n={data.trainings.length} label="Trainings"/>
      <Stat n={data.matches.length} label="Spiele"/>
      <Stat n={data.squadSize} label="Kaderplätze"/>
    </div>
    <section className="card"><h3>Nächster sinnvoller Schritt</h3><p>{data.players.length===0?'Lege zuerst deine Spieler an.':data.trainings.length===0?'Lege dein erstes Training an.':'Deine Basis steht. Jetzt kannst du Training, Spiele und Kader laufend pflegen.'}</p></section>
    <section className="card"><h3>Letztes Training</h3><p>{lastTraining ? `${fmt(lastTraining.date)} · ${attended} von ${data.players.filter(p=>p.active!==false).length} anwesend` : 'Noch kein Training angelegt.'}</p></section>
  </Page>
}
function Stat({n,label}){return <div className="stat"><b>{n}</b><span>{label}</span></div>}

function Players({data,setData}){
  const add=()=>{ const name=prompt('Name des Spielers'); if(!name?.trim()) return; if(data.players.some(p=>p.name.toLowerCase()===name.trim().toLowerCase())) return alert('Spieler existiert bereits.'); setData({...data,players:[...data.players,{id:crypto.randomUUID(),name:name.trim(),position:'',active:true}]}); };
  return <Page title="Spieler" subtitle="Spieler, Positionen und Status verwalten." action={<button className="primary small" onClick={add}><Plus size={15}/> Spieler</button>}>
    <div className="list">{data.players.length===0?<Empty text="Noch keine Spieler angelegt."/>:data.players.map(p=><div className="row" key={p.id}><div className="grow"><b>{p.name}</b><span>{p.position||'Position offen'}</span></div><select value={p.position} onChange={e=>setData({...data,players:data.players.map(x=>x.id===p.id?{...x,position:e.target.value}:x)})}><option value="">—</option>{POS.map(x=><option key={x}>{x}</option>)}</select><button className={p.active!==false?'pill good':'pill'} onClick={()=>setData({...data,players:data.players.map(x=>x.id===p.id?{...x,active:x.active===false}:x)})}>{p.active!==false?'aktiv':'inaktiv'}</button></div>)}</div>
  </Page>
}

function Training({data,setData}){
  const sorted=[...data.trainings].sort((a,b)=>b.date.localeCompare(a.date)); const [selected,setSelected]=useState(sorted[0]?.id||null);
  useEffect(()=>{if(!selected&&sorted[0])setSelected(sorted[0].id)},[data.trainings.length]);
  const add=()=>{const date=prompt('Datum (JJJJ-MM-TT)',new Date().toISOString().slice(0,10)); if(!/^\d{4}-\d{2}-\d{2}$/.test(date||''))return; const t={id:crypto.randomUUID(),date}; setData({...data,trainings:[...data.trainings,t],attendance:{...data.attendance,[t.id]:[]}});setSelected(t.id)};
  const t=data.trainings.find(x=>x.id===selected); const present=t?(data.attendance[t.id]||[]):[];
  const toggle=id=>setData({...data,attendance:{...data.attendance,[t.id]:present.includes(id)?present.filter(x=>x!==id):[...present,id]}});
  return <Page title="Training" subtitle="Anwesenheit erfassen – Grundlage für faire Kaderentscheidungen." action={<button className="primary small" onClick={add}><Plus size={15}/> Termin</button>}>
    <div className="datechips">{sorted.map(x=><button onClick={()=>setSelected(x.id)} className={x.id===selected?'active':''} key={x.id}>{fmt(x.date)}</button>)}</div>
    {!t?<Empty text="Noch kein Training angelegt."/>:<><div className="hint">{present.length} von {data.players.filter(p=>p.active!==false).length} anwesend</div><div className="list">{data.players.filter(p=>p.active!==false).map(p=><button className="row clickable" key={p.id} onClick={()=>toggle(p.id)}><span className={present.includes(p.id)?'check on':'check'}>{present.includes(p.id)?<Check size={16}/>:null}</span><b className="grow">{p.name}</b><span>{p.position||'—'}</span></button>)}</div></>}
  </Page>
}

function Matches({data,setData}){
  const add=()=>{const opponent=prompt('Gegner');if(!opponent?.trim())return;const date=prompt('Datum (JJJJ-MM-TT)',new Date().toISOString().slice(0,10))||'';setData({...data,matches:[...data.matches,{id:crypto.randomUUID(),opponent:opponent.trim(),date,home:true,goalsFor:null,goalsAgainst:null}]})};
  const setScore=(id,key,v)=>setData({...data,matches:data.matches.map(m=>m.id===id?{...m,[key]:v===''?null:Math.max(0,Number(v)||0)}:m)});
  return <Page title="Spiele" subtitle="Spielplan und Ergebnisse verwalten." action={<button className="primary small" onClick={add}><Plus size={15}/> Spiel</button>}>
    <div className="list">{data.matches.length===0?<Empty text="Noch keine Spiele angelegt."/>:[...data.matches].sort((a,b)=>(a.date||'').localeCompare(b.date||'')).map(m=><div className="row match" key={m.id}><div className="grow"><b>{m.opponent}</b><span>{m.date?fmt(m.date):'Datum offen'} · {m.home?'Heim':'Auswärts'}</span></div><input className="score" inputMode="numeric" value={m.goalsFor??''} onChange={e=>setScore(m.id,'goalsFor',e.target.value)}/><b>:</b><input className="score" inputMode="numeric" value={m.goalsAgainst??''} onChange={e=>setScore(m.id,'goalsAgainst',e.target.value)}/></div>)}</div>
  </Page>
}

function Squad({data,setData}){
  const active=data.players.filter(p=>p.active!==false);
  const [selected,setSelected]=useState([]);
  const toggle=id=>setSelected(x=>x.includes(id)?x.filter(v=>v!==id):x.length<data.squadSize?[...x,id]:x);
  return <Page title="Kader" subtitle="Flexibel bis zu 18 Spieler für den Spieltag auswählen.">
    <section className="card"><div className="between"><div><h3>Spieltagskader</h3><p>{selected.length} von {data.squadSize} ausgewählt</p></div><label className="compact">Kadergröße<select value={data.squadSize} onChange={e=>setData({...data,squadSize:Number(e.target.value)})}>{Array.from({length:8},(_,i)=>11+i).map(n=><option key={n}>{n}</option>)}</select></label></div></section>
    <div className="list">{active.map(p=><button className="row clickable" key={p.id} onClick={()=>toggle(p.id)}><span className={selected.includes(p.id)?'check on':'check'}>{selected.includes(p.id)?<Check size={16}/>:null}</span><div className="grow"><b>{p.name}</b><span>{p.position||'Position offen'}</span></div><span>{selected.includes(p.id)?'dabei':'offen'}</span></button>)}</div>
  </Page>
}

function TeamSettings({data,setData}){
  const reset=()=>{if(confirm('Nur diese neue HAQQ-Pro-Testdaten löschen?')){localStorage.removeItem(KEY);location.reload();}};
  return <Page title="Team" subtitle="Grundeinstellungen der neuen HAQQ-Pro-App."><section className="card formgrid"><label>Verein<input value={data.team.club} onChange={e=>setData({...data,team:{...data.team,club:e.target.value}})}/></label><label>Mannschaft<input value={data.team.name} onChange={e=>setData({...data,team:{...data.team,name:e.target.value}})}/></label><label>Saison<input value={data.team.season} onChange={e=>setData({...data,team:{...data.team,season:e.target.value}})}/></label></section><section className="card warning"><h3>Nächste Ausbaustufe</h3><p>Als Nächstes verbinden wir diese App mit einem eigenen neuen Supabase-Projekt: Registrierung, getrennte Teams, Trainer/Co-Trainer, Live-Sync und 30-Tage-Testphase.</p></section><button className="danger" onClick={reset}><X size={15}/> Testdaten dieser neuen App löschen</button></Page>
}

function Page({title,subtitle,action,children}){return <div className="page"><div className="pagehead"><div><h2>{title}</h2><p>{subtitle}</p></div>{action}</div>{children}</div>}
function Empty({text}){return <div className="empty">{text}</div>}
function fmt(s){try{return new Date(s+'T12:00:00').toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit',year:'2-digit'})}catch{return s}}
