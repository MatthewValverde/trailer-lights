import { useState, useEffect, useRef, useCallback } from "react";

const COLORS = {
  brake: "#ff1a1a",
  turn: "#ffaa00",
  hazard: "#ff1a1a",
  driving: "#661111",
  reverse: "#ffffff",
  off: "#1a1a1a",
};

function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function LoadingScreen() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#0a0a0a", color: "#666", fontFamily: "'JetBrains Mono', monospace", fontSize: 14, letterSpacing: 2 }}>
      LOADING PEERJS...
    </div>
  );
}

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

function resolveReceiverColor(base, turn, blinkOn, side) {
  if (base === "hazard") return blinkOn ? COLORS.hazard : COLORS.off;
  if (turn === "turnLeft" && side === "left") return blinkOn ? COLORS.turn : COLORS.off;
  if (turn === "turnRight" && side === "right") return blinkOn ? COLORS.turn : COLORS.off;
  if (base === "brake") return COLORS.brake;
  if (base === "driving") return COLORS.driving;
  if (base === "reverse") return COLORS.reverse;
  return COLORS.off;
}

function requestFullscreen() {
  const el = document.documentElement;
  try {
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else if (el.msRequestFullscreen) el.msRequestFullscreen();
  } catch (e) { console.log("Fullscreen not supported"); }
}

function exitFullscreen() {
  try {
    if (document.exitFullscreen) document.exitFullscreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    else if (document.msExitFullscreen) document.msExitFullscreen();
  } catch (e) { console.log("Exit fullscreen failed"); }
}

