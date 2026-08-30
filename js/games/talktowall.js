Strip.register({
  id: "talktowall",
  label: "ODDBALL",
  title: "Talk to a Wall",
  tag: "🧱",
  hint: "Say anything. It will not help.",
  async mount(container, api){
    const state = (await api.load()) || { convos: 0 };
    const RESPONSES = [
      "The wall remains silent.",
      "A faint echo returns your own words, slightly sadder.",
      "The wall has heard this before, from someone else, years ago.",
      "Somewhere, a brick shifts almost imperceptibly. That's it. That's the response.",
      "The wall is not listening. The wall was never listening.",
      "You feel slightly better for reasons you can't explain.",
      "The wall absorbs your words into its plaster, forever.",
      "Nothing happens. This is, weirdly, exactly what you needed.",
      "The wall creaks. In wall-language, this means 'go on.'",
      "A single flake of paint falls. You choose to see this as agreement.",
      "The wall has infinite patience and zero opinions. Rare combination.",
      "You've now told the wall more than you've told most people this week.",
      "The wall neither judges nor cares. It simply exists, load-bearing.",
    ];

    const wrap = document.createElement("div");
    wrap.style.cssText = "display:flex; flex-direction:column; align-items:center; gap:14px; width:100%; max-width:280px;";

    const wallVisual = document.createElement("div");
    wallVisual.style.cssText = `
      width:100%; height:90px; border-radius:10px;
      background:repeating-linear-gradient(0deg, #3a3a44 0px, #3a3a44 14px, #2c2c34 14px, #2c2c34 16px),
                 repeating-linear-gradient(90deg, transparent 0px, transparent 38px, #22222a 38px, #22222a 40px);
      box-shadow:inset 0 4px 14px rgba(0,0,0,.4);
    `;

    const responseBox = document.createElement("div");
    responseBox.style.cssText = "font-size:13px; color:var(--ink-dim); text-align:center; min-height:40px; font-style:italic; padding:0 8px;";
    responseBox.textContent = "The wall waits.";

    const inputRow = document.createElement("div");
    inputRow.style.cssText = "display:flex; gap:8px; width:100%;";
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Type something to the wall…";
    input.style.cssText = "flex:1; padding:10px 12px; border-radius:10px; border:1px solid var(--line); background:var(--panel-2); color:var(--ink); font-size:13px;";
    const sendBtn = document.createElement("button");
    sendBtn.className = "btn accent";
    sendBtn.textContent = "Say it";
    inputRow.appendChild(input);
    inputRow.appendChild(sendBtn);

    const counter = document.createElement("div");
    counter.style.cssText = "font-family:var(--font-display); font-size:8px; color:var(--ink-dim);";
    counter.textContent = `CONVERSATIONS WITH THE WALL: ${state.convos}`;

    wrap.appendChild(wallVisual);
    wrap.appendChild(responseBox);
    wrap.appendChild(inputRow);
    wrap.appendChild(counter);
    container.appendChild(wrap);

    function respond(){
      if(!input.value.trim()) return;
      Feedback.tone("toggle"); Feedback.haptic("light");
      state.convos++;
      api.save(state);
      counter.textContent = `CONVERSATIONS WITH THE WALL: ${state.convos}`;
      responseBox.style.opacity = 0;
      setTimeout(() => {
        responseBox.textContent = RESPONSES[Math.floor(Math.random()*RESPONSES.length)];
        responseBox.style.opacity = 1;
      }, 300);
      input.value = "";
      wallVisual.style.transform = "translateX(2px)";
      setTimeout(() => wallVisual.style.transform = "none", 100);
    }

    responseBox.style.transition = "opacity .3s ease";
    sendBtn.addEventListener("click", respond);
    input.addEventListener("keydown", (e) => { if(e.key === "Enter") respond(); });
  }
});
