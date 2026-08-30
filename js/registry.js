/**
 * STRIP — Game Registry
 * ---------------------
 * Each mini-game/fidget/widget registers itself here as a plain object:
 *
 * Strip.register({
 *   id: "unique-id",           // stable id, used for save-state key
 *   label: "CATEGORY",         // small eyebrow text (e.g. "FIDGET", "PUZZLE")
 *   title: "Display Name",
 *   tag: "⏱ 30s",              // small pill on the top-right of the card
 *   hint: "Tap to pop",        // short instruction line at bottom
 *   mount(container, api) {    // called when the card enters the strip
 *     // build DOM inside `container`, wire up events
 *     // api.save(obj) / api.load() -> persist small JSON state
 *     // return an optional cleanup function
 *   }
 * });
 *
 * Registration order = default deck order, but app.js can shuffle/weight it.
 */
window.Strip = (function(){
  const modules = [];

  function register(mod){
    if(!mod || !mod.id || typeof mod.mount !== "function"){
      console.error("Strip.register: invalid module", mod);
      return;
    }
    modules.push(mod);
  }

  function all(){ return modules.slice(); }

  return { register, all };
})();
