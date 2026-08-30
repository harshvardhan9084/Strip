Strip.register({
  id: "bubblewrap",
  label: "FIDGET",
  title: "Bubble Wrap",
  tag: "∞",
  hint: "Pop them. All of them.",
  async mount(container, api){
    const saved = await api.load();
    const state = saved || { popped: 0 };
    const ROWS = 7, COLS = 5;

    const wrap = document.createElement("div");
    wrap.style.cssText = `
      display:grid; grid-template-columns:repeat(${COLS},1fr); gap:8px;
      width:100%; max-width:280px;
    `;

    const counter = document.createElement("div");
    counter.style.cssText = `
      position:absolute; top:8px; right:0; font-size:11px; color:var(--ink-dim);
    `;
    counter.textContent = `${state.popped} popped`;

    for(let i=0;i<ROWS*COLS;i++){
      const b = document.createElement("button");
      b.setAttribute("aria-label","pop");
      b.style.cssText = `
        aspect-ratio:1; border-radius:50%; border:none; cursor:pointer;
        background:radial-gradient(circle at 35% 30%, #2A2A38, #16161C 70%);
        box-shadow: inset 0 3px 4px rgba(255,255,255,.08), inset 0 -3px 6px rgba(0,0,0,.5);
        transition:transform .08s ease;
      `;
      b.addEventListener("click", () => {
        if(b.dataset.popped) return;
        b.dataset.popped = "1";
        b.style.background = "radial-gradient(circle at 35% 30%, #0d0d10, #08080a 70%)";
        b.style.boxShadow = "inset 0 4px 8px rgba(0,0,0,.7)";
        b.style.transform = "scale(.82)";
        state.popped++;
        counter.textContent = `${state.popped} popped`;
        api.save(state);
        Feedback.haptic("light");
        Feedback.tone("pop");
      });
      wrap.appendChild(b);
    }

    const holder = document.createElement("div");
    holder.style.cssText = "position:relative; display:flex; justify-content:center; width:100%;";
    holder.appendChild(wrap);
    holder.appendChild(counter);
    container.appendChild(holder);
  }
});
