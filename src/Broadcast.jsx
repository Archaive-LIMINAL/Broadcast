import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════
   VHS + 글리치 프로토타입 v4
   개별 VHS 효과 ON/OFF
   + 글리치 강도 (light/medium/heavy) 단발/반복
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
  useEffect(() => { const iv = setInterval(() => { const a = []; for (let i = 0; i < count; i++) a.push(5 + Math.floor(Math.random() * 15)); setLs(a); }, intensity === "heavy" ? 50 : 90); return () => clearInterval(iv); }, [count, intensity]);
  return <div className="corrupt-body">{ls.map((l, i) => <p key={i} className="corrupt-line"><CorruptText length={l} /></p>)}</div>;
}
function CorruptHeader({ length, intensity }) {
  const [t, setT] = useState(() => corrupt(length));
  useEffect(() => { const spd = intensity === "heavy" ? 40 : intensity === "medium" ? 60 : 80; const iv = setInterval(() => setT(corrupt(length)), spd); return () => clearInterval(iv); }, [length, intensity]);
  return <span className={`corrupt-header-txt g-${intensity}`}>{t}</span>;
}

// ── VHS Canvas Overlay ──
function VHSOverlay({ width, height, effects, intensity }) {
  const canvasRef = useRef(null);
  const frameRef = useRef(0);
  const rafRef = useRef(null);
  const int = intensity || 0.5;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    const frame = frameRef.current++;
    ctx.clearRect(0, 0, w, h);

    if (effects.hsync) {
      const dy = (frame * 2.5 + 100) % h;
      const dh = 3 + Math.random() * 5;
      const shift = (Math.random() - 0.5) * (6 + int * 14);
      ctx.fillStyle = `rgba(0,0,0,${0.1 + int * 0.25})`;
      ctx.fillRect(0, dy, w, dh);
      if (Math.random() < 0.15 + int * 0.25) { ctx.fillStyle = `rgba(255,255,255,${0.01 + int * 0.04})`; ctx.fillRect(0, Math.random() * h, w, 1 + Math.random() * 2); }
    }
    if (effects.noise) {
      const cnt = Math.floor(3 + int * 8);
      for (let i = 0; i < cnt; i++) { const ny = Math.random() * h; const nw = 20 + Math.random() * (w * 0.5); ctx.fillStyle = `rgba(255,255,255,${0.005 + int * 0.025})`; ctx.fillRect(Math.random() * (w - nw), ny, nw, 1); }
      if (Math.random() < 0.01 + int * 0.04) { ctx.fillStyle = `rgba(255,255,255,${0.02 + int * 0.06})`; ctx.fillRect(0, Math.random() * h, w, 2 + Math.random() * 3); }
    }
    if (effects.scanlines) {
      ctx.fillStyle = `rgba(0,0,0,${0.08 + int * 0.18})`;
      for (let y = 0; y < h; y += 3) ctx.fillRect(0, y, w, 1);
    }
    if (effects.rolling) {
      const ry = (frame * (0.4 + int * 0.6)) % (h * 2) - h;
      const rh = h * (0.2 + int * 0.2);
      const rg = ctx.createLinearGradient(0, ry, 0, ry + rh);
      rg.addColorStop(0, "rgba(0,0,0,0)"); rg.addColorStop(0.5, `rgba(0,0,0,${0.1 + int * 0.3})`); rg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = rg; ctx.fillRect(0, ry, w, rh);
    }
    if (effects.brightness) {
      const b = Math.sin(frame * 0.05) * (0.008 + int * 0.025) + (Math.random() - 0.5) * int * 0.02;
      ctx.fillStyle = b > 0 ? `rgba(255,255,255,${b})` : `rgba(0,0,0,${-b})`;
      ctx.fillRect(0, 0, w, h);
    }
    if (effects.colorBleed) {
      const o = (1 + int * 2.5) + Math.sin(frame * 0.03) * int;
      ctx.globalCompositeOperation = "screen";
      ctx.fillStyle = `rgba(255,0,0,${0.008 + int * 0.025})`; ctx.fillRect(o, 0, w, h);
      ctx.fillStyle = `rgba(0,0,255,${0.008 + int * 0.025})`; ctx.fillRect(-o, 0, w, h);
      ctx.globalCompositeOperation = "source-over";
    }
    if (effects.bottomBand) {
      const bh = (6 + int * 12) + Math.sin(frame * 0.04) * (2 + int * 4);
      const by = h - bh;
      ctx.fillStyle = `rgba(0,0,0,${0.15 + int * 0.3})`; ctx.fillRect(0, by, w, bh);
      const nc = Math.floor(1 + int * 4);
      for (let i = 0; i < nc; i++) { ctx.fillStyle = `rgba(255,255,255,${0.02 + int * 0.06})`; ctx.fillRect(0, by + Math.random() * bh, w, 1); }
    }
    if (effects.flicker) {
      if (Math.random() < 0.01 + int * 0.03) { ctx.fillStyle = `rgba(255,255,255,${0.01 + int * 0.03})`; ctx.fillRect(0, 0, w, h); }
      if (Math.random() < 0.008 + int * 0.015) { ctx.fillStyle = `rgba(0,0,0,${0.03 + int * 0.08})`; ctx.fillRect(0, 0, w, h); }
    }
    if (effects.ghost) {
      const go = (5 + int * 10) + Math.sin(frame * 0.02) * (1 + int * 3);
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 0.02 + int * 0.06; ctx.drawImage(canvas, go, 0, w, h);
      ctx.globalAlpha = 0.01 + int * 0.03; ctx.drawImage(canvas, go * 1.8, 1, w, h);
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
    }
    if (effects.vhold) {
      const sy = (frame * (0.2 + int * 0.3 + Math.sin(frame * 0.01) * 0.2)) % h;
      const sh = 2 + int * 3;
      ctx.fillStyle = `rgba(255,255,255,${0.05 + int * 0.1})`; ctx.fillRect(0, sy, w, sh);
      ctx.fillStyle = `rgba(0,0,0,${0.2 + int * 0.3})`; ctx.fillRect(0, sy + sh, w, 2);
    }
    if (effects.snow) {
      const cnt = Math.floor(30 + int * 200);
      for (let i = 0; i < cnt; i++) {
        ctx.fillStyle = `rgba(255,255,255,${0.015 + int * 0.05})`;
        ctx.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * (0.5 + int), 1 + Math.random() * (0.5 + int));
      }
    }
    if (effects.headSwitch) {
      const hy = h - 8 - Math.random() * 4;
      if (Math.random() < 0.2 + int * 0.4) { ctx.fillStyle = `rgba(255,255,255,${0.04 + int * 0.1})`; ctx.fillRect(0, hy, w, 2 + Math.random() * (1 + int * 2)); }
    }
    if (effects.curvature) {
      const cg = ctx.createRadialGradient(w/2, h/2, w*0.25, w/2, h/2, w*0.65);
      cg.addColorStop(0, "rgba(0,0,0,0)"); cg.addColorStop(0.7, `rgba(0,0,0,${0.04 + int * 0.08})`); cg.addColorStop(1, `rgba(0,0,0,${0.2 + int * 0.3})`);
      ctx.fillStyle = cg; ctx.fillRect(0, 0, w, h);
    }

    rafRef.current = requestAnimationFrame(draw);
  }, [effects, int]);

  useEffect(() => { rafRef.current = requestAnimationFrame(draw); return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }; }, [draw]);
  return <canvas ref={canvasRef} width={width} height={height} className="vhs-canvas" />;
}