function useIsFullscreen() {
  const [fs, setFs] = useState(false);
  useEffect(() => {
    const handler = () => setFs(!!document.fullscreenElement || !!document.webkitFullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    document.addEventListener("webkitfullscreenchange", handler);
    return () => {
      document.removeEventListener("fullscreenchange", handler);
      document.removeEventListener("webkitfullscreenchange", handler);
    };
  }, []);
  return fs;
}

function FullscreenButton() {
  const isFs = useIsFullscreen();
  return (
    <button
      onClick={() => isFs ? exitFullscreen() : requestFullscreen()}
      style={{
        position: "fixed", bottom: 12, right: 16, background: "none", border: "1px solid #333",
        borderRadius: 4, padding: "4px 8px", cursor: "pointer", color: "#444",
        fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: 1,
        touchAction: "manipulation",
      }}
    >
      {isFs ? "EXIT FS" : "FULLSCREEN"}
    </button>
  );
}

// ─── TRAILER REAR VISUAL ─────────────────────────────────
function TrailerRear({ baseMode, turnSignal, blinkOn }) {
  const leftColor = resolveReceiverColor(baseMode, turnSignal, blinkOn, "left");
  const rightColor = resolveReceiverColor(baseMode, turnSignal, blinkOn, "right");
  const leftGlow = leftColor !== COLORS.off && leftColor !== COLORS.driving;
  const rightGlow = rightColor !== COLORS.off && rightColor !== COLORS.driving;

  return (
    <svg viewBox="0 0 280 140" style={{ width: "100%", maxWidth: 320 }}>
      <rect x="20" y="20" width="240" height="90" rx="8" fill="#1a1a1a" stroke="#333" strokeWidth="1.5" />
      <rect x="30" y="110" width="220" height="12" rx="3" fill="#222" stroke="#333" strokeWidth="1" />
      <rect x="125" y="122" width="30" height="14" rx="2" fill="#333" />
      <circle cx="140" cy="136" r="4" fill="#444" stroke="#555" strokeWidth="1" />
      <rect x="45" y="108" width="16" height="6" rx="2" fill="#2a2a2a" />
      <rect x="219" y="108" width="16" height="6" rx="2" fill="#2a2a2a" />
      <rect x="105" y="70" width="70" height="28" rx="3" fill="#222" stroke="#444" strokeWidth="0.8" />
      <text x="140" y="89" textAnchor="middle" fontSize="9" fontFamily="'JetBrains Mono', monospace" fill="#555">TRAILER</text>
      <rect x="30" y="32" width="48" height="64" rx="6" fill="#111" stroke="#333" strokeWidth="1" />
      <rect x="34" y="36" width="40" height="56" rx="4" fill={leftColor}
        style={{ filter: leftGlow ? `drop-shadow(0 0 12px ${leftColor}) drop-shadow(0 0 4px ${leftColor})` : "none", transition: leftColor === COLORS.off ? "all 0.15s" : "all 0.05s" }} />
      {[44,52,60,68,76,84].map(y => <line key={`l${y}`} x1="38" y1={y} x2="70" y2={y} stroke={leftColor === COLORS.off ? "#222" : "rgba(0,0,0,0.15)"} strokeWidth="0.8" />)}
      <rect x="202" y="32" width="48" height="64" rx="6" fill="#111" stroke="#333" strokeWidth="1" />
      <rect x="206" y="36" width="40" height="56" rx="4" fill={rightColor}
        style={{ filter: rightGlow ? `drop-shadow(0 0 12px ${rightColor}) drop-shadow(0 0 4px ${rightColor})` : "none", transition: rightColor === COLORS.off ? "all 0.15s" : "all 0.05s" }} />
      {[44,52,60,68,76,84].map(y => <line key={`r${y}`} x1="210" y1={y} x2="242" y2={y} stroke={rightColor === COLORS.off ? "#222" : "rgba(0,0,0,0.15)"} strokeWidth="0.8" />)}
      <circle cx="24" cy="64" r="3" fill={leftColor === COLORS.off ? "#222" : leftColor} style={{ filter: leftGlow ? `drop-shadow(0 0 4px ${leftColor})` : "none" }} />
      <circle cx="256" cy="64" r="3" fill={rightColor === COLORS.off ? "#222" : rightColor} style={{ filter: rightGlow ? `drop-shadow(0 0 4px ${rightColor})` : "none" }} />
    </svg>
  );
}

// ─── CONTROLLER ───────────────────────────────────────────
function Controller() {
  const [roomCode, setRoomCode] = useState("");
  const [peerReady, setPeerReady] = useState(false);
  const [connections, setConnections] = useState([]);
  const [baseMode, setBaseMode] = useState(null);
  const [turnSignal, setTurnSignal] = useState(null);
  const [blinkOn, setBlinkOn] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const peerRef = useRef(null);
  const connsRef = useRef([]);
  const blinkIntervalRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const code = generateRoomCode();
    setRoomCode(code);
    const peer = new window.Peer(`trailer-ctrl-${code}`);
    peerRef.current = peer;
    peer.on("open", () => setPeerReady(true));
    peer.on("connection", (conn) => {
      conn.on("open", () => {
        connsRef.current = [...connsRef.current, conn];
        setConnections([...connsRef.current]);
      });
      conn.on("close", () => {
        connsRef.current = connsRef.current.filter((c) => c !== conn);
        setConnections([...connsRef.current]);
      });
    });
    peer.on("error", (err) => console.error("Peer error:", err));
    return () => { peer.destroy(); if (blinkIntervalRef.current) clearInterval(blinkIntervalRef.current); };
  }, []);

  const broadcast = useCallback((msg) => {
    connsRef.current.forEach((c) => { try { c.send(msg); } catch (e) { console.error(e); } });
  }, []);

  const clearBlink = () => { if (blinkIntervalRef.current) { clearInterval(blinkIntervalRef.current); blinkIntervalRef.current = null; } };

  const broadcastState = useCallback((base, turn) => {
    broadcast({ base, turn });
  }, [broadcast]);

  const startBlink = useCallback((needsBlink) => {
    clearBlink();
    setBlinkOn(true);
    if (!needsBlink) return;
    let on = true;
    blinkIntervalRef.current = setInterval(() => {
      on = !on;
      setBlinkOn(on);
      broadcast({ blinkTick: on });
    }, 500);
  }, [broadcast]);

  const toggleBase = (mode) => {
    clearBlink();
    setBlinkOn(true);
    if (baseMode === mode) {
      setBaseMode(null);
      broadcastState(null, turnSignal);
      if (turnSignal) startBlink(true);
    } else {
      const nextTurn = mode === "hazard" ? null : turnSignal;
      if (mode === "hazard") setTurnSignal(null);
      setBaseMode(mode);
      broadcastState(mode, nextTurn);
      startBlink(mode === "hazard" || !!nextTurn);
    }
  };

  const toggleTurn = (dir) => {
    clearBlink();
    setBlinkOn(true);
    if (turnSignal === dir) {
      setTurnSignal(null);
      broadcastState(baseMode, null);
      if (baseMode === "hazard") startBlink(true);
    } else {
      const nextBase = baseMode === "hazard" ? null : baseMode;
      if (baseMode === "hazard") setBaseMode(null);
      setTurnSignal(dir);
      broadcastState(nextBase, dir);
      startBlink(true);
    }
  };

  const isActive = (signal) => {
    if (signal === "turnLeft" || signal === "turnRight") return turnSignal === signal;
    return baseMode === signal;
  };

  const btnStyle = (signal, color) => {
    const active = isActive(signal);
    return {
      width: "100%", padding: "22px 0", borderRadius: 6, fontSize: 15,
      fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, letterSpacing: 3,
      textTransform: "uppercase", cursor: "pointer", userSelect: "none",
      WebkitUserSelect: "none", touchAction: "manipulation", transition: "all 0.15s",
      border: active ? `2px solid ${color}` : "2px solid #2a2a2a",
      background: active ? color : "#1e1e1e",
      color: active ? (signal === "driving" ? "#ff6666" : "#000") : "#888",
      boxShadow: active ? `0 0 40px ${color}44` : "none",
    };
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", padding: "16px 16px 60px", fontFamily: "'JetBrains Mono', monospace", color: "#ccc", display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ textAlign: "center", marginBottom: 2 }}>
        <div style={{ fontSize: 10, color: "#555", letterSpacing: 4, marginBottom: 4 }}>CONTROLLER</div>
        <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: 8, color: "#fff" }}>{roomCode}</div>
        <div style={{ fontSize: 10, color: "#444", marginTop: 4 }}>
          {peerReady ? `${connections.length} receiver${connections.length !== 1 ? "s" : ""} connected` : "connecting..."}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "center", padding: "4px 0" }}>
        <TrailerRear baseMode={baseMode} turnSignal={turnSignal} blinkOn={blinkOn} />
      </div>
      <div style={{ height: 1, background: "#1e1e1e" }} />
      <button style={btnStyle("turnLeft", COLORS.turn)} onClick={() => toggleTurn("turnLeft")}>◀ LEFT TURN</button>
      <button style={{ ...btnStyle("brake", COLORS.brake), padding: "32px 0", fontSize: 20 }} onClick={() => toggleBase("brake")}>BRAKE</button>
      <button style={btnStyle("turnRight", COLORS.turn)} onClick={() => toggleTurn("turnRight")}>RIGHT TURN ▶</button>
      <div style={{ height: 1, background: "#1e1e1e" }} />
      <button style={btnStyle("hazard", COLORS.hazard)} onClick={() => toggleBase("hazard")}>⚠ HAZARD</button>
      <div style={{ display: "flex", gap: 10 }}>
        <button style={{ ...btnStyle("driving", COLORS.driving), flex: 1 }} onClick={() => toggleBase("driving")}>DRIVING</button>
        <button style={{ ...btnStyle("reverse", COLORS.reverse), flex: 1 }} onClick={() => toggleBase("reverse")}>REVERSE</button>
      </div>
      <div style={{ position: "fixed", bottom: 12, left: 16, fontSize: 11, color: "#333", fontFamily: "'JetBrains Mono', monospace", letterSpacing: 2 }}>
        {formatTime(elapsed)}
      </div>
      <FullscreenButton />
    </div>
  );
}

