Strip.register({
  id: "thebutton",
  label: "ODDBALL",
  title: "The Button",
  tag: "⚠️",
  hint: "Do not press the button. Or do.",
  async mount(container, api){
    const state = (await api.load()) || { presses: 0, timeline: "Prime" };

    const OUTCOMES = [
      { text: "Nothing happened. Or did it?", timeline: null },
      { text: "You hear a distant sound, like a door closing in another universe.", timeline: null },
      { text: "The button felt slightly warm. That's new.", timeline: null },
      { text: "A butterfly somewhere did not flap its wings, on schedule.", timeline: null },
      { text: "Timeline shifted by 0.003 degrees. Unnoticeable. Probably fine.", timeline: "Prime-B" },
      { text: "You are now in a timeline where this button is blue. You can't tell.", timeline: "Azure" },
      { text: "Somewhere, a coin that would have landed heads lands tails instead.", timeline: null },
      { text: "The button remembers every press. It is judging you, quietly.", timeline: null },
      { text: "Congratulations, you've made a decision. The universe notes it and moves on.", timeline: null },
      { text: "A small ripple. In another timeline, you didn't press it. That version is fine too.", timeline: "Prime-C" },
      { text: "The button clicks with unusual finality this time.", timeline: null },
      { text: "You feel a profound sense of having done... something.", timeline: null },
    ];

    const wrap = document.createElement("div");
    wrap.style.cssText = "display:flex; flex-direction:column; align-items:center; gap:16px; width:100%; max-width:280px;";

    const timelineTag = document.createElement("div");
    timelineTag.style.cssText = "font-family:var(--font-display); font-size:8px; color:var(--ink-dim);";
    timelineTag.textContent = `CURRENT TIMELINE: ${state.timeline}`;

    const btn = document.createElement("button");
    btn.style.cssText = `
      width:130px; height:130px; border-radius:50%; border:6px solid #3a1518;
      background:radial-gradient(circle at 35% 30%, var(--danger), #8B2E42 80%);
      box-shadow:0 10px 30px rgba(232,99,127,.4), inset 0 4px 10px rgba(255,255,255,.15);
      color:#fff; font-family:var(--font-display); font-size:11px; cursor:pointer;
    `;
    btn.textContent = "PRESS";

    const outcome = document.createElement("div");
    outcome.style.cssText = "font-size:13px; text-align:center; min-height:44px; color:var(--ink);";

    const counter = document.createElement("div");
    counter.style.cssText = "font-family:var(--font-display); font-size:8px; color:var(--ink-dim);";
    counter.textContent = `PRESSES: ${state.presses}`;

    wrap.appendChild(timelineTag);
    wrap.appendChild(btn);
    wrap.appendChild(outcome);
    wrap.appendChild(counter);
    container.appendChild(wrap);

    btn.addEventListener("click", () => {
      state.presses++;
      const result = OUTCOMES[Math.floor(Math.random()*OUTCOMES.length)];
      if(result.timeline) state.timeline = result.timeline;
      outcome.textContent = result.text;
      timelineTag.textContent = `CURRENT TIMELINE: ${state.timeline}`;
      counter.textContent = `PRESSES: ${state.presses}`;
      api.save(state);

      btn.style.transform = "scale(0.9)";
      setTimeout(() => btn.style.transform = "none", 150);
      Feedback.haptic([10,30,10]);
      Feedback.tone("toggle");
    });
  }
});