// ── TV ──
function TV({ children, header, effects, glitch, glitchIntensity, glitchText, intensity }) {
  const gi = glitchIntensity || "light";
  const gt = glitchText !== false; // default true
  const cls = ["tv-sc", effects.curvature ? "tv-curved" : "", glitch ? `tv-g-${gi}` : ""].filter(Boolean).join(" ");

  return (
    <div className="tv-outer">
      <div className="tv-bz">
        <div className={cls}>
          <div className="tv-sl-base" />
          <div className="tv-vg" />
          <VHSOverlay width={356} height={280} effects={effects} intensity={intensity} />
          {glitch && gi !== "light" && <><div className={`tv-chroma-r g-${gi}`} /><div className={`tv-chroma-b g-${gi}`} /></>}
          {glitch && gi === "heavy" && <div className="tv-tear" />}
          <div className="tv-ct">
            <div className="tv-ha">
              {glitch && gt ? (
                <><div className="tv-h tv-hc"><CorruptHeader length={12} intensity={gi} /></div><div className={`tv-hlc g-${gi}`} /></>
              ) : header ? (
                <><div className="tv-h" style={glitch && !gt ? {opacity:0} : {}}>{header}</div><div className="tv-hl" style={glitch && !gt ? {opacity:0} : {}} /></>
              ) : <div className="tv-he" />}
            </div>
            <div className="tv-bd">
              {glitch && gt ? <CorruptBody intensity={gi} /> :
               glitch && !gt ? <div style={{opacity:0}}>{children}</div> :
               children}
            </div>
          </div>
        </div>
        <div className="tv-bt"><span className="tv-br">LIMINAL</span><div className="tv-led on" /></div>
      </div>
    </div>
  );
}

