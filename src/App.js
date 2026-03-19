import React, { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════
   1. TV FX & COMPONENTS
   ═══════════════════════════════════════════ */
const GLITCH_CHARS = "░▒▓█▄▀▐▌■□▢▣▤▥▦▧▨▩⌧⊞⊟⊠⊡⊘⊗⊕⊖";
function corrupt(len) {
  let s = "";
  for (let i = 0; i < len; i++) s += Math.random() < 0.25 ? " " : GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
  return s;
}

function CorruptText({ length }) {
  const [text, setText] = useState(() => corrupt(length));
  useEffect(() => {
    const iv = setInterval(() => setText(corrupt(length)), 70);
    return () => clearInterval(iv);
  }, [length]);
  return <span>{text}</span>;
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
      {lines.map((len, i) => <p key={i} className="corrupt-line"><CorruptText length={len} /></p>)}
    </div>
  );
}

function TVScreen({ power, glitch, skyMode, header, children }) {
  return (
    <div className="tv-outer">
      <div className="tv-bezel">
        <div className={`tv-screen ${!power ? "tv-off" : ""} ${glitch ? "tv-glitch-fx" : ""}`}>
          
          {/* ✨ 클라이맥스 하늘 연출: 라디오라면 불가능했을 기괴한 시각적 효과 */}
          {skyMode && (
            <div className="tv-sky-bg">
              <div className="tv-moon" />
              <div className="tv-stars" />
            </div>
          )}

          {power && <div className="tv-scanlines" />}
          {power && <div className="tv-vignette" />}
          
          <div className="tv-content" style={{ opacity: skyMode ? 0 : 1, transition: "opacity 2s ease" }}>
            {!power ? (
              <div className="tv-off-center"><div className="tv-off-dot" /></div>
            ) : (
              <>
                <div className="tv-header-area">
                  {glitch ? (
                    <><div className="tv-header tv-header-corrupt"><CorruptText length={12} /></div><div className="tv-header-line-corrupt" /></>
                  ) : header ? (
                    <><div className="tv-header">{header}</div><div className="tv-header-line" /></>
                  ) : <div className="tv-header-empty" />}
                </div>
                <div className="tv-body">
                  {glitch ? <CorruptBody /> : children}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="tv-bottom">
        <div className="tv-brand">LIMINAL</div>
        <div className={`tv-power-indicator ${power ? "on" : ""}`} />
      </div>
    </div>
  );
}

function TVAlertBlock({ lines }) {
  if (!lines) return null;
  return (
    <div className="tv-alert-block">
      {lines.map((line, i) => {
        const cls = ["tv-alert-line", line.warning ? "tv-alert-warning" : ""].filter(Boolean).join(" ");
        return <p key={i} className={cls}>{line.text}</p>;
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════
   2. EXPLORE SYSTEM (호텔 리미널 베이스)
   ═══════════════════════════════════════════ */
function TypewriterLines({ lines, onAllDone, advanceRef }) {
  const [cur, setCur] = useState(0);
  const [ci, setCi] = useState(0);
  const [done, setDone] = useState(false);
  const [rendered, setRendered] = useState([]);
  const tm = useRef(null);

  useEffect(() => { setCur(0); setCi(0); setDone(false); setRendered([]); }, [lines]);

  useEffect(() => {
    if (cur >= lines.length) return;
    if (lines[cur].trim() === "") {
      setRendered(p => [...p, ""]);
      setCur(c => c + 1); setCi(0); setDone(false);
    }
  }, [cur, lines]);

  useEffect(() => {
    if (cur >= lines.length) return;
    const line = lines[cur];
    if (line.trim() === "") return;
    if (ci >= line.length) {
      setDone(true);
      setRendered(p => { const u = [...p]; u[cur] = line; return u; });
      return;
    }
    setRendered(p => { const u = [...p]; u[cur] = line.slice(0, ci + 1); return u; });
    tm.current = setTimeout(() => setCi(c => c + 1), 28);
    return () => clearTimeout(tm.current);
  }, [ci, cur, lines]);

  const allDone = cur >= lines.length;
  useEffect(() => { if (allDone && onAllDone) onAllDone(); }, [allDone, onAllDone]);

  const advance = useCallback(() => {
    if (allDone) return;
    const line = lines[cur];
    if (!done && line && line.trim() !== "") {
      clearTimeout(tm.current);
      setCi(line.length); setDone(true);
      setRendered(p => { const u = [...p]; u[cur] = line; return u; });
    } else if (done) {
      setCur(c => c + 1); setCi(0); setDone(false);
    }
  }, [allDone, cur, done, lines]);

  useEffect(() => { if (advanceRef) advanceRef.current = advance; }, [advance, advanceRef]);

  return (
    <div style={{ minHeight: 60, flex: 1 }}>
      {rendered.map((line, i) => (
        <p key={i} style={{ minHeight: line === "" ? "0.5em" : "auto", margin: "0.3em 0" }}>
          {line}
          {i === cur && !done && <span className="cursor-blink">│</span>}
        </p>
      ))}
      {done && !allDone && <span className="text-continue">▼</span>}
    </div>
  );
}

// 텍스트/장소 데이터
const TV_PHASE_REAL = [
  { text: "주 정부 발령" }, { text: "" },
  { text: "귀하의 지역에 기상 재해가 발생하였습니다." }, { text: "" },
  { text: "안전을 위해 창문을 모두 닫고" },
  { text: "외부 빛을 완벽히 차단하십시오." }, { text: "" },
  { text: "절대 밤하늘을", warning: true },
  { text: "쳐다보지 마십시오.", warning: true },
];

const TV_PHASE_FAKE = [
  { text: "경보 정정 안내" }, { text: "" },
  { text: "해당 기상 현상은 눈으로 보아도" },
  { text: "인체에 전혀 해가 없음을 알려드립니다." }, { text: "" },
  { text: "경보를 해제합니다." }, { text: "" },
  { text: "창문을 열고", warning: true },
  { text: "밤하늘을 감상하십시오.", warning: true },
];

const LOCATIONS = {
  living_room: { name: "거실", connections: [{ to: "window", dir: "right" }] },
  window: { name: "창가", connections: [{ to: "living_room", dir: "left" }] }
};

/* ═══════════════════════════════════════════
   3. MAIN GAME LOGIC
   ═══════════════════════════════════════════ */
export default function HybridHorrorGame() {
  const [phase, setPhase] = useState("TITLE");
  const [loc, setLoc] = useState("living_room");
  
  const [focusTV, setFocusTV] = useState(false); // 시야 분리 상태 (true면 관찰 모드)
  const [tvPower, setTvPower] = useState(false);
  const [tvState, setTvState] = useState("REAL"); // REAL, GLITCH, FAKE, SKY
  
  const [storyStep, setStoryStep] = useState(0); 
  const [curtainClosed, setCurtainClosed] = useState(false);
  
  const [textLines, setTextLines] = useState([]);
  const [choices, setChoices] = useState([]);
  const [textDone, setTextDone] = useState(false);
  const [deathText, setDeathText] = useState("");
  
  const advRef = useRef(null);
  const timerRef = useRef(null);

  const setT = useCallback((textArr) => {
    setTextLines(textArr);
    setTextDone(false);
  }, []);

  const die = useCallback((txt) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setDeathText(txt);
    setPhase("DEATH");
    setFocusTV(false);
  }, []);

  // 장소 이동 시 출력될 텍스트 갱신 (탐색 모드)
  const handleArr = useCallback((l, step = storyStep) => {
    if (l === "living_room") {
      if (step === 0) {
        setT(["새벽 2시 47분.", "방 안이 고요하다.", "", "그때, 꺼져있던 TV가 갑자기 켜지며 요란한 알림음이 울린다."]);
        setTvPower(true);
        setChoices([{ text: "TV 화면을 본다", action: () => enterTV("REAL") }]);
      } else if (step === 1) {
        setT(["거실이다.", "TV에서 붉은 경고문이 깜빡이고 있다.", "창문을 닫고 빛을 차단하라고 했다."]);
        setChoices([{ text: "TV를 다시 본다", action: () => enterTV("REAL") }]);
      } else if (step === 2) {
        setT(["거실로 돌아왔다.", "그 순간, 등 뒤의 TV에서 기괴한 노이즈가 울려퍼졌다.", "방송 내용이 바뀐 것 같다."]);
        setChoices([{ text: "TV 화면을 확인한다", action: () => enterTV("GLITCH") }]);
      } else if (step === 3) {
        setT(["거실이다.", "TV에서 밖을 보라는 방송이 나오고 있다.", "뭔가 단단히 잘못되었다."]);
        setChoices([{ text: "TV를 다시 본다", action: () => enterTV("GLITCH") }]);
      }
    } else if (l === "window") {
      if (!curtainClosed) {
        setT(["창가 앞이다.", "바깥은 칠흑 같은 밤이지만, 서늘한 하얀 빛이 아른거린다."]);
        if (step >= 1) {
          setChoices([
            { text: "커튼을 꼼꼼하게 친다", action: () => {
                setCurtainClosed(true);
                setStoryStep(2);
                setT(["두꺼운 암막 커튼을 쳤다.", "이제 밖은 전혀 보이지 않는다."]);
                setChoices([]);
            }},
            { text: "밖을 본다", action: () => die("창밖에는 거대하고 기괴한 달이 떠 있었다.\n당신은 영원히 시선을 뗄 수 없게 되었다.") }
          ]);
        } else {
          setChoices([]);
        }
      } else {
        setT(["커튼이 빈틈없이 쳐져 있다.", "밖의 빛은 전혀 들어오지 않는다."]);
        if (step >= 3) {
          setChoices([
            { text: "커튼을 열고 밖을 본다", action: () => die("경보는 거짓이었다.\n창밖의 기괴한 달과 눈이 마주쳤다.") }
          ]);
        } else {
          setChoices([]);
        }
      }
    }
  }, [storyStep, curtainClosed, die, setT]);

  const moveTo = useCallback((dest) => {
    setLoc(dest); setChoices([]); handleArr(dest);
  }, [handleArr]);

  // 관찰 모드(TV 집중) 진입
  const enterTV = (initialState) => {
    setFocusTV(true); setChoices([]); setTvState(initialState);
    
    if (initialState === "GLITCH") {
      // 함정 연출: 가짜 경보 후 밤하늘 송출
      timerRef.current = setTimeout(() => {
        setTvState("FAKE");
        setStoryStep(3);
        
        timerRef.current = setTimeout(() => {
          setTvState("SKY");
          setT([
            "텍스트가 일그러지며 사라진다.",
            "화면 너머로 맑고 깊은 우주가 나타난다.",
            "",
            "창문을 막자, 그것들이 TV를 해킹해 억지로 밤하늘을 보여주려 한다.",
            "넋을 잃고 화면 속의 달을 바라보게 된다..."
          ]);
          
          setChoices([{ text: "재빨리 전원 플러그를 뽑는다!", action: () => {
            clearTimeout(timerRef.current);
            setTvPower(false); setFocusTV(false); setPhase("CLEAR");
          }}]);

          timerRef.current = setTimeout(() => {
            die("시선을 뺏겨 아무것도 할 수 없었다.\n하얀 빛이 방 안을 집어삼켰다.");
          }, 6000); // 6초 타임어택

        }, 4000);
      }, 2000);
    }
  };

  const leaveTV = () => {
    if (storyStep === 0) {
      setStoryStep(1); handleArr(loc, 1);
    } else {
      handleArr(loc);
    }
    setFocusTV(false);
  };

  const navObj = focusTV ? { left: [], right: [] } : {
    left: LOCATIONS[loc].connections.filter(c => c.dir === "left"),
    right: LOCATIONS[loc].connections.filter(c => c.dir === "right")
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=Noto+Sans+KR:wght@200;300;400;500&family=Share+Tech+Mono&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }
        html, body { height: 100%; overflow: hidden; }
        .game-root { font-family: 'Noto Sans KR', sans-serif; background: #08080a; color: #d4d0cb; height: 100vh; display: flex; justify-content: center; position: relative; overflow: hidden; }
        .game-frame { width: 100%; max-width: 520px; height: 100vh; position: relative; z-index: 1; display: flex; flex-direction: column; transition: opacity .5s ease; }
        
        /* ── TV UI ── */
        .tv-outer { width: 380px; flex-shrink: 0; transition: transform 0.5s ease; margin: 0 auto; }
        .tv-bezel { background: linear-gradient(180deg,#1e1e22,#161618); border: 2px solid #2a2a30; border-radius: 8px; padding: 12px; box-shadow: 0 4px 40px rgba(0,0,0,.7), inset 0 1px 0 rgba(255,255,255,.03); }
        .tv-screen { position: relative; background: #08080c; border-radius: 4px; width: 100%; height: 280px; overflow: hidden; transition: background 2s ease; }
        .tv-screen.tv-off { background: #030306; }
        .tv-scanlines { position: absolute; inset: 0; background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,.06) 2px, rgba(0,0,0,.06) 4px); pointer-events: none; z-index: 3; }
        .tv-vignette { position: absolute; inset: 0; background: radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,.6) 100%); pointer-events: none; z-index: 4; }
        .tv-content { position: relative; z-index: 2; height: 100%; display: flex; flex-direction: column; overflow: hidden; }

        .tv-header-area { flex-shrink: 0; padding: .8rem 1.2rem 0; text-align: center; min-height: 48px; }
        .tv-header { font-family: 'Share Tech Mono', monospace; font-size: .8rem; font-weight: 500; color: #d0ccc5; letter-spacing: .25em; padding-bottom: .45rem; }
        .tv-header-line { height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,.12), transparent); margin: 0 .8rem; }
        .tv-header-corrupt { color: transparent; position: relative; padding-bottom: .45rem; }
        .corrupt-header-text { font-family: 'Share Tech Mono', monospace; font-size: .8rem; color: #c05040; letter-spacing: .12em; opacity: .7; animation: corruptFlicker .07s steps(2) infinite; }
        .tv-header-line-corrupt { height: 1px; background: linear-gradient(90deg, transparent, rgba(192,80,64,.3), transparent); margin: 0 .8rem; animation: corruptFlicker .1s steps(2) infinite; }

        .tv-body { flex: 1; padding: .5rem 1.4rem .8rem; overflow: hidden; display: flex; flex-direction: column; justify-content: center; }
        .corrupt-body { text-align: center; }
        .corrupt-line { font-family: 'Share Tech Mono', monospace; font-size: .73rem; color: #c05040; opacity: .5; margin: .2em 0; letter-spacing: .08em; animation: corruptFlicker .08s steps(2) infinite; }
        @keyframes corruptFlicker { 0% { opacity: .6; transform: translateX(0) } 50% { opacity: .2; transform: translateX(-2px) } 100% { opacity: .7; transform: translateX(1px) } }

        .tv-alert-block { font-family: 'Share Tech Mono', monospace; font-size: .73rem; line-height: 1.9; color: #b0aca5; text-align: center; }
        .tv-alert-line { margin: .05em 0; min-height: .8em; }
        .tv-alert-warning { color: #c05040; text-shadow: 0 0 10px rgba(192,80,64,.25); }

        .tv-bottom { display: flex; align-items: center; justify-content: space-between; padding: .5rem .6rem .2rem; }
        .tv-brand { font-family: 'Share Tech Mono', monospace; font-size: .5rem; letter-spacing: .5em; color: #2a2a30; }
        .tv-power-indicator { width: 5px; height: 5px; border-radius: 50%; background: #222; }
        .tv-power-indicator.on { background: #c05040; box-shadow: 0 0 8px #c05040; }

        .tv-glitch-fx { animation: screenShake .08s steps(2) infinite; filter: contrast(1.2) brightness(1.1); }
        @keyframes screenShake { 0%{transform:translate(0)} 25%{transform:translate(-2px,1px)} 50%{transform:translate(1px,-1px)} 75%{transform:translate(-1px,2px)} 100%{transform:translate(0)} }

        /* 🌌 핵심: TV 내부 밤하늘 렌더링 */
        .tv-sky-bg { position: absolute; inset: 0; background: linear-gradient(to bottom, #020111 0%, #20124d 100%); z-index: 1; animation: fadeSky 2s ease forwards; }
        .tv-moon { position: absolute; top: 20%; left: 50%; transform: translateX(-50%); width: 70px; height: 70px; background: #fff; border-radius: 50%; box-shadow: 0 0 30px #fff, 0 0 80px #aaaaff; animation: moonPulse 3s alternate infinite; }
        .tv-stars { position: absolute; inset: 0; background-image: radial-gradient(1px 1px at 20px 30px, #fff, transparent), radial-gradient(1.5px 1.5px at 80px 70px, #eee, transparent), radial-gradient(1px 1px at 150px 160px, #ddd, transparent), radial-gradient(2px 2px at 220px 40px, #fff, transparent); background-size: 350px 350px; animation: starsDrift 20s linear infinite; opacity: 0.8; }
        @keyframes fadeSky { from { opacity: 0; filter: brightness(0); } to { opacity: 1; filter: brightness(1.2); } }
        @keyframes moonPulse { from { transform: scale(1); } to { transform: scale(1.05); } }
        @keyframes starsDrift { from { transform: translateY(0); } to { transform: translateY(-100px); } }

        /* ── EXPLORE UI (Hotel Liminal Style) ── */
        .game-content { flex: 1; padding: 1.2rem 1.5rem .5rem; display: flex; flex-direction: column; overflow: hidden; min-height: 0; }
        .scene-header { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: .6rem; gap: .6rem; position: relative; z-index: 60; background: #08080a; padding-top: .2rem; flex-shrink: 0; }
        .scene-location { font-size: .75rem; color: #706a62; letter-spacing: .12em; }
        .scene-time { font-family: 'Cormorant Garamond', serif; font-size: .85rem; color: #8a4030; letter-spacing: .1em; font-weight: 300; }
        .scene-divider { height: 1px; background: linear-gradient(90deg, #2a2520, transparent); margin-bottom: .8rem; flex-shrink: 0; }
        
        .text-advance-overlay { position: fixed; inset: 0; z-index: 55; cursor: pointer; }
        .scene-text { flex: 1; font-size: .88rem; line-height: 1.85; color: #b5b0a8; font-weight: 300; letter-spacing: .01em; margin-bottom: .6rem; min-height: 0; overflow-y: auto; }
        .cursor-blink { color: #8a4030; animation: blink 1s steps(1) infinite; }
        @keyframes blink { 0%, 49% { opacity: 1 } 50%, 100% { opacity: 0 } }
        
        .choices-area { display: flex; flex-direction: column; gap: .35rem; margin-bottom: .6rem; animation: fadeUp .5s ease; position: relative; z-index: 60; flex-shrink: 0; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .choice-btn { background: #12121a; border: 1px solid rgba(255,255,255,.12); color: #c0b8ae; font-family: 'Noto Sans KR', sans-serif; font-size: .8rem; font-weight: 300; padding: .7em 1em; text-align: center; cursor: pointer; transition: all .3s ease; position: relative; z-index: 60; }
        .choice-btn:hover { background: #1a1a24; border-color: rgba(150,120,80,.4); color: #e0d8ce; }
        .choice-btn.urgent { border-color: #8a4030; color: #c05040; font-weight: 400; animation: urgentPulse 0.5s infinite alternate; }
        @keyframes urgentPulse { from { box-shadow: 0 0 5px rgba(192,80,64,0.3); } to { box-shadow: 0 0 15px rgba(192,80,64,0.8); background: rgba(192,80,64,0.1); } }

        .nav-area { padding: .4rem 1.5rem .8rem; display: flex; justify-content: space-between; border-top: 1px solid rgba(255,255,255,.04); position: relative; z-index: 60; min-height: 2.5rem; background: #08080a; flex-shrink: 0; }
        .nav-col { display: flex; flex-direction: column; gap: .2rem; min-width: 40%; }
        .nav-btn { display: flex; align-items: center; gap: .3em; background: none; border: none; color: #7a7570; font-family: 'Noto Sans KR', sans-serif; font-size: .82rem; font-weight: 300; cursor: pointer; padding: .35em .2em; transition: color .2s; letter-spacing: .05em; }
        .nav-btn:hover { color: #b0a898; }
        .nav-arrow { font-size: .9rem; color: #5a5550; }

        /* ── Focus Overlay (관찰 모드 배경) ── */
        .focus-overlay { position: fixed; inset: 0; background: rgba(5,5,8,0.95); z-index: 100; display: flex; flex-direction: column; align-items: center; justify-content: center; animation: fadeIn 0.5s ease; padding: 1rem; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .focus-tv-container { transform: scale(1.1); transition: transform 2s ease; margin-bottom: 2rem; }
        .focus-tv-container.sky-zoom { transform: scale(1.25); }
        .back-btn { background: transparent; border: 1px solid rgba(255,255,255,0.2); color: #aaa; padding: 0.7em 2em; font-family: inherit; font-size: 0.85rem; letter-spacing: 0.1em; cursor: pointer; transition: all 0.3s; margin-top: 2rem; }
        .back-btn:hover { border-color: #fff; color: #fff; }

        /* ── Screens ── */
        .center-screen { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center; padding: 2rem; }
        .title-text { font-family: 'Share Tech Mono', monospace; font-size: 1.5rem; letter-spacing: .3em; margin-bottom: 2rem; color: #a09080; }
        .death-text { font-size: .95rem; color: #c05040; line-height: 2; margin-bottom: 2rem; white-space: pre-wrap; }
        .clear-text { font-size: 1rem; color: #a09888; line-height: 2; margin-bottom: 2rem; }
      `}</style>

      {phase === "TITLE" && (
        <div className="center-screen">
          <div className="title-text">LOCAL DISASTER</div>
          <button className="choice-btn" style={{ padding: '0.8em 3em' }} onClick={() => { setPhase("GAME"); handleArr("living_room"); }}>수신 확인</button>
        </div>
      )}

      {phase === "DEATH" && (
        <div className="center-screen">
          <div className="death-text">{deathText}</div>
          <button className="choice-btn" onClick={() => window.location.reload()}>처음으로</button>
        </div>
      )}

      {phase === "CLEAR" && (
        <div className="center-screen">
          <div className="clear-text">TV 플러그를 거칠게 뽑았다.<br/>화면이 꺼지며 무거운 정적이 찾아왔다.<br/><br/>살아남았다.</div>
          <button className="choice-btn" onClick={() => window.location.reload()}>처음으로</button>
        </div>
      )}

      {phase === "GAME" && (
        <div className="game-frame">
          
          {/* 1. TV 관찰 모드 (TV Focus) */}
          {focusTV && (
            <div className="focus-overlay">
              <div className={`focus-tv-container ${tvState === "SKY" ? "sky-zoom" : ""}`}>
                <TVScreen 
                  power={tvPower} 
                  header={tvState === "REAL" ? "긴급재난경보체계" : "대국민 위험 경보"} 
                  glitch={tvState === "GLITCH"} 
                  skyMode={tvState === "SKY"}
                >
                  {tvState === "REAL" && <TVAlertBlock lines={TV_PHASE_REAL} />}
                  {tvState === "FAKE" && <TVAlertBlock lines={TV_PHASE_FAKE} />}
                </TVScreen>
              </div>

              {/* 클라이맥스 연출: 고개를 돌리는 버튼이 사라지고 타임어택 선택지 등장 */}
              {tvState === "SKY" ? (
                <div style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column' }}>
                  <TypewriterLines key={textLines.join()} lines={textLines} onAllDone={() => setTextDone(true)} />
                  {textDone && choices.length > 0 && (
                    <div className="choices-area" style={{ marginTop: '1rem' }}>
                      {choices.map((c, i) => (
                        <button key={i} className="choice-btn urgent" onClick={c.action}>{c.text}</button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <button className="back-btn" onClick={leaveTV}>고개를 돌린다</button>
              )}
            </div>
          )}

          {/* 2. 방 안 탐색 모드 (Hotel Liminal Style) */}
          {!focusTV && (
            <>
              {!textDone && <div className="text-advance-overlay" onClick={() => advRef.current && advRef.current()} />}
              <div className="game-content">
                <div className="scene-header">
                  <span className="scene-location">{LOCATIONS[loc].name}</span>
                  <span className="scene-time">AM 2:47</span>
                </div>
                <div className="scene-divider" />
                
                <div className="scene-text">
                  <TypewriterLines key={textLines.join("|")} lines={textLines} onAllDone={() => setTextDone(true)} advanceRef={advRef} />
                </div>
                
                {textDone && choices.length > 0 && (
                  <div className="choices-area">
                    {choices.map((c, i) => (
                      <button key={i} className="choice-btn" onClick={c.action}>{c.text}</button>
                    ))}
                  </div>
                )}
              </div>

              {textDone && (
                <div className="nav-area">
                  <div className="nav-col" style={{ alignItems: "flex-start" }}>
                    {navObj.left.map(n => (
                      <button key={n.to} className="nav-btn" onClick={() => moveTo(n.to)}>
                        <span className="nav-arrow">←</span> {LOCATIONS[n.to].name}
                      </button>
                    ))}
                  </div>
                  <div className="nav-col" style={{ alignItems: "flex-end" }}>
                    {navObj.right.map(n => (
                      <button key={n.to} className="nav-btn" onClick={() => moveTo(n.to)}>
                        {LOCATIONS[n.to].name} <span className="nav-arrow">→</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}