Strip.register({
  id: "breakglass",
  label: "FIDGET",
  title: "Break Glass",
  tag: "🔨",
  hint: "Tap to crack, tap again to shatter",
  mount(container, api){
    const wrap = document.createElement("div");
    wrap.style.cssText = "display:flex; flex-direction:column; align-items:center; gap:14px;";

    const stageLabel = document.createElement("div");
    stageLabel.style.cssText = "font-family:var(--font-display); font-size:9px; color:var(--ink-dim);";

    const svgHolder = document.createElement("div");
    svgHolder.style.cssText = "width:min(70vw,240px); height:min(70vw,240px); cursor:pointer;";

    const resetBtn = document.createElement("button");
    resetBtn.className = "btn accent";
    resetBtn.textContent = "New pane";

    wrap.appendChild(stageLabel);
    wrap.appendChild(svgHolder);
    wrap.appendChild(resetBtn);
    container.appendChild(wrap);

    let hits = 0;
    const MAX_HITS = 5;

    function crackPath(seed){
      // generate a jagged line from center to a random edge point, deterministic per seed
      let x = 120, y = 120;
      let d = `M${x},${y}`;
      const angle = (seed * 137.5) % 360;
      const rad = angle * Math.PI/180;
      const steps = 5;
      for(let i=0;i<steps;i++){
        const dist = 20 + i*18;
        const jitter = (Math.sin(seed*i*3.1)) * 14;
        x = 120 + Math.cos(rad)*dist + jitter;
        y = 120 + Math.sin(rad)*dist + jitter;
        d += ` L${x.toFixed(1)},${y.toFixed(1)}`;
      }
      return d;
    }

    function render(){
      const cracks = [];
      for(let i=0;i<hits;i++){
        cracks.push(`<path d="${crackPath(i+1)}" stroke="rgba(255,255,255,0.55)" stroke-width="1.4" fill="none"/>`);
      }
      let shatterOverlay = "";
      if(hits >= MAX_HITS){
        // shatter into visible shard polygons
        const shards = [];
        for(let i=0;i<10;i++){
          const cx = 120 + (Math.random()-0.5)*180;
          const cy = 120 + (Math.random()-0.5)*180;
          const r = 14 + Math.random()*10;
          const pts = Array.from({length:5}, (_,k) => {
            const a = (k/5)*Math.PI*2 + Math.random();
            return `${(cx+Math.cos(a)*r).toFixed(1)},${(cy+Math.sin(a)*r).toFixed(1)}`;
          }).join(" ");
          shards.push(`<polygon points="${pts}" fill="rgba(180,210,230,0.12)" stroke="rgba(255,255,255,0.4)" stroke-width="1"/>`);
        }
        shatterOverlay = shards.join("");
      }

      svgHolder.innerHTML = `
        <svg viewBox="0 0 240 240" width="100%" height="100%">
          <rect x="4" y="4" width="232" height="232" rx="14" fill="rgba(140,180,210,0.08)" stroke="rgba(255,255,255,0.15)"/>
          ${cracks.join("")}
          ${shatterOverlay}
        </svg>
      `;
      stageLabel.textContent = hits >= MAX_HITS ? "SHATTERED" : `CRACKS ${hits}/${MAX_HITS}`;
    }

    function tap(){
      if(hits >= MAX_HITS) return;
      hits++;
      if(hits >= MAX_HITS){ Feedback.haptic([10,30,10]); Feedback.buzz("win"); }
      else { Feedback.haptic("light"); Feedback.tone("tap"); }
      render();
    }

    svgHolder.addEventListener("click", tap);
    resetBtn.addEventListener("click", () => { hits = 0; render(); });

    render();
  }
});
