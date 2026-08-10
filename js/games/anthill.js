Strip.register({
  id: "anthill",
  label: "COLONY",
  title: "Ant Hill",
  tag: "idle",
  hint: "Tap the hill to feed your colony",
  mount(container, api){
    const state = api.load() || { food: 0, ants: 1, lastSeen: Date.now() };

    // passive growth while away, capped so it's not exploitable/infinite-feeling
    const elapsedSec = Math.min(60*60*6, Math.max(0, (Date.now() - state.lastSeen) / 1000));
    const passiveGain = Math.floor(elapsedSec * state.ants * 0.02);
    state.food += passiveGain;

    const wrap = document.createElement("div");
    wrap.style.cssText = "display:flex; flex-direction:column; align-items:center; gap:16px; width:100%;";

    const statRow = document.createElement("div");
    statRow.style.cssText = "display:flex; gap:20px; font-family:var(--font-display); font-size:9px; color:var(--ink-dim); text-align:center;";
    statRow.innerHTML = `
      <div>FOOD<br><span id="ah-food" style="color:var(--amber); font-size:14px;">0</span></div>
      <div>ANTS<br><span id="ah-ants" style="color:var(--purple); font-size:14px;">1</span></div>
    `;

    const hillBtn = document.createElement("button");
    hillBtn.setAttribute("aria-label", "feed hill");
    hillBtn.style.cssText = `
      width:150px; height:150px; border-radius:50%; border:none; cursor:pointer;
      background:radial-gradient(circle at 40% 30%, #3a2f1e, #1a1510 75%);
      box-shadow:0 10px 30px rgba(0,0,0,.5), inset 0 4px 10px rgba(255,255,255,.06);
      font-size:44px; display:flex; align-items:center; justify-content:center;
      position:relative;
    `;
    hillBtn.textContent = "🐜";

    const popText = document.createElement("div");
    popText.style.cssText = "font-size:12px; color:var(--ink-dim); min-height:16px;";

    const upgradeBtn = document.createElement("button");
    upgradeBtn.className = "btn accent";
    upgradeBtn.textContent = "Recruit ant (10 food)";

    wrap.appendChild(statRow);
    wrap.appendChild(hillBtn);
    wrap.appendChild(popText);
    wrap.appendChild(upgradeBtn);
    container.appendChild(wrap);

    function refresh(){
      document.getElementById("ah-food").textContent = state.food;
      document.getElementById("ah-ants").textContent = state.ants;
      const cost = state.ants * 10;
      upgradeBtn.textContent = `Recruit ant (${cost} food)`;
      upgradeBtn.disabled = state.food < cost;
      upgradeBtn.style.opacity = state.food < cost ? .4 : 1;
    }

    if(passiveGain > 0){
      popText.textContent = `Your colony gathered ${passiveGain} food while you were away`;
    }

    hillBtn.addEventListener("click", (e) => {
      state.food += state.ants;
      api.save(state);
      refresh();
      spawnFloat(e);
      if(navigator.vibrate) navigator.vibrate(5);
    });

    upgradeBtn.addEventListener("click", () => {
      const cost = state.ants * 10;
      if(state.food < cost) return;
      state.food -= cost;
      state.ants += 1;
      api.save(state);
      refresh();
    });

    function spawnFloat(e){
      const f = document.createElement("div");
      f.textContent = `+${state.ants}`;
      f.style.cssText = `
        position:absolute; left:50%; top:20%; transform:translateX(-50%);
        color:var(--amber); font-weight:700; font-size:14px; pointer-events:none;
        animation:ah-float .6s ease forwards;
      `;
      hillBtn.appendChild(f);
      setTimeout(() => f.remove(), 650);
    }

    if(!document.getElementById("ah-keyframes")){
      const style = document.createElement("style");
      style.id = "ah-keyframes";
      style.textContent = `@keyframes ah-float{ from{opacity:1; transform:translate(-50%,0);} to{opacity:0; transform:translate(-50%,-30px);} }`;
      document.head.appendChild(style);
    }

    refresh();

    return () => {
      state.lastSeen = Date.now();
      api.save(state);
    };
  }
});
