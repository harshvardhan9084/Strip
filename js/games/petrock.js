/**
 * Pet Rock — a joke on every idle/colony game in this deck. It has stats,
 * a name, a "mood," and literally nothing you do changes anything. The
 * rock is content. It has always been content. This is the point.
 */
Strip.register({
  id: "petrock",
  label: "ODDBALL",
  title: "Pet Rock",
  tag: "🪨",
  hint: "Care for your rock. It needs nothing.",
  async mount(container, api){
    const state = (await api.load()) || { name: "Rocky", pets: 0, adoptedAt: Date.now() };

    const wrap = document.createElement("div");
    wrap.style.cssText = "display:flex; flex-direction:column; align-items:center; gap:14px; width:100%; max-width:280px;";

    const statRow = document.createElement("div");
    statRow.style.cssText = "display:flex; gap:16px; font-family:var(--font-display); font-size:8px; color:var(--ink-dim); text-align:center;";
    const daysOwned = Math.max(0, Math.floor((Date.now() - state.adoptedAt) / (1000*60*60*24)));
    statRow.innerHTML = `
      <div>MOOD<br><span style="color:#6FCF97; font-size:12px;">Content</span></div>
      <div>HUNGER<br><span style="color:#6FCF97; font-size:12px;">None</span></div>
      <div>DAYS OWNED<br><span style="color:var(--ink); font-size:12px;">${daysOwned}</span></div>
    `;
    wrap.appendChild(statRow);

    const rockStage = document.createElement("div");
    rockStage.style.cssText = "width:160px; height:160px; display:flex; align-items:center; justify-content:center; cursor:pointer;";
    rockStage.innerHTML = `
      <svg viewBox="0 0 160 160" width="140" height="140">
        <ellipse cx="80" cy="100" rx="60" ry="42" fill="#5a5a52"/>
        <ellipse cx="65" cy="85" rx="20" ry="12" fill="#6e6e64" opacity="0.6"/>
        <ellipse cx="55" cy="105" rx="6" ry="6" fill="#3a3a34"/>
        <ellipse cx="95" cy="105" rx="6" ry="6" fill="#3a3a34"/>
        <path d="M60,125 Q80,133 100,125" stroke="#3a3a34" stroke-width="3" fill="none" stroke-linecap="round"/>
      </svg>
    `;

    const nameLabel = document.createElement("div");
    nameLabel.style.cssText = "font-size:15px; font-weight:700; color:var(--ink);";
    nameLabel.textContent = state.name;

    const thought = document.createElement("div");
    thought.style.cssText = "font-size:12px; color:var(--ink-dim); text-align:center; min-height:18px; font-style:italic;";
    const THOUGHTS = [
      "...", "The rock is thinking about nothing.", "The rock remains a rock.",
      "You cannot improve upon perfection.", "The rock does not need XP.",
      "There is no upgrade tree. There never was.", "The rock appreciates you, in its way.",
      "Geologically speaking, this is a good day.",
    ];

    const renameBtn = document.createElement("button");
    renameBtn.className = "btn";
    renameBtn.textContent = "Rename";
    renameBtn.style.fontSize = "11px";

    const petCounter = document.createElement("div");
    petCounter.style.cssText = "font-family:var(--font-display); font-size:8px; color:var(--ink-dim);";
    petCounter.textContent = `TIMES PET: ${state.pets}`;

    wrap.appendChild(rockStage);
    wrap.appendChild(nameLabel);
    wrap.appendChild(thought);
    wrap.appendChild(petCounter);
    wrap.appendChild(renameBtn);
    container.appendChild(wrap);

    rockStage.addEventListener("click", () => {
      state.pets++;
      Feedback.tone("select"); Feedback.haptic("light");
      petCounter.textContent = `TIMES PET: ${state.pets}`;
      thought.textContent = THOUGHTS[Math.floor(Math.random()*THOUGHTS.length)];
      api.save(state);
      rockStage.style.transform = "rotate(-3deg)";
      setTimeout(() => rockStage.style.transform = "none", 150);
    });

    renameBtn.addEventListener("click", () => {
      const n = prompt("Name your rock:", state.name);
      if(n && n.trim()){
        state.name = n.trim().slice(0, 20);
        nameLabel.textContent = state.name;
        api.save(state);
      }
    });
  }
});
