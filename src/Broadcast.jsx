import { useState, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════
   글리치 강도 프로토타입
   Light / Medium / Heavy
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

// ── TV ──
function TV({ children, header, glitch, intensity }) {
  const cls = [
    "tv-sc",
    glitch ? `tv-g-${intensity}` : "",
  ].filter(Boolean).join(" ");

  return (
    <div className="tv-outer">
      <div className="tv-bz">
        <div className={cls}>
          <div className="tv-sl" />
          <div className="tv-vg" />
          {/* Chromatic aberration layers for medium+ */}
          {glitch && intensity !== "light" && (
            <>
              <div className={`tv-chroma-r g-${intensity}`} />
              <div className={`tv-chroma-b g-${intensity}`} />
            </>
          )}
          {/* Tear lines for heavy */}
          {glitch && intensity === "heavy" && <div className="tv-tear" />}
          <div className="tv-ct">
            <div className="tv-ha">
              {glitch ? (
                <>
                  <div className="tv-h tv-hc">
                    <CorruptHeader length={header ? header.length + 4 : 12} intensity={intensity} />
                  </div>
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

const SAMPLE_TEXT = [
  { text: "귀하의 안전을 위해" },
  { text: "반드시 실내에 머무르십시오." },
  { text: "" },
  { text: "절대 밤하늘을", warning: true },
  { text: "쳐다보지 마십시오.", warning: true },
];

function TVBlock({ lines }) {
  return (
    <div className="tvb">
      {lines.map((l, i) =>
        l.text === "" ? <p key={i} className="tvl">&nbsp;</p> :
        <p key={i} className={`tvl ${l.warning ? "tvw" : ""}`}>{l.text}</p>
      )}
    </div>
  );
}

export default function GlitchProto() {
  const [intensity, setIntensity] = useState(null); // null = off, light/medium/heavy
  const [looping, setLooping] = useState(false);
  const timer = useRef(null);

  const triggerGlitch = (level) => {
    setIntensity(level);
    const dur = level === "heavy" ? 300 : level === "medium" ? 250 : 200;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setIntensity(null), dur);
  };

  const startLoop = (level) => {
    setLooping(true);
    const go = () => {
      setIntensity(level);
      const dur = level === "heavy" ? 300 : level === "medium" ? 250 : 200;
      const gap = level === "heavy" ? 800 : level === "medium" ? 1200 : 2000;
      timer.current = setTimeout(() => {
        setIntensity(null);
        timer.current = setTimeout(go, gap);
      }, dur);
    };
    go();
  };

  const stopLoop = () => {
    setLooping(false);
    if (timer.current) clearTimeout(timer.current);
    setIntensity(null);
  };

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  return (<>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@200;300;400;500;700&family=Share+Tech+Mono&display=swap');
      *{box-sizing:border-box;margin:0;padding:0}
      .root{background:#06060a;min-height:100vh;display:flex;flex-direction:column;align-items:center;padding:1.5rem 1rem;font-family:'Noto Sans KR',sans-serif;color:#c0bbb5}
      .title{font-size:.7rem;color:#4a4540;letter-spacing:.2em;margin-bottom:1.5rem}

      /* TV */
      .tv-outer{width:380px;margin-bottom:1rem}
      .tv-bz{background:linear-gradient(180deg,#1e1e22,#161618);border:2px solid #2a2a30;border-radius:8px;padding:12px;box-shadow:0 4px 40px rgba(0,0,0,.7)}
      .tv-sc{position:relative;background:#08080c;border-radius:4px;width:100%;height:280px;overflow:hidden}
      .tv-sl{position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.06) 2px,rgba(0,0,0,.06) 4px);pointer-events:none;z-index:3}
      .tv-vg{position:absolute;inset:0;background:radial-gradient(ellipse at center,transparent 55%,rgba(0,0,0,.5) 100%);pointer-events:none;z-index:4}
      .tv-ct{position:relative;z-index:2;height:100%;display:flex;flex-direction:column;overflow:hidden}
      .tv-ha{flex-shrink:0;padding:.8rem 1.2rem 0;text-align:center;min-height:48px}
      .tv-h{font-family:'Share Tech Mono',monospace;font-size:.8rem;font-weight:500;color:#d0ccc5;letter-spacing:.25em;padding-bottom:.45rem}
      .tv-hl{height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.12),transparent);margin:0 .8rem}
      .tv-he{height:8px}
      .tv-hc{color:transparent;padding-bottom:.45rem}
      .tv-bd{flex:1;padding:.6rem 1.4rem .8rem;overflow:hidden;display:flex;align-items:center;justify-content:center}
      .tv-bt{display:flex;align-items:center;justify-content:space-between;padding:.4rem .6rem .2rem}
      .tv-br{font-family:'Share Tech Mono',monospace;font-size:.5rem;letter-spacing:.5em;color:#2a2a30}
      .tv-led{width:5px;height:5px;border-radius:50%;background:#1a1a1e}
      .tv-led.on{background:#8a4030;box-shadow:0 0 5px rgba(138,64,48,.4)}

      /* TV text */
      .tvb{font-family:'Share Tech Mono',monospace;font-size:.73rem;line-height:1.85;color:#b0aca5;text-align:center;width:100%}
      .tvl{margin:.02em 0;min-height:.6em}
      .tvw{color:#c05040;text-shadow:0 0 10px rgba(192,80,64,.25)}

      /* Corrupt text */
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

      /* ── LIGHT: subtle shake ── */
      .tv-g-light{animation:gLight .1s steps(2) infinite}
      @keyframes gLight{
        0%{transform:translate(0)}
        50%{transform:translate(-1px,.5px)}
        100%{transform:translate(.5px,-.5px)}
      }

      /* ── MEDIUM: shake + brightness flicker + scanline distortion ── */
      .tv-g-medium{animation:gMed .06s steps(2) infinite}
      @keyframes gMed{
        0%{transform:translate(0);filter:brightness(1)}
        25%{transform:translate(-2px,1px);filter:brightness(1.4)}
        50%{transform:translate(1px,-1px);filter:brightness(.7)}
        75%{transform:translate(-1px,2px);filter:brightness(1.2)}
        100%{transform:translate(0);filter:brightness(1)}
      }

      /* ── HEAVY: violent shake + extreme brightness + hue rotation ── */
      .tv-g-heavy{animation:gHeavy .04s steps(3) infinite}
      @keyframes gHeavy{
        0%{transform:translate(0) skewX(0);filter:brightness(1) hue-rotate(0)}
        20%{transform:translate(-4px,2px) skewX(-1deg);filter:brightness(2) hue-rotate(90deg)}
        40%{transform:translate(3px,-3px) skewX(1.5deg);filter:brightness(.3) hue-rotate(180deg)}
        60%{transform:translate(-2px,4px) skewX(-2deg);filter:brightness(1.8) hue-rotate(270deg)}
        80%{transform:translate(4px,-1px) skewX(.5deg);filter:brightness(.5) hue-rotate(360deg)}
        100%{transform:translate(0) skewX(0);filter:brightness(1) hue-rotate(0)}
      }

      /* ── Chromatic aberration (medium+) ── */
      .tv-chroma-r,.tv-chroma-b{position:absolute;inset:0;z-index:7;pointer-events:none;mix-blend-mode:screen}
      .tv-chroma-r{background:rgba(255,0,0,.03)}
      .tv-chroma-b{background:rgba(0,0,255,.03)}
      .tv-chroma-r.g-medium{background:rgba(255,0,0,.05);animation:chromaR .08s steps(2) infinite}
      .tv-chroma-b.g-medium{background:rgba(0,0,255,.05);animation:chromaB .08s steps(2) infinite}
      .tv-chroma-r.g-heavy{background:rgba(255,0,0,.12);animation:chromaR .04s steps(3) infinite}
      .tv-chroma-b.g-heavy{background:rgba(0,0,255,.12);animation:chromaB .04s steps(3) infinite}
      @keyframes chromaR{0%{transform:translate(0)}50%{transform:translate(3px,-1px)}100%{transform:translate(-2px,1px)}}
      @keyframes chromaB{0%{transform:translate(0)}50%{transform:translate(-3px,1px)}100%{transform:translate(2px,-1px)}}

      /* ── Screen tear (heavy only) ── */
      .tv-tear{
        position:absolute;
        z-index:8;
        pointer-events:none;
        left:0;right:0;
        height:3px;
        background:rgba(255,255,255,.15);
        animation:tearMove .06s steps(4) infinite;
      }
      @keyframes tearMove{
        0%{top:20%}
        25%{top:50%}
        50%{top:80%}
        75%{top:35%}
        100%{top:65%}
      }

      /* ── Static noise overlay ── */
      .tv-g-medium::after,.tv-g-heavy::after{
        content:'';position:absolute;inset:0;z-index:6;pointer-events:none;
        background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E");
        mix-blend-mode:overlay;
        animation:staticA .05s steps(4) infinite;
      }
      .tv-g-medium::after{opacity:.3}
      .tv-g-heavy::after{opacity:.6}
      @keyframes staticA{0%{transform:translate(0,0)}25%{transform:translate(-5%,-3%)}50%{transform:translate(3%,5%)}75%{transform:translate(-3%,-5%)}100%{transform:translate(5%,3%)}}

      /* Buttons */
      .section{width:380px;margin-bottom:1rem}
      .section-label{font-size:.6rem;color:#4a4540;letter-spacing:.2em;margin-bottom:.5rem}
      .btns{display:flex;gap:.4rem;flex-wrap:wrap}
      .btn{background:#12121a;border:1px solid rgba(255,255,255,.12);color:#c0b8ae;font-family:'Noto Sans KR',sans-serif;font-size:.7rem;font-weight:300;padding:.5em 1.2em;cursor:pointer;transition:all .3s;border-radius:2px}
      .btn:hover{background:#1a1a24;border-color:rgba(150,120,80,.4);color:#e0d8ce}
      .btn.active{border-color:#8a4030;color:#d0a090;background:#1a1218}
      .btn-light{border-color:rgba(200,180,120,.2)}
      .btn-medium{border-color:rgba(200,120,60,.2)}
      .btn-heavy{border-color:rgba(200,60,40,.2)}

      .info{width:380px;background:#0a0a0e;border:1px solid rgba(255,255,255,.04);border-radius:4px;padding:.8rem 1rem;font-size:.63rem;color:#555;line-height:1.8}
      .info b{color:#8a8580;font-weight:400}
    `}</style>

    <div className="root">
      <div className="title">글리치 강도 프로토타입</div>

      <TV header="대국민 위험 경보" glitch={!!intensity} intensity={intensity || "light"}>
        <TVBlock lines={SAMPLE_TEXT} />
      </TV>

      <div className="section">
        <div className="section-label">단발 글리치 (200~300ms)</div>
        <div className="btns">
          <button className="btn btn-light" onClick={() => triggerGlitch("light")}>Light</button>
          <button className="btn btn-medium" onClick={() => triggerGlitch("medium")}>Medium</button>
          <button className="btn btn-heavy" onClick={() => triggerGlitch("heavy")}>Heavy</button>
        </div>
      </div>

      <div className="section">
        <div className="section-label">반복 글리치 (연출 확인용)</div>
        <div className="btns">
          {!looping ? (
            <>
              <button className="btn btn-light" onClick={() => startLoop("light")}>Light 반복</button>
              <button className="btn btn-medium" onClick={() => startLoop("medium")}>Medium 반복</button>
              <button className="btn btn-heavy" onClick={() => startLoop("heavy")}>Heavy 반복</button>
            </>
          ) : (
            <button className="btn active" onClick={stopLoop}>■ 정지</button>
          )}
        </div>
      </div>

      <div className="info">
        <b>Light</b> — 미세 흔들림. "뭔가 불안정하다" (Phase 2~3)<br/>
        <b>Medium</b> — 떨림 + 밝기 변화 + 색수차 + 노이즈. "전파 간섭" (Phase 4~5)<br/>
        <b>Heavy</b> — 격렬한 흔들림 + hue 회전 + skew + 화면 찢어짐 + 강한 노이즈. "완전 장악" (Phase 6~7)
      </div>
    </div>
  </>);
}
