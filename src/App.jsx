import { useState, useEffect, useRef } from "react";
import { loadPlayer, savePlayer } from "./supabase.js";
import { fetchResults } from "./football.js";

const GROUPS = {
  A: ["🇲🇽 México", "🇿🇦 Sudáfrica", "🇰🇷 Corea del Sur", "🇨🇿 Chequia"],
  B: ["🇨🇦 Canadá", "🇧🇦 Bosnia-Herz.", "🇶🇦 Qatar", "🇨🇭 Suiza"],
  C: ["🇧🇷 Brasil", "🇲🇦 Marruecos", "🇭🇹 Haití", "🏴󠁧󠁢󠁳󠁣󠁴󠁿 Escocia"],
  D: ["🇺🇸 EE.UU.", "🇵🇾 Paraguay", "🇦🇺 Australia", "🇹🇷 Türkiye"],
  E: ["🇩🇪 Alemania", "🇨🇼 Curazao", "🇨🇮 Costa de Marfil", "🇪🇨 Ecuador"],
  F: ["🇳🇱 Países Bajos", "🇯🇵 Japón", "🇸🇪 Suecia", "🇹🇳 Túnez"],
  G: ["🇧🇪 Bélgica", "🇪🇬 Egipto", "🇮🇷 Irán", "🇳🇿 Nueva Zelanda"],
  H: ["🇪🇸 España", "🇨🇻 Cabo Verde", "🇸🇦 Arabia Saudí", "🇺🇾 Uruguay"],
  I: ["🇫🇷 Francia", "🇸🇳 Senegal", "🇮🇶 Irak", "🇳🇴 Noruega"],
  J: ["🇦🇷 Argentina", "🇩🇿 Argelia", "🇦🇹 Austria", "🇯🇴 Jordania"],
  K: ["🇵🇹 Portugal", "🇨🇩 RD Congo", "🇺🇿 Uzbekistán", "🇨🇴 Colombia"],
  L: ["🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inglaterra", "🇭🇷 Croacia", "🇬🇭 Ghana", "🇵🇦 Panamá"],
};

