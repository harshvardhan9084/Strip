Strip.register({
  id: "snake",
  label: "PUZZLE",
  title: "Snake",
  tag: "classic",
  hint: "Swipe to steer, eat the dots",
  async mount(container, api){
    let best = await api.getHighscore();
    const SIZE = 14;

    const wrap = document.createElement("div");
    wrap.style.cssText = "display:flex; flex-direction:column; align-items:center; gap:10px;";

    const statRow = document.createElement("div");
    statRow.style.cssText = "display:flex; gap:20px; font-family:var(--font-display); font-size:10px; color:var(--ink-dim);";
    statRow.innerHTML = `<div>SCORE <span id="sn-score" style="color:var(--amber)">0</span></div><div>BEST <span id="sn-best" style="color:var(--purple)">${best}</span></div>`;
    wrap.appendChild(statRow);

    const board = document.createElement("div");
    board.style.cssText = `display:grid; grid-template-columns:repeat(${SIZE},1fr); grid-template-rows:repeat(${SIZE},1fr); width:min(70vw,240px); height:min(70vw,240px); background:#12121a; border-radius:10px; touch-action:none;`;
    wrap.appendChild(board);

    const startBtn = document.createElement("button");
    startBtn.className = "btn accent";
    startBtn.textContent = "Start";
    wrap.appendChild(startBtn);

    container.appendChild(wrap);

    let cells = [];
    for(let i=0;i<SIZE*SIZE;i++){
      const c = document.createElement("div");
      board.appendChild(c);
      cells.push(c);
    }

    let snake, dir, nextDir, food, score, running, tickId;

    function idx(r,c){ return r*SIZE+c; }

    function newGame(){
      snake = [[7,7],[7,6],[7,5]];
      dir = [0,1]; nextDir = [0,1];
      placeFood();
      score = 0;
      running = true;
      document.getElementById("sn-score").textContent = 0;
      startBtn.disabled = true;
      startBtn.textContent = "Playing…";
      draw();
    }

    function placeFood(){
      let pos;
      do {
        pos = [Math.floor(Math.random()*SIZE), Math.floor(Math.random()*SIZE)];
      } while(snake.some(([r,c]) => r===pos[0] && c===pos[1]));
      food = pos;
    }

    function draw(){
      cells.forEach(c => { c.style.background = "transparent"; c.style.borderRadius = "0"; });
      snake.forEach(([r,c], i) => {
        cells[idx(r,c)].style.background = i===0 ? "var(--amber)" : "var(--purple)";
        cells[idx(r,c)].style.borderRadius = "3px";
      });
      cells[idx(food[0],food[1])].style.background = "var(--danger)";
      cells[idx(food[0],food[1])].style.borderRadius = "50%";
    }

    function step(){
      if(!running) return;
      dir = nextDir;
      const head = snake[0];
      const nr = head[0]+dir[0], nc = head[1]+dir[1];

      if(nr<0||nr>=SIZE||nc<0||nc>=SIZE || snake.some(([r,c])=>r===nr&&c===nc)){
        gameOver();
        return;
      }

      snake.unshift([nr,nc]);
      if(nr===food[0] && nc===food[1]){
        score++;
        Feedback.tone("pop"); Feedback.haptic("light");
        document.getElementById("sn-score").textContent = score;
        placeFood();
      } else {
        snake.pop();
      }
      draw();
    }

    function gameOver(){
      running = false;
      Feedback.buzz("lose");
      clearInterval(tickId);
      startBtn.disabled = false;
      startBtn.textContent = "Play again";
      api.setHighscore(score).then(v => {
        best = v;
        document.getElementById("sn-best").textContent = best;
      });
    }

    function setDir(dr,dc){
      // prevent instant U-turn into self
      if(dir[0] === -dr && dir[1] === -dc) return;
      nextDir = [dr,dc];
    }

    let sx=0, sy=0;
    function onStart(e){ const t = e.touches?e.touches[0]:e; sx=t.clientX; sy=t.clientY; }
    function onEnd(e){
      const t = e.changedTouches?e.changedTouches[0]:e;
      const dx = t.clientX-sx, dy = t.clientY-sy;
      if(Math.max(Math.abs(dx),Math.abs(dy)) < 16) return;
      if(Math.abs(dx) > Math.abs(dy)) setDir(0, dx>0?1:-1);
      else setDir(dy>0?1:-1, 0);
    }
    board.addEventListener("touchstart", onStart, {passive:true});
    board.addEventListener("touchend", onEnd, {passive:true});
    board.addEventListener("mousedown", onStart);
    board.addEventListener("mouseup", onEnd);

    function onKey(e){
      const map = { ArrowLeft:[0,-1], ArrowRight:[0,1], ArrowUp:[-1,0], ArrowDown:[1,0] };
      if(map[e.key]) setDir(...map[e.key]);
    }
    window.addEventListener("keydown", onKey);

    startBtn.addEventListener("click", () => {
      newGame();
      tickId = setInterval(step, 160);
    });

    snake = [[7,7],[7,6],[7,5]];
    food = [3,3];
    draw();

    return () => {
      clearInterval(tickId);
      window.removeEventListener("keydown", onKey);
    };
  }
});
