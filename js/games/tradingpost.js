/**
 * Trading Post — resource-allocation strategy sim.
 * Distinct from Ant Colony (production/defense tradeoff) and Garden (decay/neglect):
 * this one is about PORTFOLIO ALLOCATION under a fluctuating market. Three goods
 * with independently drifting prices; you buy low, sell high, and reinvest in
 * warehouses that raise your storage cap. The "strategic feeling" comes from
 * price cycles you can learn to read, not just idle accrual.
 */
Strip.register({
  id: "tradingpost",
  label: "COLONY",
  title: "Trading Post",
  tag: "strategy",
  hint: "Buy low, sell high, expand storage",
  async mount(container, api){
    const GOODS = [
      { key: "grain", icon: "🌾", basePrice: 4 },
      { key: "cloth", icon: "🧵", basePrice: 9 },
      { key: "gems",  icon: "💎", basePrice: 22 },
    ];

    const DEFAULT = {
      gold: 100,
      cap: 40,
      stock: { grain: 0, cloth: 0, gems: 0 },
      prices: { grain: 4, cloth: 9, gems: 22 },
      phase: { grain: Math.random()*Math.PI*2, cloth: Math.random()*Math.PI*2, gems: Math.random()*Math.PI*2 },
      lastSeen: Date.now(),
    };
    const saved = await api.load();
    const state = saved ? Object.assign({}, DEFAULT, saved, {
      stock: Object.assign({}, DEFAULT.stock, saved.stock),
      prices: Object.assign({}, DEFAULT.prices, saved.prices),
      phase: Object.assign({}, DEFAULT.phase, saved.phase),
    }) : DEFAULT;
    let best = await api.getHighscore(); // best = peak net worth ever

    // advance price cycles for elapsed offline time so returning feels alive, capped
    const elapsedSec = Math.min(3600*8, Math.max(0, (Date.now() - state.lastSeen)/1000));
    GOODS.forEach(g => { state.phase[g.key] += elapsedSec * 0.01; });
    updatePrices();

    function updatePrices(){
      GOODS.forEach(g => {
        // sine-wave price cycle + small noise, floored so it never hits 0
        const wave = Math.sin(state.phase[g.key]) * 0.4 + Math.sin(state.phase[g.key]*2.3) * 0.15;
        state.prices[g.key] = Math.max(1, Math.round(g.basePrice * (1 + wave)));
      });
    }

    function netWorth(){
      return Math.round(state.gold + GOODS.reduce((sum,g) => sum + state.stock[g.key]*state.prices[g.key], 0));
    }
    function totalStock(){
      return GOODS.reduce((s,g) => s + state.stock[g.key], 0);
    }

    const wrap = document.createElement("div");
    wrap.style.cssText = "display:flex; flex-direction:column; align-items:center; gap:10px; width:100%; max-width:300px;";

    const statRow = document.createElement("div");
    statRow.style.cssText = "display:flex; gap:14px; font-family:var(--font-display); font-size:8px; color:var(--ink-dim); text-align:center;";
    wrap.appendChild(statRow);

    const goodsWrap = document.createElement("div");
    goodsWrap.style.cssText = "display:flex; flex-direction:column; gap:6px; width:100%;";
    wrap.appendChild(goodsWrap);

    const expandBtn = document.createElement("button");
    expandBtn.className = "btn purple";
    wrap.appendChild(expandBtn);

    container.appendChild(wrap);

    function fmt(n){
      if(n >= 1e6) return (n/1e6).toFixed(2)+"M";
      if(n >= 1e3) return (n/1e3).toFixed(1)+"k";
      return Math.floor(n).toString();
    }

    function goodRow(g){
      const row = document.createElement("div");
      row.style.cssText = "display:flex; align-items:center; gap:8px; background:var(--panel-2); border:1px solid var(--line); border-radius:12px; padding:8px 10px;";

      const info = document.createElement("div");
      info.style.cssText = "flex:1; font-size:11px;";
      info.innerHTML = `${g.icon} <b class="own">0</b> owned<br><span class="price" style="color:var(--amber); font-family:var(--font-display); font-size:9px;">0g each</span>`;

      const buyBtn = document.createElement("button");
      buyBtn.className = "btn";
      buyBtn.textContent = "Buy";
      buyBtn.style.cssText = "padding:6px 10px; font-size:12px;";
      buyBtn.addEventListener("click", () => trade(g.key, 1));

      const sellBtn = document.createElement("button");
      sellBtn.className = "btn accent";
      sellBtn.textContent = "Sell";
      sellBtn.style.cssText = "padding:6px 10px; font-size:12px;";
      sellBtn.addEventListener("click", () => trade(g.key, -1));

      row.appendChild(info);
      row.appendChild(buyBtn);
      row.appendChild(sellBtn);
      goodsWrap.appendChild(row);
      return { row, info, buyBtn, sellBtn };
    }

    const rows = Object.fromEntries(GOODS.map(g => [g.key, goodRow(g)]));

    function trade(key, dir){
      const price = state.prices[key];
      if(dir > 0){
        if(state.gold < price) return;
        if(totalStock() >= state.cap) return;
        Feedback.tone("swap"); Feedback.haptic("light");
        state.gold -= price;
        state.stock[key]++;
      } else {
        if(state.stock[key] <= 0) return;
        Feedback.tone("select"); Feedback.haptic("light");
        state.gold += price;
        state.stock[key]--;
      }
      persist();
      render();
    }

    function render(){
      updatePrices();
      const worth = netWorth();
      statRow.innerHTML = `
        <div>GOLD<br><span style="color:var(--amber); font-size:13px;">${fmt(state.gold)}</span></div>
        <div>STORAGE<br><span style="color:var(--ink); font-size:13px;">${totalStock()}/${state.cap}</span></div>
        <div>NET WORTH<br><span style="color:var(--purple); font-size:13px;">${fmt(worth)}</span></div>
        <div>PEAK<br><span style="color:var(--ink-dim); font-size:13px;">${fmt(best)}</span></div>
      `;
      GOODS.forEach(g => {
        const r = rows[g.key];
        r.info.querySelector(".own").textContent = state.stock[g.key];
        r.info.querySelector(".price").textContent = `${state.prices[g.key]}g each`;
        r.buyBtn.disabled = state.gold < state.prices[g.key] || totalStock() >= state.cap;
        r.sellBtn.disabled = state.stock[g.key] <= 0;
        r.buyBtn.style.opacity = r.buyBtn.disabled ? 0.4 : 1;
        r.sellBtn.style.opacity = r.sellBtn.disabled ? 0.4 : 1;
      });
      const expandCost = Math.round(30 * Math.pow(1.5, (state.cap-40)/20));
      expandBtn.textContent = `Expand storage +20 (${expandCost}g)`;
      expandBtn.disabled = state.gold < expandCost;
      expandBtn.style.opacity = expandBtn.disabled ? 0.5 : 1;

      if(worth > best){
        best = worth;
        api.setHighscore(best);
      }
    }

    expandBtn.addEventListener("click", () => {
      const expandCost = Math.round(30 * Math.pow(1.5, (state.cap-40)/20));
      if(state.gold < expandCost) return;
      Feedback.tone("place"); Feedback.haptic("medium");
      state.gold -= expandCost;
      state.cap += 20;
      persist();
      render();
    });

    function persist(){
      state.lastSeen = Date.now();
      api.save(state);
    }

    // prices drift live, slowly, so watching the strip for a bit has payoff
    const driftInterval = setInterval(() => {
      GOODS.forEach(g => { state.phase[g.key] += 0.015; });
      render();
    }, 1000);
    const autosave = setInterval(persist, 8000);

    render();

    return () => {
      clearInterval(driftInterval);
      clearInterval(autosave);
      persist();
    };
  }
});