// ─── RECEIVER ─────────────────────────────────────────────
function Receiver() {
  const [side, setSide] = useState(null);
  const [code, setCode] = useState("");
  const [connected, setConnected] = useState(false);
  const [color, setColor] = useState(COLORS.off);
  const [error, setError] = useState("");
  const peerRef = useRef(null);
  const stateRef = useRef({ base: null, turn: null });

  const connect = () => {
    if (!code.trim() || !side) return;
    setError("");
    // Request fullscreen on the connect tap
    requestFullscreen();
    const peer = new window.Peer();
    peerRef.current = peer;
    peer.on("open", () => {
      const conn = peer.connect(`trailer-ctrl-${code.trim().toUpperCase()}`);
      conn.on("open", () => setConnected(true));
      conn.on("data", (msg) => {
        if (msg.blinkTick !== undefined) {
          setColor(resolveReceiverColor(stateRef.current.base, stateRef.current.turn, msg.blinkTick, side));
        } else {
          stateRef.current = { base: msg.base, turn: msg.turn };
          setColor(resolveReceiverColor(msg.base, msg.turn, true, side));
        }
      });
      conn.on("close", () => { setConnected(false); setColor(COLORS.off); });
      conn.on("error", () => setError("Connection failed"));
    });
    peer.on("error", () => setError("Could not find controller. Check code."));
  };

  useEffect(() => () => { peerRef.current?.destroy(); }, []);

  if (!connected) {
    const sideBtn = (s) => ({
      flex: 1, padding: "18px 0", borderRadius: 6,
      border: side === s ? "2px solid #ffaa00" : "2px solid #2a2a2a",
      background: side === s ? "#1a1500" : "#111",
      color: side === s ? "#ffaa00" : "#555",
      fontSize: 14, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, letterSpacing: 3, cursor: "pointer",
    });
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'JetBrains Mono', monospace", color: "#ccc", gap: 20 }}>
        <div style={{ fontSize: 11, color: "#555", letterSpacing: 4 }}>RECEIVER SETUP</div>
        <div style={{ display: "flex", gap: 12, width: "100%", maxWidth: 320 }}>
          <button style={sideBtn("left")} onClick={() => setSide("left")}>◀ LEFT</button>
          <button style={sideBtn("right")} onClick={() => setSide("right")}>RIGHT ▶</button>
        </div>
        <input type="text" placeholder="ROOM CODE" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} maxLength={5}
          style={{ width: "100%", maxWidth: 320, padding: "16px", border: "2px solid #2a2a2a", borderRadius: 6, background: "#111", color: "#fff", fontSize: 24, fontFamily: "'JetBrains Mono', monospace", textAlign: "center", letterSpacing: 12, outline: "none" }} />
        <button onClick={connect} disabled={!code.trim() || !side}
          style={{ width: "100%", maxWidth: 320, padding: "16px", border: "none", borderRadius: 6, background: code.trim() && side ? "#fff" : "#1e1e1e", color: code.trim() && side ? "#000" : "#444", fontSize: 14, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, letterSpacing: 3, cursor: "pointer" }}>
          CONNECT
        </button>
        {error && <div style={{ color: "#ff4444", fontSize: 12 }}>{error}</div>}
      </div>
    );
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: color, transition: color === COLORS.off ? "background 0.15s" : "background 0.05s", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", opacity: color === COLORS.off ? 0.3 : 0, transition: "opacity 0.3s", fontFamily: "'JetBrains Mono', monospace", color: "#444", fontSize: 11, letterSpacing: 4 }}>
        {side?.toUpperCase()} · READY
      </div>
    </div>
  );
}

// ─── APP SHELL ────────────────────────────────────────────
export default function App() {
  const [mode, setMode] = useState(null);
  const [peerLoaded, setPeerLoaded] = useState(false);

  useEffect(() => {
    if (window.Peer) { setPeerLoaded(true); return; }
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/peerjs/1.5.4/peerjs.min.js";
    s.onload = () => setPeerLoaded(true);
    document.head.appendChild(s);
  }, []);

  if (!peerLoaded) return <LoadingScreen />;
  if (!mode) {
    const choiceBtn = () => ({ width: "100%", maxWidth: 320, padding: "32px 0", border: "2px solid #2a2a2a", borderRadius: 6, background: "#111", color: "#ccc", fontSize: 14, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, letterSpacing: 4, cursor: "pointer" });
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, fontFamily: "'JetBrains Mono', monospace" }}>
        <div style={{ fontSize: 11, color: "#555", letterSpacing: 4, marginBottom: 8 }}>TRAILER LIGHTS</div>
        <button style={choiceBtn()} onClick={() => setMode("controller")}>CONTROLLER</button>
        <button style={choiceBtn()} onClick={() => setMode("receiver")}>RECEIVER</button>
      </div>
    );
  }
  return mode === "controller" ? <Controller /> : <Receiver />;
}