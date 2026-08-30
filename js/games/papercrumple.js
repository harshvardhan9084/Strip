Strip.register({
  id: "papercrumple",
  label: "FIDGET",
  title: "Crumple Paper",
  tag: "📄",
  hint: "Tap repeatedly to crumple, then toss it",
  mount(container, api){
    const wrap = document.createElement("div");
    wrap.style.cssText = "display:flex; flex-direction:column; align-items:center; gap:16px;";

    const stage = document.createElement("div");
    stage.style.cssText = "width:180px; height:220px; display:flex; align-items:center; justify-content:center; position:relative;";

    const paper = document.createElement("div");
    paper.style.cssText = `
      width:140px; height:180px; background:#EDEAE3; border-radius:4px;
      box-shadow:0 8px 24px rgba(0,0,0,.4); cursor:pointer;
      transition:transform .15s ease, border-radius .15s ease, width .15s ease, height .15s ease;
      display:flex; align-items:center; justify-content:center;
    `;

    const label = document.createElement("div");
    label.style.cssText = "font-family:var(--font-display); font-size:9px; color:var(--ink-dim);";
    label.textContent = "TAP TO CRUMPLE";

    stage.appendChild(paper);
    wrap.appendChild(stage);
    wrap.appendChild(label);

    const tossBtn = document.createElement("button");
    tossBtn.className = "btn accent";
    tossBtn.textContent = "Toss it";
    tossBtn.style.display = "none";
    wrap.appendChild(tossBtn);

    const resetBtn = document.createElement("button");
    resetBtn.className = "btn";
    resetBtn.textContent = "New sheet";
    resetBtn.style.display = "none";
    wrap.appendChild(resetBtn);

    container.appendChild(wrap);

    let crumples = 0;
    const MAX_CRUMPLES = 8;

    function applyCrumple(){
      const shrink = 1 - crumples * 0.06;
      const rot = (Math.sin(crumples*2.3) * 20);
      paper.style.width = (140*shrink) + "px";
      paper.style.height = (180*shrink) + "px";
      paper.style.borderRadius = (crumples*4) + "px";
      paper.style.transform = `rotate(${rot}deg) scale(${1 - crumples*0.02})`;
      paper.style.background = `linear-gradient(${crumples*40}deg, #EDEAE3, #C9C4B5 ${crumples*10}%, #EDEAE3)`;

      if(crumples >= MAX_CRUMPLES){
        label.textContent = "CRUMPLED — ready to toss";
        tossBtn.style.display = "inline-block";
      } else {
        label.textContent = `CRUMPLING… ${crumples}/${MAX_CRUMPLES}`;
      }
    }

    paper.addEventListener("click", () => {
      if(crumples >= MAX_CRUMPLES) return;
      crumples++;
      Feedback.haptic("light");
      Feedback.tone("tap");
      applyCrumple();
    });

    tossBtn.addEventListener("click", () => {
      paper.style.transition = "transform .5s ease, opacity .5s ease";
      paper.style.transform = "translateY(-160px) rotate(720deg) scale(0.3)";
      paper.style.opacity = "0";
      tossBtn.style.display = "none";
      label.textContent = "Nice toss";
      resetBtn.style.display = "inline-block";
    });

    resetBtn.addEventListener("click", () => {
      crumples = 0;
      paper.style.transition = "none";
      paper.style.width = "140px";
      paper.style.height = "180px";
      paper.style.borderRadius = "4px";
      paper.style.transform = "none";
      paper.style.opacity = "1";
      paper.style.background = "#EDEAE3";
      requestAnimationFrame(() => {
        paper.style.transition = "transform .15s ease, border-radius .15s ease, width .15s ease, height .15s ease";
      });
      label.textContent = "TAP TO CRUMPLE";
      resetBtn.style.display = "none";
    });
  }
});
