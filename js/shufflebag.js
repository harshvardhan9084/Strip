/**
 * STRIP — ShuffleBag
 * ------------------
 * A no-repeat draw helper: shuffles indices [0..n) into a random order,
 * hands them out one at a time via next(), and reshuffles automatically
 * once exhausted (guaranteeing the first item of a new cycle never
 * repeats the last item of the previous one, so back-to-back taps never
 * show the same content twice in a row).
 *
 * Usage:
 *   const bag = ShuffleBag.create(FACTS.length);
 *   const idx = bag.next(); // 0..FACTS.length-1, no repeats until exhausted
 *
 * Persist across sessions by saving/restoring the bag's state:
 *   const saved = bag.serialize();      // -> plain object, JSON-safe
 *   const bag = ShuffleBag.restore(saved, FACTS.length); // rehydrate
 */
window.ShuffleBag = (function(){
  function shuffle(arr){
    for(let i = arr.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function makeOrder(n, avoidFirst){
    let order = shuffle([...Array(n).keys()]);
    // avoid immediately repeating the very last item drawn from the previous cycle
    if(avoidFirst != null && order.length > 1 && order[0] === avoidFirst){
      [order[0], order[1]] = [order[1], order[0]];
    }
    return order;
  }

  function create(n){
    let order = makeOrder(n);
    let pos = 0;
    let last = null;

    function next(){
      if(n <= 0) return -1;
      if(pos >= order.length){
        order = makeOrder(n, last);
        pos = 0;
      }
      last = order[pos];
      pos++;
      return last;
    }

    function serialize(){
      return { order, pos, last };
    }

    return { next, serialize };
  }

  function restore(saved, n){
    // if the pool size changed (content added/removed), saved indices may be
    // out of range — safest is to just start a fresh bag rather than crash
    if(!saved || !Array.isArray(saved.order) || saved.order.some(i => i >= n)){
      return create(n);
    }
    let order = saved.order;
    let pos = typeof saved.pos === "number" ? saved.pos : 0;
    let last = typeof saved.last === "number" ? saved.last : null;

    function next(){
      if(n <= 0) return -1;
      if(pos >= order.length){
        order = makeOrder(n, last);
        pos = 0;
      }
      last = order[pos];
      pos++;
      return last;
    }
    function serialize(){
      return { order, pos, last };
    }
    return { next, serialize };
  }

  return { create, restore };
})();
