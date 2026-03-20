import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════
   VHS 오버레이 프로토타입
   TV 화면 위에 canvas를 덮어서 아날로그 효과
   - 트래킹 라인 (굵은 줄이 위→아래 흘러감)
   - 수평 동기 어긋남 (일부 줄이 가로로 밀림)
   - VHS 노이즈
   - 스캔라인
   - 롤링 (화면이 위로 흘러감)
   - 밝기 불안정
   - 색 번짐 (chromatic aberration)
   ═══════════════════════════════════════════ */

function VHSOverlay({ width, height, effects }) {
  const canvasRef = useRef(null);
  const frameRef = useRef(0);
  const rafRef = useRef(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    const frame = frameRef.current++;

    ctx.clearRect(0, 0, w, h);

    // ── Tracking line (굵은 가로줄이 위→아래 천천히 흘러감) ──
    if (effects.tracking) {
      const lineY = (frame * 1.2) % (h + 60) - 30;
      const lineH = 25 + Math.sin(frame * 0.02) * 10;
      const grad = ctx.createLinearGradient(0, lineY - lineH, 0, lineY + lineH);
      grad.addColorStop(0, "rgba(255,255,255,0)");
      grad.addColorStop(0.3, "rgba(255,255,255,0.06)");
      grad.addColorStop(0.5, "rgba(255,255,255,0.12)");
      grad.addColorStop(0.7, "rgba(255,255,255,0.06)");
      grad.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, lineY - lineH, w, lineH * 2);
    }

    // ── Horizontal sync distortion (수평 동기 어긋남) ──
    if (effects.hsync) {
      const distortY = (frame * 2.5 + 100) % h;
      const distortH = 3 + Math.random() * 5;
      const shift = (Math.random() - 0.5) * 15;
      ctx.save();
      // Fake horizontal shift by drawing semi-transparent bars
      ctx.fillStyle = `rgba(0,0,0,0.3)`;
      ctx.fillRect(0, distortY, w, distortH);
      ctx.fillStyle = `rgba(180,180,180,0.05)`;
      ctx.fillRect(shift > 0 ? 0 : w + shift, distortY, Math.abs(shift), distortH);
      ctx.restore();

      // Additional random jitter lines
      if (Math.random() < 0.3) {
        const jy = Math.random() * h;
        const jh = 1 + Math.random() * 2;
        ctx.fillStyle = `rgba(255,255,255,${0.02 + Math.random() * 0.04})`;
        ctx.fillRect(0, jy, w, jh);
      }
    }

    // ── VHS noise (노이즈 가로줄들) ──
    if (effects.noise) {
      for (let i = 0; i < 8; i++) {
        const ny = Math.random() * h;
        const nw = 30 + Math.random() * (w * 0.6);
        const nx = Math.random() * (w - nw);
        const nh = 1;
        ctx.fillStyle = `rgba(255,255,255,${0.01 + Math.random() * 0.04})`;
        ctx.fillRect(nx, ny, nw, nh);
      }
      // Occasional bright noise band
      if (Math.random() < 0.05) {
        const by = Math.random() * h;
        ctx.fillStyle = `rgba(255,255,255,${0.05 + Math.random() * 0.08})`;
        ctx.fillRect(0, by, w, 2 + Math.random() * 3);
      }
    }

    // ── Scanlines (가는 가로줄 반복) ──
    if (effects.scanlines) {
      ctx.fillStyle = "rgba(0,0,0,0.08)";
      for (let y = 0; y < h; y += 3) {
        ctx.fillRect(0, y, w, 1);
      }
    }

    // ── Rolling (화면이 위로 흘러가는 느낌의 밝기 밴드) ──
    if (effects.rolling) {
      const rollY = (frame * 0.8) % (h * 2) - h;
      const rollH = h * 0.3;
      const rollGrad = ctx.createLinearGradient(0, rollY, 0, rollY + rollH);
      rollGrad.addColorStop(0, "rgba(0,0,0,0)");
      rollGrad.addColorStop(0.5, "rgba(0,0,0,0.15)");
      rollGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = rollGrad;
      ctx.fillRect(0, rollY, w, rollH);
    }

    // ── Brightness instability (밝기 불안정) ──
    if (effects.brightness) {
      const bri = Math.sin(frame * 0.05) * 0.03 + (Math.random() - 0.5) * 0.02;
      if (bri > 0) {
        ctx.fillStyle = `rgba(255,255,255,${bri})`;
      } else {
        ctx.fillStyle = `rgba(0,0,0,${-bri})`;
      }
      ctx.fillRect(0, 0, w, h);
    }

    // ── Color bleed / chromatic aberration (색 번짐) ──
    if (effects.colorBleed) {
      const offset = 2 + Math.sin(frame * 0.03) * 1;
      ctx.globalCompositeOperation = "screen";
      ctx.fillStyle = `rgba(255,0,0,0.03)`;
      ctx.fillRect(offset, 0, w, h);
      ctx.fillStyle = `rgba(0,0,255,0.03)`;
      ctx.fillRect(-offset, 0, w, h);
      ctx.globalCompositeOperation = "source-over";
    }

    // ── Bottom distortion band (하단 왜곡 — VHS 테이프 끝부분 느낌) ──
    if (effects.bottomBand) {
      const bandH = 15 + Math.sin(frame * 0.04) * 5;
      const bandY = h - bandH;
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.fillRect(0, bandY, w, bandH);
      // Noise in band
      for (let i = 0; i < 5; i++) {
        const ny = bandY + Math.random() * bandH;
        ctx.fillStyle = `rgba(255,255,255,${0.05 + Math.random() * 0.1})`;
        ctx.fillRect(0, ny, w, 1);
      }
    }

    // ── Flicker (전체 화면 깜빡임) ──
    if (effects.flicker) {
      if (Math.random() < 0.04) {
        ctx.fillStyle = `rgba(255,255,255,${0.03 + Math.random() * 0.05})`;
        ctx.fillRect(0, 0, w, h);
      }
      if (Math.random() < 0.02) {
        ctx.fillStyle = `rgba(0,0,0,${0.1 + Math.random() * 0.1})`;
        ctx.fillRect(0, 0, w, h);
      }
    }

    rafRef.current = requestAnimationFrame(draw);
  }, [effects]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(draw);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="vhs-canvas"
    />
  );
}

