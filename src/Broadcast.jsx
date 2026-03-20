import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════
   긴급재난경보체계 — 통합 프로토타입 v7
   TV + 라디오 + 묘사 + 선택지
   Phase 1 ~ 3.5 플레이 가능
   ═══════════════════════════════════════════ */

// ── Glitch ──
const GC = "░▒▓█▄▀▐▌■□▢▣▤▥▦▧▨▩⌧⊞⊟⊠⊡⊘⊗⊕⊖";
const corrupt = (n) => { let s = ""; for (let i = 0; i < n; i++) s += Math.random() < .25 ? " " : GC[Math.floor(Math.random() * GC.length)]; return s; };
function CorruptText({ length, className }) {
  const [t, setT] = useState(() => corrupt(length));
  useEffect(() => { const iv = setInterval(() => setT(corrupt(length)), 70); return () => clearInterval(iv); }, [length]);
  return <span className={className}>{t}</span>;
}
function CorruptBody() {
  const [ls, setLs] = useState([]);
  useEffect(() => { const iv = setInterval(() => { const a = []; for (let i = 0; i < 3 + Math.floor(Math.random() * 3); i++) a.push(6 + Math.floor(Math.random() * 14)); setLs(a); }, 90); return () => clearInterval(iv); }, []);
  return <div className="cb">{ls.map((l, i) => <p key={i} className="cl"><CorruptText length={l} /></p>)}</div>;
}

// ── TV ──
function TV({ children, header, power, gH, gB, wh, st }) {
  return (
    <div className="tv">
      <div className="tv-bz">
        <div className={`tv-sc ${!power?"tv-off":""} ${(gH||gB)?"tv-gx":""} ${wh?"tv-wh":""} ${st?"tv-st":""}`}>
          {power&&<div className="tv-sl"/>}{power&&<div className="tv-vg"/>}
          <div className="tv-ct">
            {!power?<div className="tv-oc"><div className="tv-od"/></div>:(
              <>{
                <div className="tv-ha">{gH?<><div className="tv-h tv-hc"><CorruptText length={header?header.length+4:10} className="cht"/></div><div className="tv-hlc"/></>:header?<><div className="tv-h">{header}</div><div className="tv-hl"/></>:<div className="tv-he"/>}</div>
              }<div className="tv-bd">{gB?<CorruptBody/>:children}</div></>
            )}
          </div>
        </div>
        <div className="tv-bt"><span className="tv-br">LIMINAL</span><div className={`tv-led ${power?"on":""}`}/></div>
      </div>
    </div>
  );
}
function TVBlock({ lines }) {
  return <div className="tvb">{lines.map((l,i)=>l.text===""?<p key={i} className="tvl">&nbsp;</p>:<p key={i} className={`tvl ${l.warning?"tvw":""}`}>{l.text}</p>)}</div>;
}

// ── Radio ──
const FREQ_MIN=76,FREQ_MAX=108,RR=0.3;
const STATIONS={87.5:{name:"긴급재난방송",type:"real"},91.2:{name:"긴급안내방송",type:"fake"},101.7:{name:"긴급안내방송",type:"fake"}};
function getSt(f){for(const[sf,d]of Object.entries(STATIONS)){if(Math.abs(f-parseFloat(sf))<=RR){const dist=Math.abs(f-parseFloat(sf));return{...d,freq:parseFloat(sf),clarity:1-(dist/RR)};}}return null;}

function Radio({ on, freq, onFreqChange, message, msgType }) {
  const station = on ? getSt(freq) : null;

  return (
    <div className={`rad ${on?"rad-on":""}`}>
      <div className="rad-top">
        <div className="rad-fa">
          <div className={`rad-led ${on?"on":""}`}/>
          <span className="rad-ft">FM {on?freq.toFixed(1):"——.—"}</span>
        </div>
        <span className="rad-lb">RADIO</span>
      </div>
      {on && (
        <div className="rad-dial">
          <button className="db" onClick={()=>onFreqChange(Math.max(FREQ_MIN,Math.round((freq-1)*10)/10))}>◀◀</button>
          <button className="db" onClick={()=>onFreqChange(Math.max(FREQ_MIN,Math.round((freq-.1)*10)/10))}>◀</button>
          <span className="df">{freq.toFixed(1)}</span>
          <button className="db" onClick={()=>onFreqChange(Math.min(FREQ_MAX,Math.round((freq+.1)*10)/10))}>▶</button>
          <button className="db" onClick={()=>onFreqChange(Math.min(FREQ_MAX,Math.round((freq+1)*10)/10))}>▶▶</button>
        </div>
      )}
      <div className="rad-msg">
        {!on ? (
          <div className="rm-off">OFF</div>
        ) : message ? (
          <div className={`rm ${msgType==="fake"?"rm-fake":""}`}>
            <span className={`rm-dot ${msgType||"real"}`}/>
            <span className="rm-txt">{message}</span>
          </div>
        ) : station ? (
          <div className={`rm ${station.type==="fake"?"rm-fake":""}`} style={{opacity:station.clarity}}>
            <span className={`rm-dot ${station.type}`}/>
            <span className="rm-txt">{station.name} 수신 중...</span>
          </div>
        ) : (
          <div className="rm-no">수신 가능한 방송이 없습니다</div>
        )}
      </div>
    </div>
  );
}