const SAMPLE = [
  { text: "귀하의 안전을 위해" }, { text: "반드시 실내에 머무르십시오." }, { text: "" },
  { text: "절대 밤하늘을", warning: true }, { text: "쳐다보지 마십시오.", warning: true }, { text: "" },
  { text: "실내의 모든 창문을 닫고" }, { text: "외부 빛을 차단하십시오." },
];

const VHS_EFFECTS = [
  { key: "hsync", name: "수평 동기 어긋남" },
  { key: "noise", name: "VHS 노이즈" },
  { key: "scanlines", name: "스캔라인" },
  { key: "rolling", name: "롤링" },
  { key: "brightness", name: "밝기 불안정" },
  { key: "colorBleed", name: "색 번짐" },
  { key: "bottomBand", name: "하단 왜곡" },
  { key: "flicker", name: "깜빡임" },
  { key: "ghost", name: "고스트 이미지" },
  { key: "vhold", name: "수직 홀드 이탈" },
  { key: "snow", name: "백색 노이즈" },
  { key: "headSwitch", name: "헤드 스위칭" },
  { key: "curvature", name: "화면 휘어짐" },
];

export default function VHSGlitchProto() {
  const [effects, setEffects] = useState(Object.fromEntries(VHS_EFFECTS.map(e => [e.key, false])));
  const [glitch, setGlitch] = useState(null);
  const [looping, setLooping] = useState(false);
  const [intensity, setIntensity] = useState(0.5);
  const [glitchText, setGlitchText] = useState(true);
  const timer = useRef(null);

  const toggle = (key) => setEffects(p => ({ ...p, [key]: !p[key] }));
  const allOn = () => setEffects(Object.fromEntries(VHS_EFFECTS.map(e => [e.key, true])));
  const allOff = () => setEffects(Object.fromEntries(VHS_EFFECTS.map(e => [e.key, false])));

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
      timer.current = setTimeout(() => { setGlitch(null); timer.current = setTimeout(go, gap); }, dur);
    };
    go();
  };
  const stopLoop = () => { setLooping(false); if (timer.current) clearTimeout(timer.current); setGlitch(null); };
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  return (<>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@200;300;400;500;700&family=Share+Tech+Mono&display=swap');
      *{box-sizing:border-box;margin:0;padding:0}
      .root{background:#06060a;min-height:100vh;display:flex;flex-direction:column;align-items:center;padding:1rem .8rem;font-family:'Noto Sans KR',sans-serif;color:#c0bbb5}
      .title{font-size:.7rem;color:#4a4540;letter-spacing:.2em;margin-bottom:1rem}

      .tv-outer{width:380px;margin-bottom:.8rem}
      .tv-bz{background:linear-gradient(180deg,#1e1e22,#161618);border:2px solid #2a2a30;border-radius:8px;padding:12px;box-shadow:0 4px 40px rgba(0,0,0,.7)}
      .tv-sc{position:relative;background:#08080c;border-radius:4px;width:100%;height:280px;overflow:hidden}
      .tv-sc.tv-curved{border-radius:12px}
      .tv-sl-base{position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.04) 2px,rgba(0,0,0,.04) 4px);pointer-events:none;z-index:2}
      .tv-vg{position:absolute;inset:0;background:radial-gradient(ellipse at center,transparent 55%,rgba(0,0,0,.5) 100%);pointer-events:none;z-index:4}
      .vhs-canvas{position:absolute;inset:0;z-index:5;pointer-events:none;width:100%;height:100%}
      .tv-ct{position:relative;z-index:3;height:100%;display:flex;flex-direction:column;overflow:hidden}
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

      .tvb{font-family:'Share Tech Mono',monospace;font-size:.73rem;line-height:1.85;color:#b0aca5;text-align:center;width:100%}
      .tvl{margin:.02em 0;min-height:.6em}
      .tvw{color:#c05040;text-shadow:0 0 10px rgba(192,80,64,.25)}

      /* Corrupt */
      .corrupt-body{text-align:center}
      .corrupt-line{font-family:'Share Tech Mono',monospace;font-size:.7rem;color:#c05040;opacity:.5;margin:.2em 0;letter-spacing:.08em}
      .corrupt-header-txt{font-family:'Share Tech Mono',monospace;font-size:.8rem;letter-spacing:.12em}
      .corrupt-header-txt.g-light{color:#c05040;opacity:.5}
      .corrupt-header-txt.g-medium{color:#c05040;opacity:.7}
      .corrupt-header-txt.g-heavy{color:#ff4030;opacity:.9}
      .tv-hlc{height:1px;margin:0 .8rem}
      .tv-hlc.g-light{background:linear-gradient(90deg,transparent,rgba(192,80,64,.15),transparent)}
      .tv-hlc.g-medium{background:linear-gradient(90deg,transparent,rgba(192,80,64,.3),transparent)}
      .tv-hlc.g-heavy{background:linear-gradient(90deg,transparent,rgba(255,60,40,.5),transparent)}

      /* Glitch */
      .tv-g-light{animation:gL .1s steps(2) infinite}
      @keyframes gL{0%{transform:translate(0)}50%{transform:translate(-1px,.5px)}100%{transform:translate(.5px,-.5px)}}
      .tv-g-medium{animation:gM .06s steps(2) infinite}
      @keyframes gM{0%{transform:translate(0);filter:brightness(1)}25%{transform:translate(-2px,1px);filter:brightness(1.4)}50%{transform:translate(1px,-1px);filter:brightness(.7)}75%{transform:translate(-1px,2px);filter:brightness(1.2)}100%{transform:translate(0);filter:brightness(1)}}
      .tv-g-heavy{animation:gH .04s steps(3) infinite}
      @keyframes gH{0%{transform:translate(0) skewX(0);filter:brightness(1) hue-rotate(0)}20%{transform:translate(-4px,2px) skewX(-1deg);filter:brightness(2) hue-rotate(90deg)}40%{transform:translate(3px,-3px) skewX(1.5deg);filter:brightness(.3) hue-rotate(180deg)}60%{transform:translate(-2px,4px) skewX(-2deg);filter:brightness(1.8) hue-rotate(270deg)}80%{transform:translate(4px,-1px) skewX(.5deg);filter:brightness(.5) hue-rotate(360deg)}100%{transform:translate(0) skewX(0);filter:brightness(1) hue-rotate(0)}}
      .tv-chroma-r,.tv-chroma-b{position:absolute;inset:0;z-index:7;pointer-events:none;mix-blend-mode:screen}
      .tv-chroma-r.g-medium{background:rgba(255,0,0,.05);animation:cR .08s steps(2) infinite}
      .tv-chroma-b.g-medium{background:rgba(0,0,255,.05);animation:cB .08s steps(2) infinite}
      .tv-chroma-r.g-heavy{background:rgba(255,0,0,.12);animation:cR .04s steps(3) infinite}
      .tv-chroma-b.g-heavy{background:rgba(0,0,255,.12);animation:cB .04s steps(3) infinite}
      @keyframes cR{0%{transform:translate(0)}50%{transform:translate(3px,-1px)}100%{transform:translate(-2px,1px)}}
      @keyframes cB{0%{transform:translate(0)}50%{transform:translate(-3px,1px)}100%{transform:translate(2px,-1px)}}
      .tv-tear{position:absolute;z-index:8;pointer-events:none;left:0;right:0;height:3px;background:rgba(255,255,255,.15);animation:tM .06s steps(4) infinite}
      @keyframes tM{0%{top:20%}25%{top:50%}50%{top:80%}75%{top:35%}100%{top:65%}}
      .tv-g-medium::after,.tv-g-heavy::after{content:'';position:absolute;inset:0;z-index:6;pointer-events:none;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E");mix-blend-mode:overlay;animation:sA .05s steps(4) infinite}
      .tv-g-medium::after{opacity:.3}
      .tv-g-heavy::after{opacity:.6}
      @keyframes sA{0%{transform:translate(0,0)}25%{transform:translate(-5%,-3%)}50%{transform:translate(3%,5%)}75%{transform:translate(-3%,-5%)}100%{transform:translate(5%,3%)}}

      /* Controls */
      .controls{width:380px;display:flex;flex-direction:column;gap:.5rem}
      .section{background:#0a0a0e;border:1px solid rgba(255,255,255,.04);border-radius:4px;padding:.5rem .6rem}
      .section-label{font-size:.55rem;color:#4a4540;letter-spacing:.2em;margin-bottom:.35rem;text-transform:uppercase;display:flex;justify-content:space-between;align-items:center}
      .section-label-btns{display:flex;gap:.3rem}
      .mini-btn{background:none;border:1px solid rgba(255,255,255,.06);color:#555;font-size:.48rem;padding:.15em .45em;cursor:pointer;border-radius:2px;transition:all .2s}
      .mini-btn:hover{color:#999;border-color:rgba(255,255,255,.15)}
      .toggle-grid{display:flex;flex-wrap:wrap;gap:.25rem}
      .toggle-btn{background:#0e0e14;border:1px solid rgba(255,255,255,.06);color:#706b65;font-family:'Noto Sans KR',sans-serif;font-size:.55rem;font-weight:300;padding:.3em .55em;cursor:pointer;transition:all .2s;border-radius:2px;position:relative}
      .toggle-btn:hover{border-color:rgba(150,120,80,.2);color:#a09a90}
      .toggle-btn.on{border-color:rgba(138,64,48,.4);color:#c0a090;background:#14101a}
      .toggle-btn .dot{position:absolute;top:2px;right:2px;width:3px;height:3px;border-radius:50%;background:#8a4030;opacity:0;transition:opacity .2s}
      .toggle-btn.on .dot{opacity:1}
      .g-btns{display:flex;gap:.25rem;flex-wrap:wrap;align-items:center}
      .g-btn{background:#0e0e14;border:1px solid rgba(255,255,255,.06);color:#706b65;font-family:'Noto Sans KR',sans-serif;font-size:.55rem;font-weight:300;padding:.3em .6em;cursor:pointer;transition:all .2s;border-radius:2px}
      .g-btn:hover{border-color:rgba(150,120,80,.2);color:#a09a90}
      .g-btn.active{border-color:rgba(138,64,48,.4);color:#c0a090;background:#14101a}
      .g-sep{color:#2a2a30;font-size:.55rem}
    `}</style>

    <div className="root">
      <div className="title">VHS + 글리치 프로토타입</div>

      <TV header="대국민 위험 경보" effects={effects} glitch={!!glitch} glitchIntensity={glitch || "light"} glitchText={glitchText} intensity={intensity}>
        <div className="tvb">
          {SAMPLE.map((l, i) => l.text === "" ? <p key={i} className="tvl">&nbsp;</p> : <p key={i} className={`tvl ${l.warning ? "tvw" : ""}`}>{l.text}</p>)}
        </div>
      </TV>

      <div className="controls">
        <div className="section">
          <div className="section-label">글리치 (화면 전환용)</div>
          <div className="g-btns">
            <button className="g-btn" onClick={() => triggerGlitch("light")}>Light</button>
            <button className="g-btn" onClick={() => triggerGlitch("medium")}>Medium</button>
            <button className="g-btn" onClick={() => triggerGlitch("heavy")}>Heavy</button>
            <span className="g-sep">|</span>
            {!looping ? (<>
              <button className="g-btn" onClick={() => startLoop("light")}>L 반복</button>
              <button className="g-btn" onClick={() => startLoop("medium")}>M 반복</button>
              <button className="g-btn" onClick={() => startLoop("heavy")}>H 반복</button>
            </>) : (
              <button className="g-btn active" onClick={stopLoop}>■ 정지</button>
            )}
          </div>
          <div className="g-btns" style={{marginTop:".3rem"}}>
            <button className={`g-btn ${glitchText?"active":""}`} onClick={()=>setGlitchText(true)}>깨진 텍스트 있음</button>
            <button className={`g-btn ${!glitchText?"active":""}`} onClick={()=>setGlitchText(false)}>순수 노이즈</button>
          </div>
        </div>

        <div className="section">
          <div className="section-label">VHS 효과 강도</div>
          <div className="g-btns">
            <button className={`g-btn ${intensity===0.15?"active":""}`} onClick={()=>setIntensity(0.15)}>약</button>
            <button className={`g-btn ${intensity===0.35?"active":""}`} onClick={()=>setIntensity(0.35)}>중</button>
            <button className={`g-btn ${intensity===0.6?"active":""}`} onClick={()=>setIntensity(0.6)}>강</button>
            <button className={`g-btn ${intensity===1?"active":""}`} onClick={()=>setIntensity(1)}>최대</button>
          </div>
        </div>

        <div className="section">
          <div className="section-label">
            VHS 효과 (상시)
            <div className="section-label-btns">
              <button className="mini-btn" onClick={allOn}>전체 ON</button>
              <button className="mini-btn" onClick={allOff}>전체 OFF</button>
            </div>
          </div>
          <div className="toggle-grid">
            {VHS_EFFECTS.map(e => (
              <button key={e.key} className={`toggle-btn ${effects[e.key] ? "on" : ""}`} onClick={() => toggle(e.key)}>
                <span className="dot" />{e.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  </>);
}