const GROUP_MATCHES = [
  { id: "A1", group: "A", home: "🇲🇽 México", away: "🇿🇦 Sudáfrica", date: "11 Jun" },
  { id: "A2", group: "A", home: "🇰🇷 Corea del Sur", away: "🇨🇿 Chequia", date: "11 Jun" },
  { id: "B1", group: "B", home: "🇨🇦 Canadá", away: "🇧🇦 Bosnia-Herz.", date: "12 Jun" },
  { id: "D1", group: "D", home: "🇺🇸 EE.UU.", away: "🇵🇾 Paraguay", date: "12 Jun" },
  { id: "B2", group: "B", home: "🇶🇦 Qatar", away: "🇨🇭 Suiza", date: "13 Jun" },
  { id: "C1", group: "C", home: "🇧🇷 Brasil", away: "🇲🇦 Marruecos", date: "13 Jun" },
  { id: "C2", group: "C", home: "🇭🇹 Haití", away: "🏴󠁧󠁢󠁳󠁣󠁴󠁿 Escocia", date: "13 Jun" },
  { id: "D2", group: "D", home: "🇦🇺 Australia", away: "🇹🇷 Türkiye", date: "14 Jun" },
  { id: "E1", group: "E", home: "🇩🇪 Alemania", away: "🇨🇼 Curazao", date: "14 Jun" },
  { id: "F1", group: "F", home: "🇳🇱 Países Bajos", away: "🇯🇵 Japón", date: "14 Jun" },
  { id: "E2", group: "E", home: "🇨🇮 Costa de Marfil", away: "🇪🇨 Ecuador", date: "14 Jun" },
  { id: "F2", group: "F", home: "🇸🇪 Suecia", away: "🇹🇳 Túnez", date: "14 Jun" },
  { id: "H1", group: "H", home: "🇪🇸 España", away: "🇨🇻 Cabo Verde", date: "15 Jun" },
  { id: "G1", group: "G", home: "🇧🇪 Bélgica", away: "🇪🇬 Egipto", date: "15 Jun" },
  { id: "H2", group: "H", home: "🇸🇦 Arabia Saudí", away: "🇺🇾 Uruguay", date: "15 Jun" },
  { id: "G2", group: "G", home: "🇮🇷 Irán", away: "🇳🇿 Nueva Zelanda", date: "15 Jun" },
  { id: "I1", group: "I", home: "🇫🇷 Francia", away: "🇸🇳 Senegal", date: "16 Jun" },
  { id: "I2", group: "I", home: "🇮🇶 Irak", away: "🇳🇴 Noruega", date: "16 Jun" },
  { id: "J1", group: "J", home: "🇦🇷 Argentina", away: "🇩🇿 Argelia", date: "16 Jun" },
  { id: "J2", group: "J", home: "🇦🇹 Austria", away: "🇯🇴 Jordania", date: "17 Jun" },
  { id: "K1", group: "K", home: "🇵🇹 Portugal", away: "🇨🇩 RD Congo", date: "17 Jun" },
  { id: "L1", group: "L", home: "🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inglaterra", away: "🇭🇷 Croacia", date: "17 Jun" },
  { id: "L2", group: "L", home: "🇬🇭 Ghana", away: "🇵🇦 Panamá", date: "17 Jun" },
  { id: "K2", group: "K", home: "🇺🇿 Uzbekistán", away: "🇨🇴 Colombia", date: "17 Jun" },
  { id: "A3", group: "A", home: "🇨🇿 Chequia", away: "🇿🇦 Sudáfrica", date: "18 Jun" },
  { id: "B3", group: "B", home: "🇨🇭 Suiza", away: "🇧🇦 Bosnia-Herz.", date: "18 Jun" },
  { id: "B4", group: "B", home: "🇨🇦 Canadá", away: "🇶🇦 Qatar", date: "18 Jun" },
  { id: "A4", group: "A", home: "🇲🇽 México", away: "🇰🇷 Corea del Sur", date: "18 Jun" },
  { id: "D3", group: "D", home: "🇺🇸 EE.UU.", away: "🇦🇺 Australia", date: "19 Jun" },
  { id: "C3", group: "C", home: "🏴󠁧󠁢󠁳󠁣󠁴󠁿 Escocia", away: "🇲🇦 Marruecos", date: "19 Jun" },
  { id: "C4", group: "C", home: "🇧🇷 Brasil", away: "🇭🇹 Haití", date: "19 Jun" },
  { id: "D4", group: "D", home: "🇵🇾 Paraguay", away: "🇹🇷 Türkiye", date: "20 Jun" },
  { id: "F3", group: "F", home: "🇯🇵 Japón", away: "🇹🇳 Túnez", date: "20 Jun" },
  { id: "E3", group: "E", home: "🇩🇪 Alemania", away: "🇪🇨 Ecuador", date: "20 Jun" },
  { id: "E4", group: "E", home: "🇨🇮 Costa de Marfil", away: "🇨🇼 Curazao", date: "21 Jun" },
  { id: "F4", group: "F", home: "🇳🇱 Países Bajos", away: "🇸🇪 Suecia", date: "21 Jun" },
  { id: "H3", group: "H", home: "🇺🇾 Uruguay", away: "🇨🇻 Cabo Verde", date: "21 Jun" },
  { id: "G3", group: "G", home: "🇧🇪 Bélgica", away: "🇮🇷 Irán", date: "21 Jun" },
  { id: "H4", group: "H", home: "🇸🇦 Arabia Saudí", away: "🇪🇸 España", date: "22 Jun" },
  { id: "G4", group: "G", home: "🇳🇿 Nueva Zelanda", away: "🇪🇬 Egipto", date: "22 Jun" },
  { id: "I3", group: "I", home: "🇫🇷 Francia", away: "🇮🇶 Irak", date: "22 Jun" },
  { id: "I4", group: "I", home: "🇸🇳 Senegal", away: "🇳🇴 Noruega", date: "23 Jun" },
  { id: "J3", group: "J", home: "🇦🇷 Argentina", away: "🇦🇹 Austria", date: "23 Jun" },
  { id: "J4", group: "J", home: "🇩🇿 Argelia", away: "🇯🇴 Jordania", date: "23 Jun" },
  { id: "K3", group: "K", home: "🇵🇹 Portugal", away: "🇺🇿 Uzbekistán", date: "23 Jun" },
  { id: "L3", group: "L", home: "🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inglaterra", away: "🇬🇭 Ghana", date: "23 Jun" },
  { id: "L4", group: "L", home: "🇭🇷 Croacia", away: "🇵🇦 Panamá", date: "24 Jun" },
  { id: "K4", group: "K", home: "🇨🇩 RD Congo", away: "🇨🇴 Colombia", date: "24 Jun" },
  { id: "A5", group: "A", home: "🇿🇦 Sudáfrica", away: "🇰🇷 Corea del Sur", date: "25 Jun" },
  { id: "A6", group: "A", home: "🇲🇽 México", away: "🇨🇿 Chequia", date: "25 Jun" },
  { id: "B5", group: "B", home: "🇧🇦 Bosnia-Herz.", away: "🇶🇦 Qatar", date: "25 Jun" },
  { id: "B6", group: "B", home: "🇨🇭 Suiza", away: "🇨🇦 Canadá", date: "25 Jun" },
  { id: "C5", group: "C", home: "🇲🇦 Marruecos", away: "🇭🇹 Haití", date: "26 Jun" },
  { id: "C6", group: "C", home: "🏴󠁧󠁢󠁳󠁣󠁴󠁿 Escocia", away: "🇧🇷 Brasil", date: "26 Jun" },
  { id: "D5", group: "D", home: "🇵🇾 Paraguay", away: "🇦🇺 Australia", date: "26 Jun" },
  { id: "D6", group: "D", home: "🇹🇷 Türkiye", away: "🇺🇸 EE.UU.", date: "26 Jun" },
  { id: "E5", group: "E", home: "🇨🇼 Curazao", away: "🇪🇨 Ecuador", date: "26 Jun" },
  { id: "E6", group: "E", home: "🇩🇪 Alemania", away: "🇨🇮 Costa de Marfil", date: "26 Jun" },
  { id: "F5", group: "F", home: "🇹🇳 Túnez", away: "🇸🇪 Suecia", date: "27 Jun" },
  { id: "F6", group: "F", home: "🇯🇵 Japón", away: "🇳🇱 Países Bajos", date: "27 Jun" },
  { id: "G5", group: "G", home: "🇳🇿 Nueva Zelanda", away: "🇧🇪 Bélgica", date: "27 Jun" },
  { id: "G6", group: "G", home: "🇮🇷 Irán", away: "🇪🇬 Egipto", date: "27 Jun" },
  { id: "H5", group: "H", home: "🇨🇻 Cabo Verde", away: "🇸🇦 Arabia Saudí", date: "27 Jun" },
  { id: "H6", group: "H", home: "🇺🇾 Uruguay", away: "🇪🇸 España", date: "27 Jun" },
  { id: "I5", group: "I", home: "🇳🇴 Noruega", away: "🇫🇷 Francia", date: "28 Jun" },
  { id: "I6", group: "I", home: "🇮🇶 Irak", away: "🇸🇳 Senegal", date: "28 Jun" },
  { id: "J5", group: "J", home: "🇯🇴 Jordania", away: "🇦🇷 Argentina", date: "28 Jun" },
  { id: "J6", group: "J", home: "🇩🇿 Argelia", away: "🇦🇹 Austria", date: "28 Jun" },
  { id: "K5", group: "K", home: "🇺🇿 Uzbekistán", away: "🇨🇩 RD Congo", date: "28 Jun" },
  { id: "K6", group: "K", home: "🇨🇴 Colombia", away: "🇵🇹 Portugal", date: "28 Jun" },
  { id: "L5", group: "L", home: "🇵🇦 Panamá", away: "🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inglaterra", date: "29 Jun" },
  { id: "L6", group: "L", home: "🇬🇭 Ghana", away: "🇭🇷 Croacia", date: "29 Jun" },
];

