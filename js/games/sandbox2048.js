Strip.register({
  id: "mini2048",
  label: "PUZZLE",
  title: "Mini 2048",
  tag: "4×4",
  hint: "Swipe to slide the tiles",
  mount(container, api){
    const SIZE = 4;
    let grid, score, best;

    const saved = api.load();
    best = saved ? saved.best || 0 : 0;

    const wrap = document.createElement("div");
    wrap.style.cssText = "display:flex; flex-direction:column; align-items:center; gap:14px; width:100%;";

    const scoreRow = document.createElement("div");
    scoreRow.style.cssText = "display:flex; gap:10px; font-family:var(--font-display); font-size:10px;";
    const scoreBox = mkBox("SCORE");
    const bestBox = mkBox("BEST");
    scoreRow.appendChild(scoreBox.el);
    scoreRow.appendChild(bestBox.el);

    function mkBox(label){
      const el = document.createElement("div");
      el.style.cssText = "background:var(--panel-2); border:1px solid var(--line); border-radius:10px; padding:8px 14px; text-align:center; min-width:70px;";
      el.innerHTML = `<div style="color:var(--ink-dim); font-size:8px;">${label}</div><div class="val" style="color:var(--amber); margin-top:4px;">0</div>`;
      return { el, set(v){ el.querySelector(".val").textContent = v; } };
    }

    const boardWrap = document.createElement("div");
    boardWrap.style.cssText = `
      position:relative; width:min(72vw, 260px); height:min(72vw, 260px);
      background:var(--panel-2); border-radius:14px; padding:8px;
      display:grid; grid-template-columns:repeat(${SIZE},1fr); grid-template-rows:repeat(${SIZE},1fr); gap:8px;
      touch-action:none;
    `;

    const cells = [];
    for(let i=0;i<SIZE*SIZE;i++){
      const c = document.createElement("div");
      c.style.cssText = "background:rgba(255,255,255,.03); border-radius:8px;";
      boardWrap.appendChild(c);
      cells.push(c);
    }

    const tileLayer = document.createElement("div");
    tileLayer.style.cssText = "position:absolute; inset:8px; pointer-events:none;";
    boardWrap.appendChild(tileLayer);

    const restartBtn = document.createElement("button");
    restartBtn.className = "btn accent";
    restartBtn.textContent = "New game";
    restartBtn.addEventListener("click", () => newGame());

    wrap.appendChild(scoreRow);
    wrap.appendChild(boardWrap);
    wrap.appendChild(restartBtn);
    container.appendChild(wrap);

    const COLORS = {
      2:"#2A2A34", 4:"#3A3A46", 8:"#5A4A2E", 16:"#7A5A22", 32:"#9A6A1E",
      64:"#C07E1A", 128:"#4A4470", 256:"#5D54A0", 512:"#8B7FE8",
      1024:"#E8637F", 2048:"#FFB347"
    };

    function newGame(){
      grid = Array.from({length:SIZE}, () => Array(SIZE).fill(0));
      score = 0;
      addRandomTile(); addRandomTile();
      render();
    }

    function addRandomTile(){
      const empty = [];
      for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++) if(grid[r][c]===0) empty.push([r,c]);
      if(!empty.length) return;
      const [r,c] = empty[Math.floor(Math.random()*empty.length)];
      grid[r][c] = Math.random() < 0.9 ? 2 : 4;
    }

    function render(){
      tileLayer.innerHTML = "";
      const cellSize = boardWrap.clientWidth ? (boardWrap.clientWidth - 16 - 8*(SIZE-1)) / SIZE : 50;
      const gap = 8;
      for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++){
        const v = grid[r][c];
        if(!v) continue;
        const t = document.createElement("div");
        t.textContent = v;
        t.style.cssText = `
          position:absolute; width:${cellSize}px; height:${cellSize}px;
          left:${c*(cellSize+gap)}px; top:${r*(cellSize+gap)}px;
          background:${COLORS[v] || "#FFB347"}; border-radius:8px;
          display:flex; align-items:center; justify-content:center;
          font-weight:700; font-size:${v > 512 ? 16 : 20}px; color:${v>=8?"#fff":"#EDEAE3"};
          transition:left .1s ease, top .1s ease;
        `;
        tileLayer.appendChild(t);
      }
      scoreBox.set(score);
      best = Math.max(best, score);
      bestBox.set(best);
      api.save({ best });
    }

    function slide(row){
      const filtered = row.filter(v => v !== 0);
      for(let i=0;i<filtered.length-1;i++){
        if(filtered[i] === filtered[i+1]){
          filtered[i] *= 2;
          score += filtered[i];
          filtered.splice(i+1,1);
        }
      }
      while(filtered.length < SIZE) filtered.push(0);
      return filtered;
    }

    function rotateGrid(g){
      const n = g.length;
      const res = Array.from({length:n}, () => Array(n).fill(0));
      for(let r=0;r<n;r++) for(let c=0;c<n;c++) res[c][n-1-r] = g[r][c];
      return res;
    }

    function move(dir){
      // normalize to "left" by rotating, slide, rotate back
      let g = grid;
      let rotations = { left:0, up:1, right:2, down:3 }[dir];
      for(let i=0;i<rotations;i++) g = rotateGrid(g);
      const before = JSON.stringify(g);
      g = g.map(slide);
      const after = JSON.stringify(g);
      for(let i=0;i<(4-rotations)%4;i++) g = rotateGrid(g);
      grid = g;
      if(before !== JSON.stringify(rotations ? rotateGridBack(g, rotations) : g)){
        addRandomTile();
      }
      render();
    }
    function rotateGridBack(g, rotations){
      let r = g;
      for(let i=0;i<rotations;i++) r = rotateGrid(r);
      return r;
    }

    // swipe controls
    let sx=0, sy=0;
    function onStart(e){
      const t = e.touches ? e.touches[0] : e;
      sx = t.clientX; sy = t.clientY;
    }
    function onEnd(e){
      const t = e.changedTouches ? e.changedTouches[0] : e;
      const dx = t.clientX - sx, dy = t.clientY - sy;
      if(Math.max(Math.abs(dx),Math.abs(dy)) < 24) return;
      if(Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? "right" : "left");
      else move(dy > 0 ? "down" : "up");
    }
    boardWrap.addEventListener("touchstart", onStart, {passive:true});
    boardWrap.addEventListener("touchend", onEnd, {passive:true});
    boardWrap.addEventListener("mousedown", onStart);
    boardWrap.addEventListener("mouseup", onEnd);

    function onKey(e){
      const map = { ArrowLeft:"left", ArrowRight:"right", ArrowUp:"up", ArrowDown:"down" };
      if(map[e.key]) move(map[e.key]);
    }
    window.addEventListener("keydown", onKey);

    newGame();

    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }
});
