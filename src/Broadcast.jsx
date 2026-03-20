import { useState, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════
   TV 기괴한 연출 효과 프로토타입
   각 효과 ON/OFF 중첩 가능
   + 글리치 3단계 (light/medium/heavy)
   ═══════════════════════════════════════════ */

const GC = "░▒▓█▄▀▐▌■□▢▣▤▥▦▧▨▩⌧⊞⊟⊠⊡⊘⊗⊕⊖";
const corrupt = (n) => { let s = ""; for (let i = 0; i < n; i++) s += Math.random() < .25 ? " " : GC[Math.floor(Math.random() * GC.length)]; return s; };

function CorruptText({ length }) {
  const [t, setT] = useState(() => corrupt(length));
  useEffect(() => { const iv = setInterval(() => setT(corrupt(length)), 70); return () => clearInterval(iv); }, [length]);
  return <span className="corrupt-txt">{t}</span>;
}

function CorruptBody({ intensity }) {
  const [ls, setLs] = useState([]);
  const count = intensity === "heavy" ? 6 : intensity === "medium" ? 4 : 2;
  useEffect(() => {
    const iv = setInterval(() => {
      const a = [];
      for (let i = 0; i < count; i++) a.push(5 + Math.floor(Math.random() * 15));
      setLs(a);
    }, intensity === "heavy" ? 50 : 90);
    return () => clearInterval(iv);
  }, [count, intensity]);
  return <div className="corrupt-body">{ls.map((l, i) => <p key={i} className="corrupt-line"><CorruptText length={l} /></p>)}</div>;
}

function CorruptHeader({ length, intensity }) {
  const [t, setT] = useState(() => corrupt(length));
  useEffect(() => {
    const spd = intensity === "heavy" ? 40 : intensity === "medium" ? 60 : 80;
    const iv = setInterval(() => setT(corrupt(length)), spd);
    return () => clearInterval(iv);
  }, [length, intensity]);
  return <span className={`corrupt-header-txt g-${intensity}`}>{t}</span>;
}

// ── Eerie text effects ──
function EerieText({ text, effects, warning }) {
  const [trembleOffset, setTrembleOffset] = useState({ x: 0, y: 0 });
  const [charOffsets, setCharOffsets] = useState([]);
  const [alignShift, setAlignShift] = useState("center");
  const [sizeShift, setSizeShift] = useState(1);
  const [lineShift, setLineShift] = useState(0);
  const [colorGlitch, setColorGlitch] = useState(null);
  const [ghostVisible, setGhostVisible] = useState(false);
  const [ghostOffset, setGhostOffset] = useState({ x: 0, y: 0 });
  const [invertFlash, setInvertFlash] = useState(false);
  const [missingChar, setMissingChar] = useState(-1);
  const [insertedChar, setInsertedChar] = useState({ idx: -1, char: "" });

  // Micro tremble (always-on feel)
  useEffect(() => {
    if (!effects.tremble) return;
    const iv = setInterval(() => {
      setTrembleOffset({
        x: (Math.random() - 0.5) * 1.5,
        y: (Math.random() - 0.5) * 1.5,
      });
    }, 60);
    return () => clearInterval(iv);
  }, [effects.tremble]);

  // Per-character shake
  useEffect(() => {
    if (!effects.charShake) { setCharOffsets([]); return; }
    const iv = setInterval(() => {
      setCharOffsets(text.split("").map(() => ({
        x: (Math.random() - 0.5) * 4,
        y: (Math.random() - 0.5) * 4,
      })));
    }, 80);
    return () => clearInterval(iv);
  }, [effects.charShake, text]);

  // Random alignment
  useEffect(() => {
    if (!effects.alignShift) { setAlignShift("center"); return; }
    const iv = setInterval(() => {
      const aligns = ["center", "left", "right", "center", "center"];
      setAlignShift(aligns[Math.floor(Math.random() * aligns.length)]);
    }, 800 + Math.random() * 2000);
    return () => clearInterval(iv);
  }, [effects.alignShift]);

  // Size fluctuation
  useEffect(() => {
    if (!effects.sizeFlux) { setSizeShift(1); return; }
    const iv = setInterval(() => {
      setSizeShift(0.85 + Math.random() * 0.35);
    }, 500 + Math.random() * 1500);
    return () => clearInterval(iv);
  }, [effects.sizeFlux]);

  // Line spacing shift
  useEffect(() => {
    if (!effects.lineShift) { setLineShift(0); return; }
    const iv = setInterval(() => {
      setLineShift((Math.random() - 0.5) * 8);
    }, 600 + Math.random() * 1000);
    return () => clearInterval(iv);
  }, [effects.lineShift]);

  // Color glitch
  useEffect(() => {
    if (!effects.colorGlitch) { setColorGlitch(null); return; }
    const iv = setInterval(() => {
      if (Math.random() < 0.3) {
        const colors = ["#c05040", "#40c050", "#4050c0", "#c0c040", "#c040c0", "#f0f0f0"];
        setColorGlitch(colors[Math.floor(Math.random() * colors.length)]);
      } else {
        setColorGlitch(null);
      }
    }, 300 + Math.random() * 500);
    return () => clearInterval(iv);
  }, [effects.colorGlitch]);

  // Ghost / afterimage
  useEffect(() => {
    if (!effects.ghost) { setGhostVisible(false); return; }
    const iv = setInterval(() => {
      if (Math.random() < 0.4) {
        setGhostVisible(true);
        setGhostOffset({
          x: (Math.random() - 0.5) * 6,
          y: (Math.random() - 0.5) * 6,
        });
      } else {
        setGhostVisible(false);
      }
    }, 150);
    return () => clearInterval(iv);
  }, [effects.ghost]);

  // Invert flash
  useEffect(() => {
    if (!effects.invertFlash) { setInvertFlash(false); return; }
    const iv = setInterval(() => {
      if (Math.random() < 0.15) {
        setInvertFlash(true);
        setTimeout(() => setInvertFlash(false), 50 + Math.random() * 80);
      }
    }, 400 + Math.random() * 800);
    return () => clearInterval(iv);
  }, [effects.invertFlash]);

  // Missing char
  useEffect(() => {
    if (!effects.missingChar) { setMissingChar(-1); return; }
    const iv = setInterval(() => {
      if (Math.random() < 0.3 && text.length > 0) {
        setMissingChar(Math.floor(Math.random() * text.length));
      } else {
        setMissingChar(-1);
      }
    }, 400 + Math.random() * 600);
    return () => clearInterval(iv);
  }, [effects.missingChar, text]);

  // Inserted random char
  useEffect(() => {
    if (!effects.insertChar) { setInsertedChar({ idx: -1, char: "" }); return; }
    const iv = setInterval(() => {
      if (Math.random() < 0.25 && text.length > 0) {
        const chars = "ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎ█▓░";
        setInsertedChar({
          idx: Math.floor(Math.random() * text.length),
          char: chars[Math.floor(Math.random() * chars.length)],
        });
      } else {
        setInsertedChar({ idx: -1, char: "" });
      }
    }, 300 + Math.random() * 500);
    return () => clearInterval(iv);
  }, [effects.insertChar, text]);

  const baseStyle = {
    textAlign: effects.alignShift ? alignShift : "center",
    fontSize: `${0.73 * sizeShift}rem`,
    marginTop: effects.lineShift ? `${lineShift}px` : 0,
    transform: effects.tremble ? `translate(${trembleOffset.x}px, ${trembleOffset.y}px)` : "none",
    color: colorGlitch || (warning ? "#c05040" : "#b0aca5"),
    filter: invertFlash ? "invert(1)" : "none",
    position: "relative",
  };

  const renderChars = () => {
    if (!effects.charShake && !effects.missingChar && !effects.insertChar) return text;
    return text.split("").map((ch, i) => {
      if (effects.missingChar && i === missingChar) return <span key={i} style={{ opacity: 0 }}>{ch}</span>;
      const inserted = effects.insertChar && i === insertedChar.idx;
      const shakeStyle = effects.charShake && charOffsets[i] ? {
        display: "inline-block",
        transform: `translate(${charOffsets[i].x}px, ${charOffsets[i].y}px)`,
      } : {};
      return (
        <span key={i}>
          {inserted && <span style={{ color: "#c05040", opacity: 0.5 }}>{insertedChar.char}</span>}
          <span style={shakeStyle}>{ch}</span>
        </span>
      );
    });
  };

  return (
    <div style={baseStyle} className="eerie-line">
      {effects.ghost && ghostVisible && (
        <div className="ghost-text" style={{
          transform: `translate(${ghostOffset.x}px, ${ghostOffset.y}px)`,
        }}>{text}</div>
      )}
      {renderChars()}
    </div>
  );
}

// ── TV ──
function TV({ children, header, glitch, intensity, effects, bgColor }) {
  const cls = [
    "tv-sc",
    glitch ? `tv-g-${intensity}` : "",
    bgColor === "red" ? "tv-bg-red" : "",
  ].filter(Boolean).join(" ");

  return (
    <div className="tv-outer">
      <div className="tv-bz">
        <div className={cls}>
          <div className="tv-sl" />
          <div className="tv-vg" />
          {glitch && intensity !== "light" && (
            <>
              <div className={`tv-chroma-r g-${intensity}`} />
              <div className={`tv-chroma-b g-${intensity}`} />
            </>
          )}
          {glitch && intensity === "heavy" && <div className="tv-tear" />}
          {effects.scanlineBad && <div className="tv-sl-bad" />}
          <div className="tv-ct">
            <div className="tv-ha">
              {glitch ? (
                <>
                  <div className="tv-h tv-hc"><CorruptHeader length={header ? header.length + 4 : 12} intensity={intensity} /></div>
                  <div className={`tv-hlc g-${intensity}`} />
                </>
              ) : header ? (
                <>
                  <div className="tv-h">{header}</div>
                  <div className="tv-hl" />
                </>
              ) : <div className="tv-he" />}
            </div>
            <div className="tv-bd">
              {glitch ? <CorruptBody intensity={intensity} /> : children}
            </div>
          </div>
        </div>
        <div className="tv-bt">
          <span className="tv-br">LIMINAL</span>
          <div className="tv-led on" />
        </div>
      </div>
    </div>
  );
}

const SAMPLE_LINES = [
  { text: "귀하의 안전을 위해", warning: false },
  { text: "반드시 실내에 머무르십시오.", warning: false },
  { text: "", warning: false },
  { text: "절대 밤하늘을", warning: true },
  { text: "쳐다보지 마십시오.", warning: true },
  { text: "", warning: false },
  { text: "실내의 모든 창문을 닫고", warning: false },
  { text: "외부 빛을 차단하십시오.", warning: false },
];

const EFFECTS_LIST = [
  { key: "tremble", name: "미세 떨림", desc: "텍스트가 미세하게 흔들림 (브라운관)" },
  { key: "charShake", name: "글자별 흔들림", desc: "각 글자가 개별적으로 떨림" },
  { key: "alignShift", name: "정렬 변환", desc: "중앙↔좌↔우 랜덤 전환" },
  { key: "sizeFlux", name: "크기 변동", desc: "글자 크기가 불규칙하게 변함" },
  { key: "lineShift", name: "줄 간격 흔들림", desc: "줄 간격이 불규칙해짐" },
  { key: "colorGlitch", name: "색상 글리치", desc: "텍스트 색이 순간적으로 바뀜" },
  { key: "ghost", name: "잔상", desc: "텍스트 잔상이 어긋나서 겹침" },
  { key: "invertFlash", name: "색 반전", desc: "순간적으로 색이 반전됨" },
  { key: "missingChar", name: "글자 빠짐", desc: "랜덤으로 글자 하나가 사라짐" },
  { key: "insertChar", name: "이상 글자 삽입", desc: "의미 없는 글자가 끼어듦" },
  { key: "scanlineBad", name: "스캔라인 왜곡", desc: "가로줄이 심하게 보임" },
];

export default function EerieProto() {
  const [effects, setEffects] = useState({
    tremble: false, charShake: false, alignShift: false,
    sizeFlux: false, lineShift: false, colorGlitch: false,
    ghost: false, invertFlash: false, missingChar: false,
    insertChar: false, scanlineBad: false,
  });
  const [glitch, setGlitch] = useState(null);
  const [looping, setLooping] = useState(false);
  const [bgColor, setBgColor] = useState("dark");
  const timer = useRef(null);

  const toggle = (key) => setEffects(p => ({ ...p, [key]: !p[key] }));
  const allOn = () => setEffects(Object.fromEntries(EFFECTS_LIST.map(e => [e.key, true])));
  const allOff = () => setEffects(Object.fromEntries(EFFECTS_LIST.map(e => [e.key, false])));

  const triggerGlitch = (level) => {
    setGlitch(level);
    const dur = level === "heavy" ? 300 : level === "medium" ? 250 : 200;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setGlitch(null), dur);
  };

  const startLoop = (level) => {
    setLooping(true);
    const go = () => {
      setGlitch(level);
      const dur = level === "heavy" ? 300 : level === "medium" ? 250 : 200;
      const gap = level === "heavy" ? 800 : level === "medium" ? 1200 : 2000;
      timer.current = setTimeout(() => {
        setGlitch(null);
        timer.current = setTimeout(go, gap);
      }, dur);
    };
    go();
  };

  const stopLoop = () => {
    setLooping(false);
    if (timer.current) clearTimeout(timer.current);
    setGlitch(null);
  };

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  return (<>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@200;300;400;500;700&family=Share+Tech+Mono&display=swap');
      *{box-sizing:border-box;margin:0;padding:0}
      .root{background:#06060a;min-height:100vh;display:flex;flex-direction:column;align-items:center;padding:1rem .8rem;font-family:'Noto Sans KR',sans-serif;color:#c0bbb5}
      .title{font-size:.7rem;color:#4a4540;letter-spacing:.2em;margin-bottom:1rem}

      /* TV */
      .tv-outer{width:380px;margin-bottom:.8rem}
      .tv-bz{background:linear-gradient(180deg,#1e1e22,#161618);border:2px solid #2a2a30;border-radius:8px;padding:12px;box-shadow:0 4px 40px rgba(0,0,0,.7)}
      .tv-sc{position:relative;background:#08080c;border-radius:4px;width:100%;height:280px;overflow:hidden}
      .tv-sc.tv-bg-red{background:#8a2020}
      .tv-sl{position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.06) 2px,rgba(0,0,0,.06) 4px);pointer-events:none;z-index:3}
      .tv-sl-bad{position:absolute;inset:0;pointer-events:none;z-index:3;
        background:repeating-linear-gradient(0deg,transparent,transparent 1px,rgba(0,0,0,.25) 1px,rgba(0,0,0,.25) 3px);
        animation:slBad .03s steps(3) infinite}
      @keyframes slBad{0%{transform:translateY(0);opacity:.8}33%{transform:translateY(2px);opacity:.5}66%{transform:translateY(-1px);opacity:.9}100%{transform:translateY(1px);opacity:.6}}
      .tv-vg{position:absolute;inset:0;background:radial-gradient(ellipse at center,transparent 55%,rgba(0,0,0,.5) 100%);pointer-events:none;z-index:4}
      .tv-ct{position:relative;z-index:2;height:100%;display:flex;flex-direction:column;overflow:hidden}
      .tv-ha{flex-shrink:0;padding:.8rem 1.2rem 0;text-align:center;min-height:48px}
      .tv-h{font-family:'Share Tech Mono',monospace;font-size:.8rem;font-weight:500;color:#d0ccc5;letter-spacing:.25em;padding-bottom:.45rem}
      .tv-hl{height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.12),transparent);margin:0 .8rem}
      .tv-he{height:8px}
      .tv-hc{color:transparent;padding-bottom:.45rem}
      .tv-bd{flex:1;padding:.6rem 1.4rem .8rem;overflow:hidden;display:flex;flex-direction:column;justify-content:center}
      .tv-bt{display:flex;align-items:center;justify-content:space-between;padding:.4rem .6rem .2rem}
      .tv-br{font-family:'Share Tech Mono',monospace;font-size:.5rem;letter-spacing:.5em;color:#2a2a30}
      .tv-led{width:5px;height:5px;border-radius:50%;background:#1a1a1e}
      .tv-led.on{background:#8a4030;box-shadow:0 0 5px rgba(138,64,48,.4)}

      /* Corrupt */
      .corrupt-body{text-align:center}
      .corrupt-line{font-family:'Share Tech Mono',monospace;font-size:.7rem;color:#c05040;opacity:.5;margin:.2em 0;letter-spacing:.08em}
      .corrupt-header-txt{font-family:'Share Tech Mono',monospace;font-size:.8rem;letter-spacing:.12em;opacity:.7}
      .corrupt-header-txt.g-light{color:#c05040;opacity:.5}
      .corrupt-header-txt.g-medium{color:#c05040;opacity:.7}
      .corrupt-header-txt.g-heavy{color:#ff4030;opacity:.9}
      .tv-hlc{height:1px;margin:0 .8rem}
      .tv-hlc.g-light{background:linear-gradient(90deg,transparent,rgba(192,80,64,.15),transparent)}
      .tv-hlc.g-medium{background:linear-gradient(90deg,transparent,rgba(192,80,64,.3),transparent)}
      .tv-hlc.g-heavy{background:linear-gradient(90deg,transparent,rgba(255,60,40,.5),transparent)}

      /* Glitch levels */
      .tv-g-light{animation:gLight .1s steps(2) infinite}
      @keyframes gLight{0%{transform:translate(0)}50%{transform:translate(-1px,.5px)}100%{transform:translate(.5px,-.5px)}}
      .tv-g-medium{animation:gMed .06s steps(2) infinite}
      @keyframes gMed{0%{transform:translate(0);filter:brightness(1)}25%{transform:translate(-2px,1px);filter:brightness(1.4)}50%{transform:translate(1px,-1px);filter:brightness(.7)}75%{transform:translate(-1px,2px);filter:brightness(1.2)}100%{transform:translate(0);filter:brightness(1)}}
      .tv-g-heavy{animation:gHeavy .04s steps(3) infinite}
      @keyframes gHeavy{0%{transform:translate(0) skewX(0);filter:brightness(1) hue-rotate(0)}20%{transform:translate(-4px,2px) skewX(-1deg);filter:brightness(2) hue-rotate(90deg)}40%{transform:translate(3px,-3px) skewX(1.5deg);filter:brightness(.3) hue-rotate(180deg)}60%{transform:translate(-2px,4px) skewX(-2deg);filter:brightness(1.8) hue-rotate(270deg)}80%{transform:translate(4px,-1px) skewX(.5deg);filter:brightness(.5) hue-rotate(360deg)}100%{transform:translate(0) skewX(0);filter:brightness(1) hue-rotate(0)}}
      .tv-chroma-r,.tv-chroma-b{position:absolute;inset:0;z-index:7;pointer-events:none;mix-blend-mode:screen}
      .tv-chroma-r.g-medium{background:rgba(255,0,0,.05);animation:chromaR .08s steps(2) infinite}
      .tv-chroma-b.g-medium{background:rgba(0,0,255,.05);animation:chromaB .08s steps(2) infinite}
      .tv-chroma-r.g-heavy{background:rgba(255,0,0,.12);animation:chromaR .04s steps(3) infinite}
      .tv-chroma-b.g-heavy{background:rgba(0,0,255,.12);animation:chromaB .04s steps(3) infinite}
      @keyframes chromaR{0%{transform:translate(0)}50%{transform:translate(3px,-1px)}100%{transform:translate(-2px,1px)}}
      @keyframes chromaB{0%{transform:translate(0)}50%{transform:translate(-3px,1px)}100%{transform:translate(2px,-1px)}}
      .tv-tear{position:absolute;z-index:8;pointer-events:none;left:0;right:0;height:3px;background:rgba(255,255,255,.15);animation:tearMove .06s steps(4) infinite}
      @keyframes tearMove{0%{top:20%}25%{top:50%}50%{top:80%}75%{top:35%}100%{top:65%}}
      .tv-g-medium::after,.tv-g-heavy::after{content:'';position:absolute;inset:0;z-index:6;pointer-events:none;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E");mix-blend-mode:overlay;animation:staticA .05s steps(4) infinite}
      .tv-g-medium::after{opacity:.3}
      .tv-g-heavy::after{opacity:.6}
      @keyframes staticA{0%{transform:translate(0,0)}25%{transform:translate(-5%,-3%)}50%{transform:translate(3%,5%)}75%{transform:translate(-3%,-5%)}100%{transform:translate(5%,3%)}}

      /* Eerie text */
      .eerie-line{font-family:'Share Tech Mono',monospace;line-height:1.85;position:relative;min-height:.6em;margin:.02em 0;transition:text-align .3s}
      .ghost-text{position:absolute;inset:0;color:rgba(192,80,64,.2);pointer-events:none;filter:blur(1px)}

      /* Controls */
      .controls{width:380px;display:flex;flex-direction:column;gap:.6rem}
      .section{background:#0a0a0e;border:1px solid rgba(255,255,255,.04);border-radius:4px;padding:.6rem .7rem}
      .section-label{font-size:.58rem;color:#4a4540;letter-spacing:.2em;margin-bottom:.4rem;text-transform:uppercase;display:flex;justify-content:space-between;align-items:center}
      .section-label-btns{display:flex;gap:.3rem}
      .mini-btn{background:none;border:1px solid rgba(255,255,255,.06);color:#555;font-size:.5rem;padding:.2em .5em;cursor:pointer;border-radius:2px;transition:all .2s}
      .mini-btn:hover{color:#999;border-color:rgba(255,255,255,.15)}
      .toggle-grid{display:flex;flex-wrap:wrap;gap:.3rem}
      .toggle-btn{background:#0e0e14;border:1px solid rgba(255,255,255,.06);color:#706b65;font-family:'Noto Sans KR',sans-serif;font-size:.6rem;font-weight:300;padding:.35em .7em;cursor:pointer;transition:all .2s;border-radius:2px;position:relative}
      .toggle-btn:hover{border-color:rgba(150,120,80,.2);color:#a09a90}
      .toggle-btn.on{border-color:rgba(138,64,48,.4);color:#c0a090;background:#14101a}
      .toggle-btn .dot{position:absolute;top:3px;right:3px;width:4px;height:4px;border-radius:50%;background:#8a4030;opacity:0;transition:opacity .2s}
      .toggle-btn.on .dot{opacity:1}
      .glitch-btns{display:flex;gap:.3rem;flex-wrap:wrap}
      .g-btn{background:#0e0e14;border:1px solid rgba(255,255,255,.06);color:#706b65;font-family:'Noto Sans KR',sans-serif;font-size:.6rem;font-weight:300;padding:.35em .7em;cursor:pointer;transition:all .2s;border-radius:2px}
      .g-btn:hover{border-color:rgba(150,120,80,.2);color:#a09a90}
      .g-btn.active{border-color:#8a4030;color:#d0a090}
      .bg-btns{display:flex;gap:.3rem}
    `}</style>

    <div className="root">
      <div className="title">TV 연출 효과 프로토타입</div>

      <TV header="대국민 위험 경보" glitch={!!glitch} intensity={glitch || "light"} effects={effects} bgColor={bgColor}>
        <div style={{ width: "100%" }}>
          {SAMPLE_LINES.map((line, i) =>
            line.text === "" ? <div key={i} style={{ height: ".4em" }} /> :
            <EerieText key={i} text={line.text} effects={effects} warning={line.warning} />
          )}
        </div>
      </TV>

      <div className="controls">
        {/* Text effects */}
        <div className="section">
          <div className="section-label">
            텍스트 효과
            <div className="section-label-btns">
              <button className="mini-btn" onClick={allOn}>전체 ON</button>
              <button className="mini-btn" onClick={allOff}>전체 OFF</button>
            </div>
          </div>
          <div className="toggle-grid">
            {EFFECTS_LIST.map(e => (
              <button key={e.key} className={`toggle-btn ${effects[e.key] ? "on" : ""}`} onClick={() => toggle(e.key)} title={e.desc}>
                <span className="dot" />
                {e.name}
              </button>
            ))}
          </div>
        </div>

        {/* Glitch */}
        <div className="section">
          <div className="section-label">글리치</div>
          <div className="glitch-btns">
            <button className="g-btn" onClick={() => triggerGlitch("light")}>Light</button>
            <button className="g-btn" onClick={() => triggerGlitch("medium")}>Medium</button>
            <button className="g-btn" onClick={() => triggerGlitch("heavy")}>Heavy</button>
            <span style={{ color: "#333", margin: "0 .2rem" }}>|</span>
            {!looping ? (
              <>
                <button className="g-btn" onClick={() => startLoop("light")}>L 반복</button>
                <button className="g-btn" onClick={() => startLoop("medium")}>M 반복</button>
                <button className="g-btn" onClick={() => startLoop("heavy")}>H 반복</button>
              </>
            ) : (
              <button className="g-btn active" onClick={stopLoop}>■ 정지</button>
            )}
          </div>
        </div>

        {/* BG color */}
        <div className="section">
          <div className="section-label">TV 배경</div>
          <div className="bg-btns">
            <button className={`g-btn ${bgColor === "dark" ? "active" : ""}`} onClick={() => setBgColor("dark")}>기본 (어두운)</button>
            <button className={`g-btn ${bgColor === "red" ? "active" : ""}`} onClick={() => setBgColor("red")}>위험 (빨간)</button>
          </div>
        </div>
      </div>
    </div>
  </>);
}