// ── TV ──
function TV({ children, header, effects }) {
  return (
    <div className="tv-outer">
      <div className="tv-bz">
        <div className="tv-sc">
          <div className="tv-sl-base" />
          <div className="tv-vg" />
          <VHSOverlay width={356} height={280} effects={effects} />
          <div className="tv-ct">
            <div className="tv-ha">
              {header && (
                <>
                  <div className="tv-h">{header}</div>
                  <div className="tv-hl" />
                </>
              )}
            </div>
            <div className="tv-bd">{children}</div>
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

const SAMPLE = [
  { text: "귀하의 안전을 위해" },
  { text: "반드시 실내에 머무르십시오." },
  { text: "" },
  { text: "절대 밤하늘을", warning: true },
  { text: "쳐다보지 마십시오.", warning: true },
  { text: "" },
  { text: "실내의 모든 창문을 닫고" },
  { text: "외부 빛을 차단하십시오." },
];

const VHS_EFFECTS = [
  { key: "tracking", name: "트래킹 라인", desc: "굵은 밝은 줄이 위→아래 천천히 흘러감" },
  { key: "hsync", name: "수평 동기 어긋남", desc: "화면 일부가 가로로 밀림" },
  { key: "noise", name: "VHS 노이즈", desc: "가로 노이즈 줄들" },
  { key: "scanlines", name: "스캔라인", desc: "가는 가로줄 반복" },
  { key: "rolling", name: "롤링", desc: "어두운 밴드가 위로 흘러감" },
  { key: "brightness", name: "밝기 불안정", desc: "화면이 밝아졌다 어두워졌다" },
  { key: "colorBleed", name: "색 번짐", desc: "빨강/파랑 윤곽 번짐" },
  { key: "bottomBand", name: "하단 왜곡", desc: "VHS 테이프 끝부분 느낌" },
  { key: "flicker", name: "깜빡임", desc: "불규칙한 밝기 플래시" },
];

export default function VHSProto() {
  const [effects, setEffects] = useState(
    Object.fromEntries(VHS_EFFECTS.map(e => [e.key, false]))
  );

  const toggle = (key) => setEffects(p => ({ ...p, [key]: !p[key] }));
  const allOn = () => setEffects(Object.fromEntries(VHS_EFFECTS.map(e => [e.key, true])));
  const allOff = () => setEffects(Object.fromEntries(VHS_EFFECTS.map(e => [e.key, false])));

  // Presets
  const presetClean = () => {
    allOff();
    setEffects(p => ({ ...p, scanlines: true, brightness: true }));
  };
  const presetWorn = () => {
    allOff();
    setEffects(p => ({ ...p, scanlines: true, brightness: true, tracking: true, noise: true, flicker: true }));
  };
  const presetBroken = () => {
    allOn();
  };

  return (<>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@200;300;400;500;700&family=Share+Tech+Mono&display=swap');
      *{box-sizing:border-box;margin:0;padding:0}
      .root{background:#06060a;min-height:100vh;display:flex;flex-direction:column;align-items:center;padding:1rem .8rem;font-family:'Noto Sans KR',sans-serif;color:#c0bbb5}
      .title{font-size:.7rem;color:#4a4540;letter-spacing:.2em;margin-bottom:1rem}

      .tv-outer{width:380px;margin-bottom:.8rem}
      .tv-bz{background:linear-gradient(180deg,#1e1e22,#161618);border:2px solid #2a2a30;border-radius:8px;padding:12px;box-shadow:0 4px 40px rgba(0,0,0,.7)}
      .tv-sc{position:relative;background:#08080c;border-radius:4px;width:100%;height:280px;overflow:hidden}
      .tv-sl-base{position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.04) 2px,rgba(0,0,0,.04) 4px);pointer-events:none;z-index:2}
      .tv-vg{position:absolute;inset:0;background:radial-gradient(ellipse at center,transparent 55%,rgba(0,0,0,.5) 100%);pointer-events:none;z-index:4}
      .vhs-canvas{position:absolute;inset:0;z-index:5;pointer-events:none;width:100%;height:100%}
      .tv-ct{position:relative;z-index:3;height:100%;display:flex;flex-direction:column;overflow:hidden}
      .tv-ha{flex-shrink:0;padding:.8rem 1.2rem 0;text-align:center;min-height:48px}
      .tv-h{font-family:'Share Tech Mono',monospace;font-size:.8rem;font-weight:500;color:#d0ccc5;letter-spacing:.25em;padding-bottom:.45rem}
      .tv-hl{height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.12),transparent);margin:0 .8rem}
      .tv-bd{flex:1;padding:.6rem 1.4rem .8rem;overflow:hidden;display:flex;flex-direction:column;justify-content:center}
      .tv-bt{display:flex;align-items:center;justify-content:space-between;padding:.4rem .6rem .2rem}
      .tv-br{font-family:'Share Tech Mono',monospace;font-size:.5rem;letter-spacing:.5em;color:#2a2a30}
      .tv-led{width:5px;height:5px;border-radius:50%;background:#1a1a1e}
      .tv-led.on{background:#8a4030;box-shadow:0 0 5px rgba(138,64,48,.4)}

      .tvb{font-family:'Share Tech Mono',monospace;font-size:.73rem;line-height:1.85;color:#b0aca5;text-align:center;width:100%}
      .tvl{margin:.02em 0;min-height:.6em}
      .tvw{color:#c05040;text-shadow:0 0 10px rgba(192,80,64,.25)}

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
      .preset-btns{display:flex;gap:.3rem;margin-top:.4rem}
      .p-btn{background:#12121a;border:1px solid rgba(255,255,255,.08);color:#8a8580;font-family:'Noto Sans KR',sans-serif;font-size:.6rem;font-weight:300;padding:.4em 1em;cursor:pointer;transition:all .2s;border-radius:2px}
      .p-btn:hover{border-color:rgba(150,120,80,.3);color:#c0b8ae}
    `}</style>

    <div className="root">
      <div className="title">VHS 오버레이 프로토타입</div>

      <TV header="대국민 위험 경보" effects={effects}>
        <div className="tvb">
          {SAMPLE.map((l, i) =>
            l.text === "" ? <p key={i} className="tvl">&nbsp;</p> :
            <p key={i} className={`tvl ${l.warning ? "tvw" : ""}`}>{l.text}</p>
          )}
        </div>
      </TV>

      <div className="controls">
        <div className="section">
          <div className="section-label">
            VHS 효과
            <div className="section-label-btns">
              <button className="mini-btn" onClick={allOn}>전체 ON</button>
              <button className="mini-btn" onClick={allOff}>전체 OFF</button>
            </div>
          </div>
          <div className="toggle-grid">
            {VHS_EFFECTS.map(e => (
              <button key={e.key} className={`toggle-btn ${effects[e.key] ? "on" : ""}`} onClick={() => toggle(e.key)} title={e.desc}>
                <span className="dot" />
                {e.name}
              </button>
            ))}
          </div>
          <div className="preset-btns">
            <button className="p-btn" onClick={presetClean}>프리셋: 정상</button>
            <button className="p-btn" onClick={presetWorn}>프리셋: 낡은 TV</button>
            <button className="p-btn" onClick={presetBroken}>프리셋: 고장</button>
          </div>
        </div>
      </div>
    </div>
  </>);
}
