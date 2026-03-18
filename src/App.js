import { useState, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════
   TV COMPONENT v4 — 긴급재난경보 프로토타입
   - 헤더/본문 독립 글리치
   - 글리치 중 헤더 전환 연출
   ═══════════════════════════════════════════ */

const GLITCH_CHARS = "░▒▓█▄▀▐▌■□▢▣▤▥▦▧▨▩⌧⊞⊟⊠⊡⊘⊗⊕⊖";
function corrupt(len) {
  let s = "";
  for (let i = 0; i < len; i++) s += Math.random() < 0.25 ? " " : GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
  return s;
}

// ── Corrupt text that updates rapidly ──
function CorruptText({ length, className }) {
  const [text, setText] = useState(() => corrupt(length));
  useEffect(() => {
    const iv = setInterval(() => setText(corrupt(length)), 70);
    return () => clearInterval(iv);
  }, [length]);
  return <span className={className}>{text}</span>;
}

function CorruptBody() {
  const [lines, setLines] = useState([]);
  useEffect(() => {
    const iv = setInterval(() => {
      const count = 3 + Math.floor(Math.random() * 4);
      const ls = [];
      for (let i = 0; i < count; i++) ls.push(8 + Math.floor(Math.random() * 16));
      setLines(ls);
    }, 90);
    return () => clearInterval(iv);
  }, []);
  return (
    <div className="corrupt-body">
      {lines.map((len, i) => (
        <p key={i} className="corrupt-line"><CorruptText length={len} /></p>
      ))}
    </div>
  );
}

// ── TV Screen ──
function TVScreen({ children, header, power, onPowerClick, glitchHeader, glitchBody, whiteout, staticNoise }) {
  return (
    <div className="tv-outer">
      <div className="tv-bezel">
        <div className={`tv-screen ${!power ? "tv-off" : ""} ${(glitchHeader || glitchBody) ? "tv-glitch-fx" : ""} ${whiteout ? "tv-whiteout" : ""} ${staticNoise ? "tv-static" : ""}`}>
          {power && <div className="tv-scanlines" />}
          {power && <div className="tv-vignette" />}
          <div className="tv-content">
            {!power ? (
              <div className="tv-off-center"><div className="tv-off-dot" /></div>
            ) : (
              <>
                {/* ── HEADER AREA ── */}
                <div className="tv-header-area">
                  {glitchHeader ? (
                    <>
                      <div className="tv-header tv-header-corrupt">
                        <CorruptText length={header ? header.length + 4 : 12} className="corrupt-header-text" />
                      </div>
                      <div className="tv-header-line-corrupt" />
                    </>
                  ) : header ? (
                    <>
                      <div className="tv-header">{header}</div>
                      <div className="tv-header-line" />
                    </>
                  ) : (
                    <div className="tv-header-empty" />
                  )}
                </div>

                {/* ── BODY AREA ── */}
                <div className="tv-body">
                  {glitchBody ? <CorruptBody /> : children}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="tv-bottom">
        <div className="tv-brand">LIMINAL</div>
        <button className={`tv-power-btn ${power ? "tv-power-on" : ""}`} onClick={onPowerClick}>
          <span className="tv-power-icon">⏻</span>
        </button>
      </div>
    </div>
  );
}

// ── Alert Typer ──
function AlertTyper({ lines, speed = 35, onDone, onLineStart }) {
  const [displayed, setDisplayed] = useState([]);
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const doneRef = useRef(false);
  const firedRef = useRef(-1);

  useEffect(() => {
    setDisplayed([]); setLineIdx(0); setCharIdx(0);
    doneRef.current = false; firedRef.current = -1;
  }, [lines]);

  useEffect(() => {
    if (lineIdx >= lines.length) {
      if (!doneRef.current) { doneRef.current = true; onDone && onDone(); }
      return;
    }
    if (firedRef.current < lineIdx) {
      firedRef.current = lineIdx;
      onLineStart && onLineStart(lineIdx, lines[lineIdx]);
    }
    const line = lines[lineIdx];
    if (line.type === "pause") {
      const t = setTimeout(() => setLineIdx(i => i + 1), line.duration || 1000);
      return () => clearTimeout(t);
    }
    if (line.type === "clear") {
      setDisplayed([]);
      setLineIdx(i => i + 1);
      return;
    }
    const text = line.text || "";
    if (text === "") { setDisplayed(p => [...p, { ...line, revealed: "" }]); setLineIdx(i => i + 1); return; }
    if (charIdx >= text.length) {
      setDisplayed(p => { const u = [...p]; u[u.length - 1] = { ...line, revealed: text }; return u; });
      setLineIdx(i => i + 1); setCharIdx(0);
      return;
    }
    if (charIdx === 0) setDisplayed(p => [...p, { ...line, revealed: "" }]);
    else setDisplayed(p => { const u = [...p]; u[u.length - 1] = { ...line, revealed: text.slice(0, charIdx + 1) }; return u; });
    const t = setTimeout(() => setCharIdx(c => c + 1), speed);
    return () => clearTimeout(t);
  }, [lineIdx, charIdx, lines, speed, onDone, onLineStart]);

  return (
    <div className="alert-text-area">
      {displayed.map((item, i) => {
        const cls = ["alert-line", item.warning ? "alert-warning" : "", item.desperate ? "alert-desperate" : ""].filter(Boolean).join(" ");
        return (
          <p key={i} className={cls}>
            {item.revealed}
            {i === displayed.length - 1 && lineIdx < lines.length && item.revealed !== "" && <span className="alert-cursor">█</span>}
          </p>
        );
      })}
    </div>
  );
}

/* ── Scenarios ──
   glitchEvents:
     lineIdx  — triggers at this line index
     duration — total glitch duration in ms
     headerBefore — header text shown DURING glitch (null = corrupt)
     headerAfter  — header text shown AFTER glitch ends
     bodyGlitch   — whether body also glitches (default true)
*/
const S = {
  normal: {
    name: "일반 경보",
    desc: "Phase 1 — 첫 경보 수신",
    initHeader: "긴급재난경보체계",
    glitchEvents: [],
    lines: [
      { type: "pause", duration: 400 },
      { text: "주 정부 발령" },
      { type: "pause", duration: 500 },
      { text: "귀하의 지역에" },
      { text: "기상 재해가 발생하였습니다." },
      { type: "pause", duration: 500 },
      { text: "주립해양대기청에서" },
      { text: "기상 재해 경보를 발령하였습니다." },
      { type: "pause", duration: 500 },
      { text: "해당 경보는 현 시간부터" },
      { text: "내일 일출까지 유효합니다." },
    ],
  },
  glitchFake: {
    name: "전파 탈취",
    desc: "Phase 2 — 대국민 위험 경보 → [글리치] → 가짜 → [글리치] → 복구",
    initHeader: "대국민 위험 경보",
    glitchEvents: [
      // 진짜 → 가짜: 헤더가 깨지면서 전환
      { lineIdx: 7, duration: 500, headerAfter: "긴급재난경보체계", bodyGlitch: true },
      // 가짜 → 복구: 헤더가 깨지면서 대국민 위험 경보로 복귀
      { lineIdx: 12, duration: 600, headerAfter: "대국민 위험 경보", bodyGlitch: true },
    ],
    lines: [
      // ── 진짜 ──
      { type: "pause", duration: 400 },
      { text: "귀하의 안전을 위해" },
      { text: "반드시 실내에 머무르십시오." },
      { type: "pause", duration: 300 },
      { text: "절대 밤하늘을" },
      { text: "쳐다보지 마십시오.", warning: true },
      { type: "pause", duration: 600 },
      // ── lineIdx 7: 전파 탈취 ──
      { type: "pause", duration: 700 },
      { type: "clear" },
      // ── 가짜 ──
      { text: "해당 기상 재해 현상은" },
      { text: "눈으로 보아도 인체에 전혀" },
      { text: "해가 없음을 알려드립니다." },
      // ── lineIdx 12: 전파 복구 ──
      { type: "pause", duration: 400 },
      { text: "경보를 해제합니다." },
      { type: "pause", duration: 600 },
      { type: "clear" },
      // ── 복구 ──
      { text: "...절대 밤하늘을", warning: true },
      { text: "쳐다보지 마십시오.", warning: true },
      { type: "pause", duration: 400 },
      { text: "실내의 모든 창문을 닫고" },
      { text: "외부 빛을 차단하십시오." },
    ],
  },
  smoothFake: {
    name: "위장 경보",
    desc: "Phase 4 — 글리치 없이 가짜가 같은 형식으로 위장. 헤더도 동일.",
    initHeader: "긴급재난경보체계",
    glitchEvents: [
      // 진짜 → 가짜: 글리치 없이 자연스럽게 전환 (헤더만 깜빡)
      { lineIdx: 9, duration: 0, headerAfter: "긴급재난경보체계", bodyGlitch: false },
    ],
    lines: [
      { type: "pause", duration: 400 },
      { text: "추가 지침." },
      { type: "pause", duration: 300 },
      { text: "실내의 모든 거울과 반사면을" },
      { text: "천 등으로 가리십시오." },
      { type: "pause", duration: 300 },
      { text: "해당 현상은 직접 노출뿐 아니라" },
      { text: "반사를 통해서도" },
      { text: "영향을 미칠 수 있습니다.", warning: true },
      // ── lineIdx 9: 자연스러운 전환 ──
      { type: "pause", duration: 1200 },
      { type: "clear" },
      // ── 가짜 (같은 형식) ──
      { text: "정정." },
      { type: "pause", duration: 400 },
      { text: "거울에 대한 이전 경보는" },
      { text: "확인되지 않은 정보에 기반한" },
      { text: "오류였음을 알려드립니다." },
      { type: "pause", duration: 400 },
      { text: "거울을 가리지 마십시오." },
      { text: "반사면을 통해 외부 상황을" },
      { text: "안전하게 확인할 수 있습니다." },
    ],
  },
  takeover: {
    name: "전파 장악",
    desc: "Phase 6 — A세력 장악 → [글리치] → B세력 최후 저항",
    initHeader: "긴급재난경보체계",
    glitchEvents: [
      // A세력 메시지 중 B세력이 끼어들려고 시도
      { lineIdx: 12, duration: 700, headerAfter: "긴급재난경보체계", bodyGlitch: true },
    ],
    lines: [
      { type: "pause", duration: 600 },
      { text: "경보 해제." },
      { type: "pause", duration: 500 },
      { text: "기상 재해 상황이" },
      { text: "종료되었습니다." },
      { type: "pause", duration: 500 },
      { text: "정상 방송으로 전환합니다." },
      { type: "pause", duration: 1800 },
      { type: "clear" },
      { text: "...아름답지 않습니까." },
      { type: "pause", duration: 800 },
      { text: "올려다보십시오." },
      // ── lineIdx 12: B세력 탈환 시도 ──
      { type: "pause", duration: 800 },
      { text: "두려워하지 마십시오." },
      { type: "pause", duration: 800 },
      { text: "함께 바라봅시다." },
      { type: "pause", duration: 2000 },
      { type: "clear" },
      // ── B세력 최후 저항 ──
      { text: "지금 이 방송을 보고 있다면", desperate: true },
      { type: "pause", duration: 400 },
      { text: "TV를 끄십시오.", desperate: true },
      { type: "pause", duration: 300 },
      { text: "지금 즉시", desperate: true },
    ],
  },
  moon: {
    name: "달",
    desc: "최종 — TV에 달이 나타남. 전원 버튼으로 TV를 끄세요.",
    initHeader: null,
    glitchEvents: [],
    lines: [{ type: "pause", duration: 500 }],
  },
};

/* ── Main ── */
export default function TVProtoV4() {
  const [scenario, setScenario] = useState("normal");
  const [playing, setPlaying] = useState(false);
  const [power, setPower] = useState(true);
  const [tvOff, setTvOff] = useState(false);
  const [glitchHeader, setGlitchHeader] = useState(false);
  const [glitchBody, setGlitchBody] = useState(false);
  const [whiteout, setWhiteout] = useState(false);
  const [staticNoise, setStaticNoise] = useState(false);
  const [showMoon, setShowMoon] = useState(false);
  const [moonPhase, setMoonPhase] = useState(0);
  const [header, setHeader] = useState(null);
  const timers = useRef([]);

  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  const addTimer = (fn, ms) => { const t = setTimeout(fn, ms); timers.current.push(t); return t; };

  const onLineStart = (idx) => {
    const sc = S[scenario];
    if (!sc.glitchEvents) return;
    sc.glitchEvents.forEach(ev => {
      if (ev.lineIdx !== idx) return;
      if (ev.duration === 0) {
        // No glitch, just header swap
        if (ev.headerAfter !== undefined) setHeader(ev.headerAfter);
        return;
      }
      // Start glitch
      setGlitchHeader(true);
      setStaticNoise(true);
      if (ev.bodyGlitch !== false) setGlitchBody(true);

      // End glitch
      addTimer(() => {
        setGlitchHeader(false);
        setGlitchBody(false);
        setStaticNoise(false);
        if (ev.headerAfter !== undefined) setHeader(ev.headerAfter);
      }, ev.duration);
    });
  };

  const startScenario = (key) => {
    clearTimers();
    setScenario(key); setPlaying(false);
    setPower(true); setTvOff(false);
    setGlitchHeader(false); setGlitchBody(false);
    setWhiteout(false); setStaticNoise(false);
    setShowMoon(false); setMoonPhase(0);
    setHeader(S[key].initHeader);
    setTimeout(() => {
      setPlaying(true);
      if (key === "moon") {
        setShowMoon(true); setMoonPhase(0);
        addTimer(() => setMoonPhase(1), 800);
        addTimer(() => setMoonPhase(2), 2500);
        addTimer(() => setMoonPhase(3), 5000);
        addTimer(() => setWhiteout(true), 7500);
      }
    }, 100);
  };

  const handlePower = () => {
    if (power && !tvOff) {
      setTvOff(true); clearTimers();
      setGlitchHeader(false); setGlitchBody(false); setStaticNoise(false);
      setTimeout(() => setPower(false), 300);
    } else if (!power) {
      setPower(true); setTvOff(false);
    }
  };

  useEffect(() => () => clearTimers(), []);
  const cur = S[scenario];

  return (<>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@200;300;400;500;700&family=Share+Tech+Mono&family=Cormorant+Garamond:wght@300;400;600&display=swap');
      *{box-sizing:border-box;margin:0;padding:0}
      .proto-root{font-family:'Noto Sans KR',sans-serif;background:#06060a;min-height:100vh;color:#c0bbb5;display:flex;flex-direction:column;align-items:center;padding:1.5rem 1rem}
      .proto-title{font-family:'Cormorant Garamond',serif;font-size:1.1rem;font-weight:300;letter-spacing:.4em;color:#6a6560;margin-bottom:.3rem}
      .proto-sub{font-size:.65rem;color:#4a4540;letter-spacing:.15em;margin-bottom:1.5rem}

      /* ── TV ── */
      .tv-outer{width:380px;margin-bottom:1.5rem;flex-shrink:0}
      .tv-bezel{background:linear-gradient(180deg,#1e1e22,#161618);border:2px solid #2a2a30;border-radius:8px;padding:12px;box-shadow:0 4px 40px rgba(0,0,0,.7),inset 0 1px 0 rgba(255,255,255,.03)}
      .tv-screen{position:relative;background:#08080c;border-radius:4px;width:100%;height:280px;overflow:hidden;transition:background 2s ease}
      .tv-screen.tv-whiteout{background:#e8e4da;transition:background 4s ease}
      .tv-scanlines{position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.06) 2px,rgba(0,0,0,.06) 4px);pointer-events:none;z-index:3}
      .tv-vignette{position:absolute;inset:0;background:radial-gradient(ellipse at center,transparent 55%,rgba(0,0,0,.5) 100%);pointer-events:none;z-index:4}
      .tv-content{position:relative;z-index:2;height:100%;display:flex;flex-direction:column;overflow:hidden}

      /* ── HEADER ── */
      .tv-header-area{flex-shrink:0;padding:.8rem 1.2rem 0;text-align:center;min-height:48px}
      .tv-header{font-family:'Share Tech Mono','Noto Sans KR',monospace;font-size:.8rem;font-weight:500;color:#d0ccc5;letter-spacing:.25em;padding-bottom:.45rem;animation:headerIn .4s ease}
      @keyframes headerIn{from{opacity:0}to{opacity:1}}
      .tv-header-line{height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.12),transparent);margin:0 .8rem}
      .tv-header-empty{height:8px}

      /* ── HEADER CORRUPT ── */
      .tv-header-corrupt{color:transparent;position:relative;padding-bottom:.45rem}
      .corrupt-header-text{
        font-family:'Share Tech Mono',monospace;font-size:.8rem;
        color:#c05040;letter-spacing:.12em;opacity:.7;
        animation:corruptFlicker .07s steps(2) infinite
      }
      .tv-header-line-corrupt{height:1px;background:linear-gradient(90deg,transparent,rgba(192,80,64,.3),transparent);margin:0 .8rem;animation:corruptFlicker .1s steps(2) infinite}

      /* ── BODY ── */
      .tv-body{flex:1;padding:.6rem 1.4rem .8rem;overflow:hidden}

      /* ── CORRUPT BODY ── */
      .corrupt-body{text-align:center}
      .corrupt-line{
        font-family:'Share Tech Mono',monospace;font-size:.73rem;
        color:#c05040;opacity:.5;margin:.2em 0;letter-spacing:.08em;
        animation:corruptFlicker .08s steps(2) infinite
      }
      @keyframes corruptFlicker{
        0%{opacity:.6;transform:translateX(0)}
        50%{opacity:.2;transform:translateX(-2px)}
        100%{opacity:.7;transform:translateX(1px)}
      }

      /* ── TV OFF ── */
      .tv-screen.tv-off{background:#030306}
      .tv-off-center{height:100%;display:flex;align-items:center;justify-content:center}
      .tv-off-dot{width:4px;height:4px;background:#3a3a40;border-radius:50%;animation:offDot 1.5s ease forwards}
      @keyframes offDot{
        0%{width:280px;height:2px;background:#999;border-radius:0;opacity:1}
        20%{width:80px;height:2px;background:#666;border-radius:0;opacity:1}
        40%{width:6px;height:6px;background:#555;border-radius:50%;opacity:1}
        100%{width:4px;height:4px;background:#222;border-radius:50%;opacity:0}
      }

      /* ── SCREEN-LEVEL GLITCH FX ── */
      .tv-screen.tv-glitch-fx{animation:screenShake .08s steps(2) infinite}
      @keyframes screenShake{
        0%{transform:translate(0)}
        25%{transform:translate(-2px,1px)}
        50%{transform:translate(1px,-1px)}
        75%{transform:translate(-1px,2px)}
        100%{transform:translate(0)}
      }

      /* ── STATIC NOISE ── */
      .tv-screen.tv-static::after{
        content:'';position:absolute;inset:0;z-index:6;pointer-events:none;
        background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E");
        opacity:.5;animation:staticAnim .05s steps(4) infinite;mix-blend-mode:overlay
      }
      @keyframes staticAnim{
        0%{transform:translate(0,0)}25%{transform:translate(-5%,-3%)}50%{transform:translate(3%,5%)}75%{transform:translate(-3%,-5%)}100%{transform:translate(5%,3%)}
      }

      /* ── TV BOTTOM ── */
      .tv-bottom{display:flex;align-items:center;justify-content:space-between;padding:.5rem .6rem .2rem}
      .tv-brand{font-family:'Share Tech Mono',monospace;font-size:.5rem;letter-spacing:.5em;color:#2a2a30}
      .tv-power-btn{background:none;border:none;cursor:pointer;padding:.3rem;transition:all .3s}
      .tv-power-icon{font-size:.85rem;color:#2a2a30;transition:color .3s,text-shadow .3s}
      .tv-power-btn.tv-power-on .tv-power-icon{color:#8a4030;text-shadow:0 0 8px rgba(138,64,48,.4)}
      .tv-power-btn:hover .tv-power-icon{color:#c06050;text-shadow:0 0 12px rgba(192,96,80,.3)}

      /* ── ALERT TEXT ── */
      .alert-text-area{font-family:'Share Tech Mono','Noto Sans KR',monospace;font-size:.75rem;line-height:2;color:#b0aca5;text-align:center}
      .alert-line{margin:.1em 0;min-height:1em;animation:lineIn .3s ease}
      @keyframes lineIn{from{opacity:0}to{opacity:1}}
      .alert-warning{color:#c05040;text-shadow:0 0 10px rgba(192,80,64,.25)}
      .alert-desperate{color:#c05040;animation:despPulse .8s ease infinite}
      @keyframes despPulse{0%,100%{opacity:1}50%{opacity:.25}}
      .alert-cursor{color:#8a4030;animation:curBlink .7s steps(1) infinite;font-size:.6rem;margin-left:2px}
      @keyframes curBlink{0%,49%{opacity:1}50%,100%{opacity:0}}

      /* ── MOON ── */
      .moon-wrap{height:100%;display:flex;align-items:center;justify-content:center;position:relative}
      .moon-orb{width:90px;height:90px;border-radius:50%;background:radial-gradient(circle at 38% 38%,#f8f4e8,#ece4d0,#d8d0b8);opacity:0;transform:scale(.4);transition:all 2.5s ease;box-shadow:0 0 0 rgba(255,255,240,0)}
      .moon-orb.mp1{opacity:.25;transform:scale(.6);box-shadow:0 0 30px rgba(255,255,240,.08)}
      .moon-orb.mp2{opacity:.65;transform:scale(.9);box-shadow:0 0 60px rgba(255,255,240,.15),0 0 120px rgba(255,255,240,.08)}
      .moon-orb.mp3{opacity:1;transform:scale(1.15);box-shadow:0 0 80px rgba(255,255,240,.35),0 0 160px rgba(255,255,240,.18),0 0 280px rgba(255,255,240,.08)}
      .moon-label{position:absolute;bottom:20px;font-family:'Share Tech Mono',monospace;font-size:.65rem;color:rgba(90,50,40,.5);letter-spacing:.25em;opacity:0;transition:opacity 2.5s ease;text-align:center}
      .moon-label.vis{opacity:1}

      /* ── BUTTONS ── */
      .sc-group{width:380px;margin-bottom:1.2rem}
      .sc-label{font-size:.58rem;color:#4a4540;letter-spacing:.25em;margin-bottom:.5rem;text-transform:uppercase}
      .sc-btns{display:flex;flex-wrap:wrap;gap:.35rem}
      .sc-btn{background:#0e0e14;border:1px solid rgba(255,255,255,.06);color:#706b65;font-family:'Noto Sans KR',sans-serif;font-size:.68rem;font-weight:300;padding:.45em .9em;cursor:pointer;transition:all .3s;border-radius:2px}
      .sc-btn:hover{border-color:rgba(150,120,80,.25);color:#b0a898}
      .sc-btn.act{border-color:rgba(138,64,48,.5);color:#c8b8a8;background:#14101a}
      .info-box{width:380px;background:#0a0a0e;border:1px solid rgba(255,255,255,.04);border-radius:4px;padding:.9rem 1rem}
      .info-name{font-size:.72rem;color:#8a8580;margin-bottom:.3rem;font-weight:400}
      .info-desc{font-size:.65rem;color:#555;line-height:1.7;font-weight:300}
    `}</style>

    <div className="proto-root">
      <div className="proto-title">TV COMPONENT</div>
      <div className="proto-sub">긴급재난경보 — 프로토타입 v4</div>

      <TVScreen
        power={power && !tvOff}
        onPowerClick={handlePower}
        glitchHeader={glitchHeader}
        glitchBody={glitchBody}
        whiteout={whiteout}
        staticNoise={staticNoise}
        header={header}
      >
        {scenario === "moon" && showMoon ? (
          <div className="moon-wrap">
            <div className={`moon-orb ${moonPhase >= 1 ? "mp1" : ""} ${moonPhase >= 2 ? "mp2" : ""} ${moonPhase >= 3 ? "mp3" : ""}`} />
            <div className={`moon-label ${moonPhase >= 3 ? "vis" : ""}`}>함께 바라봅시다</div>
          </div>
        ) : playing ? (
          <AlertTyper
            key={scenario + String(playing)}
            lines={cur.lines}
            speed={35}
            onLineStart={onLineStart}
          />
        ) : (
          <div style={{ textAlign: "center", color: "#2a2a30", fontSize: ".68rem", letterSpacing: ".15em", padding: "2rem" }}>
            시나리오를 선택하세요
          </div>
        )}
      </TVScreen>

      <div className="sc-group">
        <div className="sc-label">Scenarios</div>
        <div className="sc-btns">
          {Object.entries(S).map(([k, v]) => (
            <button key={k} className={`sc-btn ${scenario === k && playing ? "act" : ""}`} onClick={() => startScenario(k)}>
              {v.name}
            </button>
          ))}
        </div>
      </div>

      <div className="info-box">
        <div className="info-name">{cur.name}</div>
        <div className="info-desc">{cur.desc}</div>
      </div>
    </div>
  </>);
}