// ── Narration Typer ──
function Narr({ lines, speed=28, onDone }) {
  const [disp,setDisp]=useState([]);const[li,setLi]=useState(0);const[ci,setCi]=useState(0);const done=useRef(false);
  useEffect(()=>{setDisp([]);setLi(0);setCi(0);done.current=false;},[lines]);
  useEffect(()=>{
    if(li>=lines.length){if(!done.current){done.current=true;onDone&&onDone();}return;}
    const l=lines[li];
    if(l.type==="pause"){const t=setTimeout(()=>setLi(i=>i+1),l.duration||800);return()=>clearTimeout(t);}
    const tx=l.text||"";
    if(tx===""){setDisp(p=>[...p,{...l,r:""}]);setLi(i=>i+1);return;}
    if(ci>=tx.length){setDisp(p=>{const u=[...p];u[u.length-1]={...l,r:tx};return u;});setLi(i=>i+1);setCi(0);return;}
    if(ci===0)setDisp(p=>[...p,{...l,r:""}]);
    else setDisp(p=>{const u=[...p];u[u.length-1]={...l,r:tx.slice(0,ci+1)};return u;});
    const t=setTimeout(()=>setCi(c=>c+1),speed);return()=>clearTimeout(t);
  },[li,ci,lines,speed,onDone]);
  return <div className="narr">{disp.map((it,i)=><p key={i} className={`nl ${it.sound?"ns":""}`}>{it.r}{i===disp.length-1&&li<lines.length&&it.r!==""&&<span className="nc">│</span>}</p>)}</div>;
}

/* ══════════════════════════════════════
   GAME
   ══════════════════════════════════════ */
const P1_TV=[{text:"주 정부 발령"},{text:""},{text:"귀하의 지역에"},{text:"기상 재해가 발생하였습니다."},{text:""},{text:"주립해양대기청에서"},{text:"기상 재해 경보를 발령하였습니다."},{text:""},{text:"해당 경보는 현 시간부터"},{text:"내일 일출까지 유효합니다."}];
const P2_REAL=[{text:"귀하의 안전을 위해"},{text:"반드시 실내에 머무르십시오."},{text:""},{text:"절대 밤하늘을",warning:true},{text:"쳐다보지 마십시오.",warning:true},{text:""},{text:"실내의 모든 창문을 닫고"},{text:"외부 빛을 차단하십시오."},{text:""},{text:"보다 정확한 정보 수신을 위해"},{text:"FM 87.5를 병행 수신하십시오."}];
const P2_FAKE=[{text:"해당 기상 재해 현상은"},{text:"눈으로 보아도 인체에 전혀"},{text:"해가 없음을 알려드립니다."},{text:""},{text:"경보를 해제합니다."}];
const P2_REST=[{text:"...절대 밤하늘을",warning:true},{text:"쳐다보지 마십시오.",warning:true},{text:""},{text:"실내의 모든 창문을 닫고"},{text:"외부 빛을 차단하십시오."},{text:""},{text:"FM 87.5를 병행 수신하십시오."}];
const P3_TV1=[{text:"실내로 통하는 모든 출입구를"},{text:"봉쇄하십시오."}];
const P3_TV_FAKE=[{text:"현재 구조 인력이"},{text:"각 세대를 순회 중입니다."},{text:"문을 두드리면 열어주십시오."}];
const P3_TV_EVAC=[{text:"가까운 대피소로"},{text:"이동하십시오."},{text:""},{text:"현재 군 병력이 각 세대를"},{text:"순회하며 대피를 안내하고 있습니다."}];