const KNOCKOUT_MATCHES = [
  { id: "R32_1", round: "R32", label: "Partido 1", date: "28 Jun" },
  { id: "R32_2", round: "R32", label: "Partido 2", date: "28 Jun" },
  { id: "R32_3", round: "R32", label: "Partido 3", date: "29 Jun" },
  { id: "R32_4", round: "R32", label: "Partido 4", date: "29 Jun" },
  { id: "R32_5", round: "R32", label: "Partido 5", date: "30 Jun" },
  { id: "R32_6", round: "R32", label: "Partido 6", date: "30 Jun" },
  { id: "R32_7", round: "R32", label: "Partido 7", date: "1 Jul" },
  { id: "R32_8", round: "R32", label: "Partido 8", date: "1 Jul" },
  { id: "R32_9", round: "R32", label: "Partido 9", date: "2 Jul" },
  { id: "R32_10", round: "R32", label: "Partido 10", date: "2 Jul" },
  { id: "R32_11", round: "R32", label: "Partido 11", date: "3 Jul" },
  { id: "R32_12", round: "R32", label: "Partido 12", date: "3 Jul" },
  { id: "R32_13", round: "R32", label: "Partido 13", date: "4 Jul" },
  { id: "R32_14", round: "R32", label: "Partido 14", date: "4 Jul" },
  { id: "R32_15", round: "R32", label: "Partido 15", date: "5 Jul" },
  { id: "R32_16", round: "R32", label: "Partido 16", date: "5 Jul" },
  { id: "R16_1", round: "R16", label: "Partido 1", date: "6 Jul" },
  { id: "R16_2", round: "R16", label: "Partido 2", date: "6 Jul" },
  { id: "R16_3", round: "R16", label: "Partido 3", date: "7 Jul" },
  { id: "R16_4", round: "R16", label: "Partido 4", date: "7 Jul" },
  { id: "R16_5", round: "R16", label: "Partido 5", date: "8 Jul" },
  { id: "R16_6", round: "R16", label: "Partido 6", date: "8 Jul" },
  { id: "R16_7", round: "R16", label: "Partido 7", date: "9 Jul" },
  { id: "R16_8", round: "R16", label: "Partido 8", date: "9 Jul" },
  { id: "QF_1", round: "QF", label: "Partido 1", date: "10 Jul" },
  { id: "QF_2", round: "QF", label: "Partido 2", date: "11 Jul" },
  { id: "QF_3", round: "QF", label: "Partido 3", date: "12 Jul" },
  { id: "QF_4", round: "QF", label: "Partido 4", date: "13 Jul" },
  { id: "SF_1", round: "SF", label: "Semifinal 1", date: "14 Jul" },
  { id: "SF_2", round: "SF", label: "Semifinal 2", date: "15 Jul" },
  { id: "FINAL", round: "F", label: "⭐ FINAL", date: "19 Jul" },
];

const PRIZES = [
  { emoji: "🏆", title: "El/la que gana manda", prize: "Elige un plan para los dos — cena, escapada, concierto, lo que quiera — y el/la otro/a lo organiza todo sin rechistar. Sin límite de presupuesto, sin veto." },
  { emoji: "💆", title: "El/la que pierde sirve", prize: "Un mes entero de masajes en casa a demanda. Cuando el/la ganador/a pida, el/la perdedor/a acude. Sin excusas de 'estoy cansado/a'." },
  { emoji: "🍳", title: "Cocinero/a oficial del campeón", prize: "El/la perdedor/a cocina la cena del país campeón del mundo una vez por semana durante agosto. Con decoración temática incluida." },
  { emoji: "⚡", title: "Resultado exacto de la Final", prize: "Quien acierte el marcador exacto de la Final elige una sorpresa romántica que el/la otro/a prepara en secreto. Plazo: dos semanas." },
];

const RULES = [
  { icon: "⚽", title: "Resultado exacto (grupos)", pts: "+3 pts", desc: "Marcador exacto acertado en fase de grupos" },
  { icon: "🏹", title: "Ganador / empate", pts: "+1 pt", desc: "Aciertas el 1X2 pero no el marcador exacto" },
  { icon: "🏆", title: "Clasificado a siguiente ronda", pts: "+2 pts", desc: "Por cada equipo que aciertas que pasa de fase" },
  { icon: "🎯", title: "Finalista acertado", pts: "+5 pts", desc: "Aciertas uno de los dos equipos en la final" },
  { icon: "👑", title: "Campeón del mundo", pts: "+10 pts", desc: "El mayor premio: adivinar el campeón antes del torneo" },
  { icon: "⭐", title: "Resultado exacto (eliminatorias)", pts: "+5 pts", desc: "Marcador exacto en partidos de eliminación directa" },
];

