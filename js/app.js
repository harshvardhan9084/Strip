(function(){
  const stripEl   = document.getElementById("strip");
  const hudIndex  = document.getElementById("hud-index");
  const bootEl    = document.getElementById("boot");

  const SAVE_PREFIX = "strip:";
  const BATCH_SIZE = 6;        // how many cards we append at a time
  const PRELOAD_THRESHOLD = 3; // append more when within N cards of the end

  let deck = [];          // the shuffled infinite-feeling order (repeats allowed after a full pass)
  let cards = [];         // { el, mod, cleanup, mounted }
  let baseModules = [];
  let cursor = 0;

  // ---- tiny persistence helper passed into each game ----
  function makeApi(id){
    return {
      save(obj){
        try{ localStorage.setItem(SAVE_PREFIX + id, JSON.stringify(obj)); }catch(e){}
      },
      load(){
        try{
          const raw = localStorage.getItem(SAVE_PREFIX + id);
          return raw ? JSON.parse(raw) : null;
        }catch(e){ return null; }
      }
    };
  }

  // Fisher-Yates
  function shuffle(arr){
    const a = arr.slice();
    for(let i = a.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Build the next chunk of the "infinite" deck.
  // Strategy: shuffle full module set each pass so repeats don't clump,
  // and never place the same id twice in a row across pass boundaries.
  function nextBatch(n){
    const out = [];
    while(out.length < n){
      if(cursor === 0 || cursor >= baseModules.length){
        const fresh = shuffle(baseModules);
        // avoid immediate repeat of the last card already in the deck
        if(deck.length){
          const lastId = deck[deck.length - 1].id;
          if(fresh[0] && fresh[0].id === lastId && fresh.length > 1){
            [fresh[0], fresh[1]] = [fresh[1], fresh[0]];
          }
        }
        baseModules = fresh;
        cursor = 0;
      }
      out.push(baseModules[cursor]);
      deck.push(baseModules[cursor]);
      cursor++;
    }
    return out;
  }

  function buildCardShell(mod, idx){
    const cart = document.createElement("section");
    cart.className = "cart";
    cart.dataset.idx = idx;

    cart.innerHTML = `
      <div class="cart-inner">
        <div class="cart-header">
          <div>
            <div class="cart-label">${escapeHtml(mod.label || "STRIP")}</div>
            <div class="cart-title">${escapeHtml(mod.title || mod.id)}</div>
          </div>
          ${mod.tag ? `<div class="cart-tag">${escapeHtml(mod.tag)}</div>` : ""}
        </div>
        <div class="cart-body"></div>
        ${mod.hint ? `<div class="cart-hint">${escapeHtml(mod.hint)}</div>` : ""}
      </div>
    `;
    return cart;
  }

  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, c => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
    }[c]));
  }

  function appendCards(n){
    const batch = nextBatch(n);
    const frag = document.createDocumentFragment();
    batch.forEach(mod => {
      const idx = cards.length;
      const el = buildCardShell(mod, idx);
      frag.appendChild(el);
      cards.push({ el, mod, cleanup:null, mounted:false });
    });
    stripEl.appendChild(frag);
  }

  function mountCard(entry){
    if(entry.mounted) return;
    const body = entry.el.querySelector(".cart-body");
    try{
      const cleanup = entry.mod.mount(body, makeApi(entry.mod.id));
      entry.cleanup = typeof cleanup === "function" ? cleanup : null;
      entry.mounted = true;
    }catch(err){
      console.error("Failed to mount", entry.mod.id, err);
      body.innerHTML = `<div style="color:var(--ink-dim);font-size:13px;text-align:center;padding:20px;">This cartridge glitched.<br>(${escapeHtml(entry.mod.id)})</div>`;
    }
  }

  function unmountCard(entry){
    if(!entry.mounted) return;
    try{ entry.cleanup && entry.cleanup(); }catch(e){}
    const body = entry.el.querySelector(".cart-body");
    body.innerHTML = "";
    entry.mounted = false;
  }

  // Mount current + neighbors, unmount everything far away (keeps memory/CPU sane)
  function syncViewport(){
    const scrollTop = stripEl.scrollTop;
    const h = stripEl.clientHeight || 1;
    const centerIdx = Math.round(scrollTop / h);

    hudIndex.textContent = String((centerIdx % baseModules.length || baseModules.length) ).padStart(2,"0");

    cards.forEach((entry, i) => {
      const dist = Math.abs(i - centerIdx);
      if(dist <= 1){
        mountCard(entry);
      } else if(dist > 2){
        unmountCard(entry);
      }
    });

    // infinite: grow the deck as we approach the end
    if(cards.length - centerIdx <= PRELOAD_THRESHOLD){
      appendCards(BATCH_SIZE);
    }
  }

  let rafPending = false;
  function onScroll(){
    if(rafPending) return;
    rafPending = true;
    requestAnimationFrame(() => { syncViewport(); rafPending = false; });
  }

  function init(){
    const mods = Strip.all();
    if(!mods.length){
      stripEl.innerHTML = `<div style="padding:40px;color:var(--ink-dim)">No cartridges registered yet.</div>`;
      bootEl.classList.add("hide");
      return;
    }
    appendCards(Math.max(BATCH_SIZE, mods.length));
    syncViewport();
    stripEl.addEventListener("scroll", onScroll, { passive:true });

    setTimeout(() => bootEl.classList.add("hide"), 550);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