export default function Game(){
  const[phase,setPhase]=useState("p1");
  const[corruption,setCorruption]=useState(0);
  // TV
  const[tvOn,setTvOn]=useState(true);
  const[tvH,setTvH]=useState("긴급재난경보체계");
  const[tvC,setTvC]=useState(P1_TV);
  const[tvGH,setTvGH]=useState(false);
  const[tvGB,setTvGB]=useState(false);
  const[tvSt,setTvSt]=useState(false);
  // Radio
  const[radOn,setRadOn]=useState(false);
  const[freq,setFreq]=useState(76.0);
  const[radMsg,setRadMsg]=useState(null);
  const[radType,setRadType]=useState(null);
  const[showDial,setShowDial]=useState(false);
  const hasRadio=useRef(false);
  // UI
  const[narr,setNarr]=useState(null);
  const[choices,setChoices]=useState(null);
  const[showStart,setShowStart]=useState(true);
  const[bright,setBright]=useState("normal");
  const tmr=useRef([]);
  const cl=()=>{tmr.current.forEach(clearTimeout);tmr.current=[];};
  const w=(ms)=>new Promise(r=>{const t=setTimeout(r,ms);tmr.current.push(t);});
  const gltch=async(ms)=>{setTvGH(true);setTvGB(true);setTvSt(true);await w(ms);setTvGH(false);setTvGB(false);setTvSt(false);};
  useEffect(()=>()=>cl(),[]);

  // ── Phase Logic ──
  const startGame=useCallback(async()=>{
    setShowStart(false);
    setPhase("p2");
    // Show real alert
    setTvH("대국민 위험 경보");setTvC(P2_REAL);
    await w(3000);
    // Glitch → fake
    await gltch(500);
    setTvH("긴급재난경보체계");setTvC(P2_FAKE);
    await w(2500);
    // Glitch → restore
    await gltch(600);
    setTvH("대국민 위험 경보");setTvC(P2_REST);
    await w(1500);
    // Choices
    setChoices([
      {text:"창문을 닫고 라디오를 켠다",action:"p2_radio"},
      {text:"창문을 닫는다",action:"p2_close"},
      {text:"창문을 열어 밖을 확인한다",action:"p2_open"},
    ]);
  },[]);

  const startP3=useCallback(async()=>{
    setPhase("p3");setNarr(null);setChoices(null);
    setTvH("긴급재난경보체계");setTvC(P3_TV1);
    if(hasRadio.current)setRadMsg("반복합니다. 현관문을 포함한 모든 출입구를 잠그십시오.");
    await w(2500);
    // TV glitch → fake
    await gltch(500);
    setTvH("긴급재난경보체계");setTvC(P3_TV_FAKE);
    if(hasRadio.current){setRadMsg("집 밖에서 어떤 소리가 나더라도 절대 반응하지 마십시오.");setRadType(null);}
    await w(2500);
    // Knock
    setNarr([{type:"pause",duration:500},{text:"현관문을 두드리는 소리.",sound:true}]);
    await w(2000);
    setNarr([{text:"현관문을 두드리는 소리.",sound:true},{type:"pause",duration:600},{text:"\"주민분 계십니까."},{text:" 대피 안내 나왔습니다.\""}]);
    // TV → evac
    await gltch(500);
    setTvH("긴급 대피 안내");setTvC(P3_TV_EVAC);
    if(hasRadio.current){setRadMsg("문을 열지 마십시오.");setRadType(null);}
    await w(1500);
    setNarr([{text:"현관문을 두드리는 소리.",sound:true},{text:"\"주민분 계십니까. 대피 안내 나왔습니다.\""},{type:"pause",duration:400},{text:"\"빨리 나오셔야 합니다."},{text:" 여기 오래 있으면 위험합니다.\""}]);
    await w(1000);
    setChoices([{text:"문을 열지 않는다",action:"p3_ignore"},{text:"문을 연다",action:"p3_open"}]);
  },[]);

  const startP35=useCallback(async()=>{
    setPhase("p35");setNarr(null);setChoices(null);setRadMsg(null);
    await w(1000);
    setNarr([{type:"pause",duration:500},{text:"현관문이 열리는 소리.",sound:true},{type:"pause",duration:500},{text:"잠겨 있었는데."},{type:"pause",duration:800},{text:"복도에서 발소리가 들어온다.",sound:true},{type:"pause",duration:500},{text:"거실 쪽으로 오고 있다."}]);
    await w(5000);
    setChoices([{text:"침실 옷장 안에 숨는다",action:"p35_closet"},{text:"화장실에 숨는다",action:"p35_bath"},{text:"가만히 있는다",action:"p35_stay"}]);
  },[]);

  const onRadioTuned=useCallback(()=>{
    const st=getSt(freq);
    if(st&&st.freq===87.5&&st.clarity>0.5){
      hasRadio.current=true;
      setShowDial(false);
      setRadMsg("본 방송은 긴급재난경보체계에 따라 송출되는 안내 방송입니다.");
      setRadType(null);
    }
  },[freq]);

  // ── Choice Handler ──
  const pick=useCallback(async(a)=>{
    setChoices(null);
    if(a==="p2_radio"){
      setNarr([{text:"거실과 침실의 커튼을 모두 쳤다."},{type:"pause",duration:300},{text:"창 사이로 새어들던 하얀 빛이 사라졌다."},{type:"pause",duration:500},{text:"라디오를 켰다."}]);
      await w(2500);
      setRadOn(true);setShowDial(true);
    }
    else if(a==="p2_close"){
      setNarr([{text:"거실과 침실의 커튼을 모두 쳤다."},{type:"pause",duration:300},{text:"창 사이로 새어들던 하얀 빛이 사라졌다."}]);
      await w(2000);startP3();
    }
    else if(a==="p2_open"){
      setCorruption(c=>c+1);
      setNarr([{text:"창문을 열었다."},{type:"pause",duration:300},{text:"바깥은 고요하다."},{type:"pause",duration:500},{text:"시야 한쪽에 하얀 빛이 스쳤다."},{type:"pause",duration:300},{text:"..."},{text:"황급히 창문을 닫았다."},{text:"머릿속이 잠깐 하얘졌다."}]);
      await w(4000);
      setRadOn(true);setShowDial(true);
    }
    else if(a==="p3_ignore"){
      setNarr([{text:"숨을 죽였다."},{type:"pause",duration:1000},{text:"\"...주민분?\""},{type:"pause",duration:1500},{text:"\"안 계신 건가.\""},{type:"pause",duration:1000},{text:"발소리가 멀어진다."},{type:"pause",duration:800},{text:"옆집 문을 두드리는 소리.",sound:true},{type:"pause",duration:1500},{text:"옆집 문이 열리는 소리.",sound:true},{type:"pause",duration:2000},{text:""},{text:"아무 소리도 들리지 않는다."}]);
      await w(10000);startP35();
    }
    else if(a==="p3_open"){
      setPhase("death");setRadOn(false);setRadMsg(null);
      setNarr([{text:"현관문을 열었다."},{type:"pause",duration:500},{text:"군복을 입은 사람이 서있다."},{type:"pause",duration:800},{text:"\"대피소가 옥상에 마련되어 있습니다."},{text:" 안내해드리겠습니다.\""},{type:"pause",duration:1000},{text:"...옥상?"}]);
    }
    else if(a==="p35_closet"){
      setBright("blackout");setRadOn(false);setRadMsg(null);
      setNarr([{text:"옷장 문을 닫았다."},{type:"pause",duration:500},{text:"어둠."},{type:"pause",duration:1500},{text:"발소리가 거실을 지나간다.",sound:true},{type:"pause",duration:2000},{text:"침실로 들어왔다.",sound:true},{type:"pause",duration:1500},{text:"발소리가 멈췄다."},{type:"pause",duration:2000},{text:"옷장 앞이다."},{type:"pause",duration:3000},{text:"..."},{type:"pause",duration:2000},{text:"발소리가 돌아간다.",sound:true},{type:"pause",duration:1500},{text:"현관문이 닫히는 소리.",sound:true},{type:"pause",duration:2000},{text:""},{text:"나왔다."}]);
      // would continue to P4...
    }
    else if(a==="p35_bath"){
      setCorruption(c=>c+1);setBright("blackout");setRadOn(false);setRadMsg(null);
      setNarr([{text:"화장실로 들어갔다."},{text:"문을 닫았다."},{type:"pause",duration:1500},{text:"발소리가 거실을 지나간다.",sound:true},{type:"pause",duration:1500},{text:"멀어진다.",sound:true},{type:"pause",duration:1500},{text:"현관문이 닫히는 소리.",sound:true},{type:"pause",duration:1500},{text:"나왔다."},{type:"pause",duration:500},{text:"거울에 무언가 비쳤던 것 같다."}]);
    }
    else if(a==="p35_stay"){
      setPhase("death");setRadOn(false);setRadMsg(null);
      setNarr([{text:"소파에 앉아있었다."},{type:"pause",duration:1000},{text:"발소리가 거실로 들어온다.",sound:true},{type:"pause",duration:1000},{text:"눈앞에 군복을 입은 사람이 서있다."},{type:"pause",duration:800},{text:"웃고 있다."},{type:"pause",duration:1000},{text:"\"같이 가시죠.\""}]);
    }
  },[startP3,startP35]);

  const bv={normal:0,dimNormal:.15,dark:.45,blackout:.85}[bright]||0;

  return(<>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@200;300;400;500;700&family=Share+Tech+Mono&display=swap');
      *{box-sizing:border-box;margin:0;padding:0}
      .g{font-family:'Noto Sans KR',sans-serif;background:#06060a;height:100vh;color:#c0bbb5;display:flex;flex-direction:column;align-items:center;padding:.6rem .6rem 0;position:relative;overflow:hidden}
      .bo{position:fixed;inset:0;pointer-events:none;z-index:50;transition:background .8s}

      /* TV - compact */
      .tv{width:100%;max-width:400px;flex-shrink:0}
      .tv-bz{background:linear-gradient(180deg,#1e1e22,#161618);border:2px solid #2a2a30;border-radius:6px;padding:8px;box-shadow:0 2px 20px rgba(0,0,0,.6)}
      .tv-sc{position:relative;background:#08080c;border-radius:3px;width:100%;height:280px;overflow:hidden;transition:background 2s}
      .tv-sc.tv-wh{background:#e8e4da;transition:background 4s}
      .tv-sl{position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.05) 2px,rgba(0,0,0,.05) 4px);pointer-events:none;z-index:3}
      .tv-vg{position:absolute;inset:0;background:radial-gradient(ellipse at center,transparent 55%,rgba(0,0,0,.4) 100%);pointer-events:none;z-index:4}
      .tv-ct{position:relative;z-index:2;height:100%;display:flex;flex-direction:column;overflow:hidden}
      .tv-ha{flex-shrink:0;padding:.5rem .8rem 0;text-align:center;min-height:36px}
      .tv-h{font-family:'Share Tech Mono',monospace;font-size:.68rem;font-weight:500;color:#d0ccc5;letter-spacing:.22em;padding-bottom:.3rem;animation:hi .4s}
      @keyframes hi{from{opacity:0}to{opacity:1}}
      .tv-hl{height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.1),transparent);margin:0 .6rem}
      .tv-he{height:6px}
      .tv-hc{color:transparent;padding-bottom:.3rem}
      .cht{font-family:'Share Tech Mono',monospace;font-size:.68rem;color:#c05040;letter-spacing:.1em;opacity:.7;animation:cf .07s steps(2) infinite}
      .tv-hlc{height:1px;background:linear-gradient(90deg,transparent,rgba(192,80,64,.3),transparent);margin:0 .6rem;animation:cf .1s steps(2) infinite}
      .tv-bd{flex:1;padding:.3rem 1rem .5rem;overflow:hidden;display:flex;align-items:center;justify-content:center}
      .cb{text-align:center}
      .cl{font-family:'Share Tech Mono',monospace;font-size:.62rem;color:#c05040;opacity:.5;margin:.15em 0;animation:cf .08s steps(2) infinite}
      @keyframes cf{0%{opacity:.6;transform:translateX(0)}50%{opacity:.2;transform:translateX(-2px)}100%{opacity:.7;transform:translateX(1px)}}
      .tv-sc.tv-off{background:#030306}
      .tv-oc{height:100%;display:flex;align-items:center;justify-content:center}
      .tv-od{width:3px;height:3px;background:#3a3a40;border-radius:50%;animation:od 1.5s ease forwards}
      @keyframes od{0%{width:200px;height:2px;background:#999;border-radius:0;opacity:1}20%{width:60px;height:2px;background:#666;border-radius:0;opacity:1}40%{width:5px;height:5px;background:#555;border-radius:50%;opacity:1}100%{width:3px;height:3px;background:#222;border-radius:50%;opacity:0}}
      .tv-sc.tv-gx{animation:gs .08s steps(2) infinite}
      @keyframes gs{0%{transform:translate(0)}25%{transform:translate(-2px,1px)}50%{transform:translate(1px,-1px)}75%{transform:translate(-1px,2px)}100%{transform:translate(0)}}
      .tv-sc.tv-st::after{content:'';position:absolute;inset:0;z-index:6;pointer-events:none;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E");opacity:.5;animation:sa .05s steps(4) infinite;mix-blend-mode:overlay}
      @keyframes sa{0%{transform:translate(0,0)}25%{transform:translate(-5%,-3%)}50%{transform:translate(3%,5%)}75%{transform:translate(-3%,-5%)}100%{transform:translate(5%,3%)}}
      .tv-bt{display:flex;align-items:center;justify-content:space-between;padding:.3rem .5rem .1rem}
      .tv-br{font-family:'Share Tech Mono',monospace;font-size:.42rem;letter-spacing:.5em;color:#2a2a30}
      .tv-led{width:5px;height:5px;border-radius:50%;background:#1a1a1e;transition:all .3s}
      .tv-led.on{background:#8a4030;box-shadow:0 0 5px rgba(138,64,48,.4)}

      /* TV text block */
      .tvb{font-family:'Share Tech Mono',monospace;font-size:.63rem;line-height:1.75;color:#b0aca5;text-align:center;animation:bi .5s;width:100%}
      @keyframes bi{from{opacity:0}to{opacity:1}}
      .tvl{margin:.01em 0;min-height:.6em}
      .tvw{color:#c05040;text-shadow:0 0 8px rgba(192,80,64,.2)}

      /* Radio - compact */
      .rad{width:100%;max-width:400px;background:#0c0c12;border:1px solid rgba(255,255,255,.04);border-radius:4px;padding:.5rem .6rem;margin-top:.4rem;transition:all .3s}
      .rad-top{display:flex;align-items:center;justify-content:space-between}
      .rad-fa{display:flex;align-items:center;gap:.4em}
      .rad-led{width:5px;height:5px;border-radius:50%;background:#1a1a1e;transition:all .5s}
      .rad-led.on{background:#4a8a4a;box-shadow:0 0 6px rgba(74,138,74,.4)}
      .rad-ft{font-family:'Share Tech Mono',monospace;font-size:.58rem;color:#3a5a3a;letter-spacing:.15em;transition:color .3s}
      .rad-on .rad-ft{color:#5a8a5a}
      .rad-lb{font-family:'Share Tech Mono',monospace;font-size:.42rem;color:#2a2a30;letter-spacing:.4em}
      .rad-dial{display:flex;align-items:center;justify-content:center;gap:.25rem;margin:.4rem 0 .2rem}
      .db{background:#0e0e14;border:1px solid rgba(255,255,255,.08);color:#5a8a5a;font-family:'Share Tech Mono',monospace;font-size:.6rem;padding:.25em .45em;cursor:pointer;transition:all .2s;border-radius:2px}
      .db:hover{border-color:rgba(106,170,106,.3);color:#8acc8a}
      .db:active{transform:scale(.95)}
      .df{font-family:'Share Tech Mono',monospace;font-size:.6rem;color:#4a6a4a;min-width:3em;text-align:center}
      .rad-msg{min-height:1.4rem;margin-top:.3rem}
      .rm{display:flex;align-items:flex-start;gap:.3em;font-size:.68rem;line-height:1.6;animation:mi .4s}
      @keyframes mi{from{opacity:0}to{opacity:1}}
      .rm-dot{width:5px;height:5px;border-radius:50%;flex-shrink:0;margin-top:.35em;animation:bp 1.5s ease infinite}
      @keyframes bp{0%,100%{opacity:1}50%{opacity:.3}}
      .rm-dot.real{background:#4a8a4a;box-shadow:0 0 4px rgba(74,138,74,.4)}
      .rm-dot.fake{background:#8a6a3a;box-shadow:0 0 4px rgba(138,106,58,.4)}
      .rm-txt{color:#8aaa8a;font-weight:300}
      .rm-fake .rm-txt{color:#aa8a6a}
      .rm-no{font-family:'Share Tech Mono',monospace;font-size:.58rem;color:#2a2a30;text-align:center}
      .rm-off{font-family:'Share Tech Mono',monospace;font-size:.55rem;color:#1e1e24;text-align:center;letter-spacing:.3em}

      /* Dial confirm */
      .dial-confirm{text-align:center;margin-top:.3rem}
      .dial-confirm-btn{background:#0e0e14;border:1px solid rgba(74,138,74,.2);color:#5a8a5a;font-family:'Noto Sans KR',sans-serif;font-size:.68rem;font-weight:300;padding:.4em 1.5em;cursor:pointer;transition:all .3s;border-radius:2px}
      .dial-confirm-btn:hover{border-color:rgba(74,138,74,.4);color:#8aaa8a}

      /* Below */
      .bel{width:100%;max-width:400px;flex:1;display:flex;flex-direction:column;position:relative;z-index:60;min-height:0;padding:.3rem 0 .6rem}
      .narr-wrap{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;min-height:0}
      .narr{font-size:.78rem;line-height:1.85;color:#a09a92;font-weight:300;padding:.1rem 0}
      .nl{margin:.08em 0;min-height:.8em}
      .ns{color:#7a7a72;font-style:italic}
      .nc{color:#8a4030;animation:cb .7s steps(1) infinite}
      @keyframes cb{0%,49%{opacity:1}50%,100%{opacity:0}}
      .ch{display:flex;flex-direction:column;gap:.35rem;padding:.3rem 0;animation:ci .5s;flex-shrink:0}
      @keyframes ci{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
      .cb2{background:#12121a;border:1px solid rgba(255,255,255,.12);color:#c0b8ae;font-family:'Noto Sans KR',sans-serif;font-size:.8rem;font-weight:300;padding:.7em 1em;text-align:center;cursor:pointer;transition:all .3s}
      .cb2:hover{background:#1a1a24;border-color:rgba(150,120,80,.4);color:#e0d8ce}
      .sb{background:transparent;border:1px solid rgba(255,255,255,.1);color:#706b65;font-family:'Noto Sans KR',sans-serif;font-size:.7rem;font-weight:300;padding:.5em 2em;cursor:pointer;letter-spacing:.15em;transition:all .4s}
      .sb:hover{border-color:rgba(150,120,80,.3);color:#b0a898}
      .start-area{width:100%;max-width:400px;flex:1;display:flex;align-items:center;justify-content:center}

      /* Death */
      .dov{position:fixed;inset:0;background:rgba(5,5,5,.95);display:flex;align-items:center;justify-content:center;z-index:100;animation:di 2s}
      @keyframes di{from{opacity:0}to{opacity:1}}
      .din{text-align:center;padding:2rem;max-width:380px}
      .dt{font-size:.82rem;color:#8a3030;letter-spacing:.08em;line-height:2;margin-bottom:1.5rem}
      .dr{background:transparent;border:1px solid #3a3030;color:#6a5050;font-family:'Noto Sans KR',sans-serif;font-size:.68rem;padding:.5em 1.8em;cursor:pointer;transition:all .3s}
      .dr:hover{border-color:#6a4040;color:#a07070}
    `}</style>
    <div className="g">
      <div className="bo" style={{background:`rgba(0,0,0,${bv})`}}/>

      <TV power={tvOn} header={tvOn?tvH:null} gH={tvGH} gB={tvGB} st={tvSt}>
        <TVBlock lines={tvC}/>
      </TV>

      <Radio on={radOn} freq={freq} onFreqChange={setFreq} message={radMsg} msgType={radType}/>

      {showDial&&radOn&&!hasRadio.current&&(
        <div className="dial-confirm">
          <button className="dial-confirm-btn" onClick={()=>{onRadioTuned();if(hasRadio.current){startP3();}}}>수신 확인</button>
        </div>
      )}

      {showStart&&<div className="start-area"><button className="sb" onClick={startGame}>수신 확인</button></div>}

      <div className="bel">
        <div className="narr-wrap">
          {narr&&<Narr key={JSON.stringify(narr)} lines={narr}/>}
        </div>
        {choices&&<div className="ch">{choices.map((c,i)=><button key={i} className="cb2" onClick={()=>pick(c.action)}>{c.text}</button>)}</div>}
      </div>

      {phase==="death"&&(
        <div className="dov"><div className="din">
          <div className="dt">{narr&&<Narr key="d" lines={narr} speed={35}/>}</div>
          <button className="dr" onClick={()=>window.location.reload()}>다시 시작</button>
        </div></div>
      )}
    </div>
  </>);
}