const C = {
  bg: "#0a0e1a", card: "#111827", cardLight: "#1a2235",
  accent: "#e8c44a", text: "#e2e8f0", muted: "#64748b",
  border: "#1e2d45", em: "#4ade80", pa: "#f472b6",
};

function calcScore(predictions, results) {
  let score = 0;
  for (const m of GROUP_MATCHES) {
    const p = predictions[m.id];
    const r = results[m.home + "|" + m.away];
    if (!p || !r || p.home === "" || p.away === "" || p.home === undefined) continue;
    const ph = parseInt(p.home), pa = parseInt(p.away);
    if (ph === r.home && pa === r.away) { score += 3; continue; }
    const pWin = ph > pa ? "H" : ph < pa ? "A" : "D";
    const rWin = r.home > r.away ? "H" : r.home < r.away ? "A" : "D";
    if (pWin === rWin) score += 1;
  }
  return score;
}

export default function App() {
  const [screen, setScreen] = useState("login");
  const [player, setPlayer] = useState(null);
  const [tab, setTab] = useState("home");
  const [activeGroup, setActiveGroup] = useState("A");
  const [activeKnockout, setActiveKnockout] = useState("R32");
  const [myData, setMyData] = useState({});
  const [otherData, setOtherData] = useState({});
  const [names, setNames] = useState({ p1: "Jugador 1", p2: "Jugador 2" });
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [editingName, setEditingName] = useState(null);
  const [tempName, setTempName] = useState("");
  const saveTimer = useRef(null);

  const otherId = player === "p1" ? "p2" : "p1";
  const myColor = player === "p1" ? C.em : C.pa;
  const otherColor = player === "p1" ? C.pa : C.em;
  const myName = names[player] || "Jugador 1";
  const otherName = names[otherId] || "Jugador 2";

  useEffect(() => {
    loadPlayer("shared").then(shared => {
      if (shared && shared.names) setNames(shared.names);
    });
  }, []);

  useEffect(() => {
    if (!player) return;
    setLoading(true);
    setMyData({});
    setOtherData({});
    const other = player === "p1" ? "p2" : "p1";
    Promise.all([
      loadPlayer(player),
      loadPlayer(other),
      loadPlayer("shared"),
      fetchResults(),
    ]).then(([mine, otherD, shared, res]) => {
      setMyData(mine || {});
      setOtherData(otherD || {});
      if (shared && shared.names) setNames(shared.names);
      setResults(res || {});
      setLoading(false);
    });
  }, [player]);

  const persist = async (newMyData) => {
    setMyData(newMyData);
    setSaveStatus("saving");
    clearTimeout(saveTimer.current);
    await savePlayer(player, newMyData);
    saveTimer.current = setTimeout(() => setSaveStatus("saved"), 500);
  };

  const persistNames = async (newNames) => {
    setNames(newNames);
    await savePlayer("shared", { names: newNames });
  };

  const updatePrediction = (matchId, field, value) => {
    const val = (field === "home" || field === "away")
      ? value.replace(/[^0-9]/g, "").slice(0, 2) : value;
    const updated = {
      ...myData,
      predictions: {
        ...(myData.predictions || {}),
        [matchId]: { ...(myData.predictions?.[matchId] || {}), [field]: val },
      },
    };
    persist(updated);
  };

  const updateChampion = (team) => persist({ ...myData, champion: team });

  const myPreds = myData.predictions || {};
  const otherPreds = otherData.predictions || {};
  const myChampion = myData.champion;
  const otherChampion = otherData.champion;

  const countFilled = (preds) =>
    [...GROUP_MATCHES, ...KNOCKOUT_MATCHES].filter(m => {
      const x = preds[m.id];
      return x && x.home !== undefined && x.home !== "" && x.away !== undefined && x.away !== "";
    }).length;

  const total = GROUP_MATCHES.length + KNOCKOUT_MATCHES.length;
  const myScore = calcScore(myPreds, results);
  const otherScore = calcScore(otherPreds, results);
  const allTeams = Object.values(GROUPS).flat().sort((a, b) => a.localeCompare(b));

  if (screen === "login") {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif", padding: 20 }}>
        <div style={{ textAlign: "center", maxWidth: 380, width: "100%" }}>
          <div style={{ fontSize: 56, marginBottom: 8 }}>⚽</div>
          <h1 style={{ color: C.accent, fontSize: 26, fontWeight: 900, letterSpacing: 2, textTransform: "uppercase", margin: "0 0 4px" }}>Quiniela</h1>
          <p style={{ color: C.text, fontSize: 17, margin: "0 0 4px" }}>Mundial 2026</p>
          <p style={{ color: C.muted, fontSize: 12, marginBottom: 32 }}>🇺🇸 🇨🇦 🇲🇽 · 11 Jun – 19 Jul · 104 partidos</p>
          <p style={{ color: C.text, fontSize: 14, marginBottom: 16 }}>¿Quién eres?</p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", marginBottom: 28 }}>
            {[["p1", C.em], ["p2", C.pa]].map(([id, col]) => (
              <button key={id} onClick={() => { setPlayer(id); setScreen("app"); }}
                style={{ background: col + "22", border: "2px solid " + col, color: col, borderRadius: 14, padding: "18px 28px", fontSize: 15, fontWeight: 700, cursor: "pointer", minWidth: 130 }}>
                {names[id]}
              </button>
            ))}
          </div>
          <div style={{ background: C.card, borderRadius: 12, padding: 16, border: "1px solid " + C.border }}>
            <p style={{ color: C.muted, fontSize: 11, margin: "0 0 10px", textTransform: "uppercase", letterSpacing: 1 }}>Personalizar nombres</p>
            {["p1", "p2"].map(id => (
              <div key={id} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                {editingName === id ? (
                  <>
                    <input value={tempName} onChange={e => setTempName(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") { persistNames({ ...names, [id]: tempName || names[id] }); setEditingName(null); } }}
                      style={{ flex: 1, background: C.cardLight, border: "1px solid " + C.border, color: C.text, borderRadius: 8, padding: "7px 10px", fontSize: 14 }} autoFocus />
                    <button onClick={() => { persistNames({ ...names, [id]: tempName || names[id] }); setEditingName(null); }}
                      style={{ background: C.accent, color: "#000", border: "none", borderRadius: 8, padding: "7px 14px", cursor: "pointer", fontWeight: 700 }}>OK</button>
                  </>
                ) : (
                  <>
                    <span style={{ flex: 1, color: C.text, fontSize: 14, lineHeight: "34px" }}>{names[id]}</span>
                    <button onClick={() => { setEditingName(id); setTempName(names[id]); }}
                      style={{ background: C.cardLight, color: C.muted, border: "1px solid " + C.border, borderRadius: 8, padding: "7px 12px", cursor: "pointer" }}>✏️</button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: C.accent, fontFamily: "Georgia, serif", fontSize: 16 }}>⚽ Cargando quiniela...</p>
      </div>
    );
  }

  const tabs = [
    { id: "home", icon: "🏠", label: "Inicio" },
    { id: "live", icon: "📅", label: "En vivo" },
    { id: "groups", icon: "🔢", label: "Grupos" },
    { id: "knockout", icon: "🏆", label: "Elim." },
    { id: "champion", icon: "👑", label: "Campeón" },
    { id: "scores", icon: "📊", label: "Puntos" },
    { id: "prizes", icon: "🎁", label: "Premios" },
  ];

  const renderHome = () => {
    const myF = countFilled(myPreds), otherF = countFilled(otherPreds);
    const hasResults = Object.keys(results).length > 0;
    return (
      <div>
        <div style={{ background: "linear-gradient(135deg,#0a1628,#112244)", borderRadius: 16, padding: 20, marginBottom: 14, border: "1px solid " + C.accent + "33", textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 4 }}>⚽</div>
          <h1 style={{ color: C.accent, fontSize: 20, fontWeight: 900, margin: "0 0 2px", letterSpacing: 2, textTransform: "uppercase" }}>Quiniela Mundial 2026</h1>
          <p style={{ color: C.muted, fontSize: 12, margin: 0 }}>11 Jun – 19 Jul · 48 equipos · 104 partidos</p>
        </div>
        {hasResults && (
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            {[{ name: myName, score: myScore, color: myColor }, { name: otherName, score: otherScore, color: otherColor }].map((p, i) => (
              <div key={i} style={{ flex: 1, background: p.color + "22", border: "2px solid " + p.color + "44", borderRadius: 12, padding: 14, textAlign: "center" }}>
                <p style={{ color: p.color, fontSize: 11, fontWeight: 700, margin: "0 0 4px" }}>{p.name}</p>
                <p style={{ color: p.color, fontSize: 28, fontWeight: 900, margin: 0 }}>{p.score}</p>
                <p style={{ color: C.muted, fontSize: 10, margin: 0 }}>puntos</p>
              </div>
            ))}
          </div>
        )}
        {[{ id: player, name: myName, color: myColor, f: myF }, { id: otherId, name: otherName, color: otherColor, f: otherF }].map(p => (
          <div key={p.id} style={{ background: C.card, borderRadius: 12, padding: 14, marginBottom: 10, border: "1px solid " + C.border }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ color: p.color, fontWeight: 700, fontSize: 14 }}>{p.name}</span>
              <span style={{ color: C.muted, fontSize: 12 }}>{p.f}/{total}</span>
            </div>
            <div style={{ background: C.cardLight, borderRadius: 99, height: 7 }}>
              <div style={{ background: p.color, width: Math.round(p.f / total * 100) + "%", height: "100%", borderRadius: 99, transition: "width .4s" }} />
            </div>
            <div style={{ marginTop: 5, display: "flex", gap: 8 }}>
              <span style={{ color: p.color, fontSize: 11 }}>{Math.round(p.f / total * 100)}% completado</span>
              {(p.id === player ? myChampion : otherChampion) && <span style={{ color: C.muted, fontSize: 11 }}>👑 {p.id === player ? myChampion : otherChampion}</span>}
            </div>
          </div>
        ))}
        <div style={{ background: C.card, borderRadius: 12, padding: 14, border: "1px solid " + C.border, fontSize: 12, color: C.muted, lineHeight: 1.8 }}>
          <p style={{ margin: "0 0 4px", color: C.text, fontWeight: 700, fontSize: 13 }}>📅 Calendario</p>
          <p style={{ margin: 0 }}>⚽ Fase de grupos: 11–29 Jun<br />🏆 Ronda de 32: 28 Jun–5 Jul<br />🏆 Octavos: 6–9 Jul<br />🏆 Cuartos: 10–13 Jul<br />🏆 Semis: 14–15 Jul<br />⭐ Final: 19 Jul · MetLife Stadium, NJ</p>
        </div>
      </div>
    );
  };

  const renderLive = () => {
    const byDate = {};
    GROUP_MATCHES.forEach(m => { if (!byDate[m.date]) byDate[m.date] = []; byDate[m.date].push(m); });
    return (
      <div>
        <div style={{ background: C.card, borderRadius: 10, padding: "10px 14px", marginBottom: 14, border: "1px solid " + C.border, fontSize: 12, color: C.muted }}>
          Todos los partidos en orden cronológico. Baja e introduce partido a partido.
        </div>
        {Object.keys(byDate).map(date => (
          <div key={date}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, marginTop: 6 }}>
              <div style={{ flex: 1, height: 1, background: C.border }} />
              <span style={{ color: C.accent, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>📅 {date}</span>
              <div style={{ flex: 1, height: 1, background: C.border }} />
            </div>
            {byDate[date].map(m => {
              const myP = myPreds[m.id] || {}, otherP = otherPreds[m.id] || {};
              const realResult = results[m.home + "|" + m.away];
              const showOther = !!realResult && otherP.home !== undefined && otherP.home !== "";
              return (
                <div key={m.id} style={{ background: C.card, borderRadius: 12, padding: 14, marginBottom: 8, border: "1px solid " + C.border }}>
                  {realResult && (
                    <div style={{ background: C.accent + "22", borderRadius: 6, padding: "3px 8px", marginBottom: 8, textAlign: "center" }}>
                      <span style={{ color: C.accent, fontSize: 12, fontWeight: 700 }}>Resultado: {realResult.home} – {realResult.away}</span>
                    </div>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ flex: 1, color: C.text, fontSize: 12, textAlign: "right", lineHeight: 1.3 }}>{m.home}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <input type="number" min="0" max="20" value={myP.home ?? ""}
                        onChange={e => updatePrediction(m.id, "home", e.target.value)}
                        style={{ width: 40, textAlign: "center", background: C.cardLight, border: "1px solid " + myColor + "55", color: myColor, borderRadius: 8, padding: "6px 2px", fontSize: 16, fontWeight: 700 }} />
                      <span style={{ color: C.muted, fontSize: 12 }}>–</span>
                      <input type="number" min="0" max="20" value={myP.away ?? ""}
                        onChange={e => updatePrediction(m.id, "away", e.target.value)}
                        style={{ width: 40, textAlign: "center", background: C.cardLight, border: "1px solid " + myColor + "55", color: myColor, borderRadius: 8, padding: "6px 2px", fontSize: 16, fontWeight: 700 }} />
                    </div>
                    <span style={{ flex: 1, color: C.text, fontSize: 12, lineHeight: 1.3 }}>{m.away}</span>
                  </div>
                  {showOther && (
                    <p style={{ color: otherColor, fontSize: 11, margin: "6px 0 0", textAlign: "center" }}>
                      {otherName}: <strong>{otherP.home} – {otherP.away}</strong>
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  const renderGroups = () => {
    const matches = GROUP_MATCHES.filter(m => m.group === activeGroup);
    return (
      <div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
          {"ABCDEFGHIJKL".split("").map(g => (
            <button key={g} onClick={() => setActiveGroup(g)}
              style={{ background: activeGroup === g ? C.accent : C.card, color: activeGroup === g ? "#000" : C.muted, border: "1px solid " + (activeGroup === g ? C.accent : C.border), borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontWeight: activeGroup === g ? 700 : 400, fontSize: 13 }}>
              {g}
            </button>
          ))}
        </div>
        <div style={{ background: C.card, borderRadius: 10, padding: "10px 14px", marginBottom: 12, border: "1px solid " + C.border }}>
          <p style={{ color: C.muted, fontSize: 11, margin: "0 0 6px", textTransform: "uppercase" }}>Grupo {activeGroup}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {GROUPS[activeGroup].map(t => <span key={t} style={{ background: C.cardLight, color: C.text, borderRadius: 6, padding: "4px 8px", fontSize: 12 }}>{t}</span>)}
          </div>
        </div>
        {matches.map(m => {
          const myP = myPreds[m.id] || {}, otherP = otherPreds[m.id] || {};
          const realResult = results[m.home + "|" + m.away];
          const showOther = !!realResult && otherP.home !== undefined && otherP.home !== "";
          return (
            <div key={m.id} style={{ background: C.card, borderRadius: 12, padding: 14, marginBottom: 10, border: "1px solid " + C.border }}>
              <p style={{ color: C.muted, fontSize: 11, margin: "0 0 8px" }}>{m.date} · Grupo {m.group}</p>
              {realResult && (
                <div style={{ background: C.accent + "22", borderRadius: 6, padding: "3px 8px", marginBottom: 8, textAlign: "center" }}>
                  <span style={{ color: C.accent, fontSize: 12, fontWeight: 700 }}>Resultado: {realResult.home} – {realResult.away}</span>
                </div>
              )}
              <p style={{ color: myColor, fontSize: 11, fontWeight: 700, margin: "0 0 6px" }}>{myName}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ flex: 1, color: C.text, fontSize: 12, textAlign: "right" }}>{m.home}</span>
                <input type="number" min="0" max="20" value={myP.home ?? ""}
                  onChange={e => updatePrediction(m.id, "home", e.target.value)}
                  style={{ width: 42, textAlign: "center", background: C.cardLight, border: "1px solid " + myColor + "55", color: myColor, borderRadius: 8, padding: "6px 2px", fontSize: 16, fontWeight: 700 }} />
                <span style={{ color: C.muted }}>–</span>
                <input type="number" min="0" max="20" value={myP.away ?? ""}
                  onChange={e => updatePrediction(m.id, "away", e.target.value)}
                  style={{ width: 42, textAlign: "center", background: C.cardLight, border: "1px solid " + myColor + "55", color: myColor, borderRadius: 8, padding: "6px 2px", fontSize: 16, fontWeight: 700 }} />
                <span style={{ flex: 1, color: C.text, fontSize: 12 }}>{m.away}</span>
              </div>
              {showOther && (
                <div style={{ borderTop: "1px solid " + C.border, marginTop: 10, paddingTop: 8 }}>
                  <p style={{ color: otherColor, fontSize: 11, margin: 0 }}>{otherName}: <strong style={{ fontSize: 14 }}>{otherP.home} – {otherP.away}</strong></p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderKnockout = () => {
    const rounds = [["R32","Ronda de 32"],["R16","Octavos"],["QF","Cuartos"],["SF","Semis"],["F","Final"]];
    const matches = KNOCKOUT_MATCHES.filter(m => m.round === activeKnockout);
    return (
      <div>
        <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
          {rounds.map(([id, label]) => (
            <button key={id} onClick={() => setActiveKnockout(id)}
              style={{ background: activeKnockout === id ? C.accent : C.card, color: activeKnockout === id ? "#000" : C.muted, border: "1px solid " + (activeKnockout === id ? C.accent : C.border), borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontWeight: activeKnockout === id ? 700 : 400, fontSize: 12 }}>
              {label}
            </button>
          ))}
        </div>
        {matches.map(m => {
          const myP = myPreds[m.id] || {}, otherP = otherPreds[m.id] || {};
          return (
            <div key={m.id} style={{ background: C.card, borderRadius: 12, padding: 14, marginBottom: 10, border: "1px solid " + C.border }}>
              <p style={{ color: C.muted, fontSize: 11, margin: "0 0 10px" }}>{m.label} · {m.date}</p>
              <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                <input placeholder="Local" value={myP.homeTeam || ""} onChange={e => updatePrediction(m.id, "homeTeam", e.target.value)}
                  style={{ flex: 1, background: C.cardLight, border: "1px solid " + C.border, color: C.text, borderRadius: 8, padding: "7px 8px", fontSize: 12 }} />
                <input placeholder="Visitante" value={myP.awayTeam || ""} onChange={e => updatePrediction(m.id, "awayTeam", e.target.value)}
                  style={{ flex: 1, background: C.cardLight, border: "1px solid " + C.border, color: C.text, borderRadius: 8, padding: "7px 8px", fontSize: 12 }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="number" min="0" max="20" value={myP.home ?? ""}
                  onChange={e => updatePrediction(m.id, "home", e.target.value)}
                  style={{ width: 42, textAlign: "center", background: C.cardLight, border: "1px solid " + myColor + "55", color: myColor, borderRadius: 8, padding: "6px 2px", fontSize: 16, fontWeight: 700 }} />
                <span style={{ color: C.muted, fontSize: 12 }}>resultado</span>
                <input type="number" min="0" max="20" value={myP.away ?? ""}
                  onChange={e => updatePrediction(m.id, "away", e.target.value)}
                  style={{ width: 42, textAlign: "center", background: C.cardLight, border: "1px solid " + myColor + "55", color: myColor, borderRadius: 8, padding: "6px 2px", fontSize: 16, fontWeight: 700 }} />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderChampion = () => (
    <div>
      <div style={{ background: "linear-gradient(135deg," + C.accent + "22," + C.card + ")", border: "1px solid " + C.accent + "44", borderRadius: 16, padding: 20, marginBottom: 16, textAlign: "center" }}>
        <div style={{ fontSize: 44, marginBottom: 6 }}>👑</div>
        <h2 style={{ color: C.accent, margin: "0 0 4px", fontSize: 18 }}>Campeón del Mundo</h2>
        <p style={{ color: C.muted, fontSize: 12, margin: 0 }}>El acierto más valioso: +10 puntos</p>
      </div>
      {myChampion && (
        <div style={{ background: myColor + "22", border: "2px solid " + myColor, borderRadius: 12, padding: 14, marginBottom: 14, textAlign: "center" }}>
          <p style={{ color: myColor, fontWeight: 900, fontSize: 17, margin: 0 }}>🏆 {myChampion}</p>
        </div>
      )}
      <p style={{ color: C.text, fontSize: 13, marginBottom: 12 }}>Tu pronóstico:</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
        {allTeams.map(team => (
          <button key={team} onClick={() => updateChampion(team)}
            style={{ background: myChampion === team ? myColor + "33" : C.card, border: "1px solid " + (myChampion === team ? myColor : C.border), color: myChampion === team ? myColor : C.text, borderRadius: 8, padding: "8px 10px", cursor: "pointer", fontSize: 12, textAlign: "left", fontWeight: myChampion === team ? 700 : 400 }}>
            {team}
          </button>
        ))}
      </div>
      {otherChampion && (
        <div style={{ marginTop: 18, background: otherColor + "11", border: "1px solid " + otherColor + "44", borderRadius: 12, padding: 14 }}>
          <p style={{ color: otherColor, margin: 0, fontSize: 13 }}>{otherName} eligió: <strong>{otherChampion}</strong></p>
        </div>
      )}
    </div>
  );

  const renderScores = () => {
    const hasResults = Object.keys(results).length > 0;
    const matchDetails = GROUP_MATCHES.map(m => {
      const r = results[m.home + "|" + m.away];
      const myP = myPreds[m.id] || {};
      const otherP = otherPreds[m.id] || {};
      const calcPts = (p) => {
        if (!r || p.home === undefined || p.home === "") return null;
        const ph = parseInt(p.home), pa = parseInt(p.away);
        if (ph === r.home && pa === r.away) return 3;
        const pW = ph > pa ? "H" : ph < pa ? "A" : "D";
        const rW = r.home > r.away ? "H" : r.home < r.away ? "A" : "D";
        return pW === rW ? 1 : 0;
      };
      return { m, r, myP, otherP, myPts: calcPts(myP), otherPts: calcPts(otherP) };
    }).filter(x => x.r);

    return (
      <div>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {[{ name: myName, score: myScore, color: myColor }, { name: otherName, score: otherScore, color: otherColor }].map((p, i) => (
            <div key={i} style={{ flex: 1, background: p.color + "22", border: "2px solid " + p.color, borderRadius: 12, padding: 14, textAlign: "center" }}>
              <p style={{ color: p.color, fontSize: 12, fontWeight: 700, margin: "0 0 4px" }}>{p.name}</p>
              <p style={{ color: p.color, fontSize: 32, fontWeight: 900, margin: 0 }}>{p.score}</p>
              <p style={{ color: C.muted, fontSize: 10, margin: 0 }}>puntos</p>
            </div>
          ))}
        </div>
        {!hasResults && (
          <div style={{ background: C.card, borderRadius: 10, padding: 14, border: "1px solid " + C.border, fontSize: 12, color: C.muted, textAlign: "center" }}>
            Los puntos se actualizarán automáticamente cuando los partidos terminen.
          </div>
        )}
        {matchDetails.map(({ m, r, myP, otherP, myPts, otherPts }) => (
          <div key={m.id} style={{ background: C.card, borderRadius: 12, padding: 12, marginBottom: 8, border: "1px solid " + C.border }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <span style={{ color: C.muted, fontSize: 10 }}>{m.date} · Grupo {m.group}</span>
              <span style={{ color: C.accent, fontSize: 13, fontWeight: 700 }}>{r.home}–{r.away}</span>
            </div>
            <p style={{ color: C.text, fontSize: 11, margin: "0 0 4px" }}>{m.home} vs {m.away}</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span style={{ color: myColor, fontSize: 11 }}>{myName}: {myP.home !== undefined && myP.home !== "" ? myP.home + "–" + myP.away : "—"} {myPts !== null ? "(+" + myPts + "pts)" : ""}</span>
              <span style={{ color: C.muted }}>·</span>
              <span style={{ color: otherColor, fontSize: 11 }}>{otherName}: {otherP.home !== undefined && otherP.home !== "" ? otherP.home + "–" + otherP.away : "—"} {otherPts !== null ? "(+" + otherPts + "pts)" : ""}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderPrizes = () => (
    <div>
      <div style={{ textAlign: "center", marginBottom: 18 }}>
        <div style={{ fontSize: 44 }}>🎁</div>
        <h2 style={{ color: C.accent, fontSize: 17, margin: "6px 0 2px" }}>Premios</h2>
        <p style={{ color: C.muted, fontSize: 12 }}>Solo para {myName} y {otherName}</p>
      </div>
      {PRIZES.map((p, i) => (
        <div key={i} style={{ background: "linear-gradient(135deg," + C.card + "," + C.cardLight + ")", borderRadius: 14, padding: 16, marginBottom: 10, border: "1px solid " + C.accent + "33" }}>
          <div style={{ display: "flex", gap: 12 }}>
            <span style={{ fontSize: 30 }}>{p.emoji}</span>
            <div>
              <p style={{ color: C.accent, fontWeight: 900, fontSize: 14, margin: "0 0 4px" }}>{p.title}</p>
              <p style={{ color: C.text, fontSize: 13, margin: 0, lineHeight: 1.5 }}>{p.prize}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const content = { home: renderHome, live: renderLive, groups: renderGroups, knockout: renderKnockout, champion: renderChampion, scores: renderScores, prizes: renderPrizes };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "Georgia, serif", color: C.text }}>
      <div style={{ background: C.card, borderBottom: "2px solid " + myColor + "44", padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 10 }}>
        <div>
          <p style={{ color: myColor, fontSize: 12, fontWeight: 700, margin: 0 }}>⚽ Quiniela 2026</p>
          <p style={{ color: C.muted, fontSize: 10, margin: 0 }}>
            {myName}
            {saveStatus === "saving" && <span style={{ color: C.accent, marginLeft: 6 }}>💾 guardando...</span>}
            {saveStatus === "saved" && <span style={{ color: "#4ade80", marginLeft: 6 }}>✓ guardado</span>}
          </p>
        </div>
        <button onClick={() => { setScreen("login"); setPlayer(null); setMyData({}); setOtherData({}); }}
          style={{ background: C.cardLight, border: "1px solid " + C.border, color: C.muted, borderRadius: 8, padding: "5px 10px", cursor: "pointer", fontSize: 11 }}>
          Cambiar
        </button>
      </div>
      <div style={{ padding: "14px 14px 80px" }}>
        {(content[tab] || renderHome)()}
      </div>
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: C.card, borderTop: "1px solid " + C.border, display: "flex", justifyContent: "space-evenly", padding: "8px 0 10px" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "0 4px", borderBottom: tab === t.id ? "2px solid " + myColor : "2px solid transparent" }}>
            <span style={{ fontSize: 16 }}>{t.icon}</span>
            <span style={{ fontSize: 9, color: tab === t.id ? myColor : C.muted, fontWeight: tab === t.id ? 700 : 400, whiteSpace: "nowrap" }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
