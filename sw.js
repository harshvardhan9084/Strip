const CACHE = "strip-v7";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/style.css",
  "./js/storage.js",
  "./js/settings.js",
  "./js/settings-ui.js",
  "./js/registry.js",
  "./js/app.js",
  "./js/games/anthill.js",
  "./js/games/aquarium.js",
  "./js/games/artillery.js",
  "./js/games/balloonpop.js",
  "./js/games/blobmerge.js",
  "./js/games/breakglass.js",
  "./js/games/breathe.js",
  "./js/games/bubbleshoot.js",
  "./js/games/bubblewrap.js",
  "./js/games/chainlink.js",
  "./js/games/colormix.js",
  "./js/games/colorsnap.js",
  "./js/games/etch.js",
  "./js/games/flapdot.js",
  "./js/games/garden.js",
  "./js/games/kaleidoscope.js",
  "./js/games/kingdom.js",
  "./js/games/lightsout.js",
  "./js/games/maze.js",
  "./js/games/memorymatch.js",
  "./js/games/minisudoku.js",
  "./js/games/papercrumple.js",
  "./js/games/petrock.js",
  "./js/games/physicsdrop.js",
  "./js/games/plinko.js",
  "./js/games/randomfact.js",
  "./js/games/reaction.js",
  "./js/games/rhythmtap.js",
  "./js/games/sandbox2048.js",
  "./js/games/sanddrag.js",
  "./js/games/simonsays.js",
  "./js/games/slidepuzzle.js",
  "./js/games/snake.js",
  "./js/games/spinner.js",
  "./js/games/stacktower.js",
  "./js/games/talktowall.js",
  "./js/games/thebutton.js",
  "./js/games/thisorthat.js",
  "./js/games/tonepad.js",
  "./js/games/towerdefense.js",
  "./js/games/tradingpost.js",
  "./js/games/trivia.js",
  "./js/games/typespeed.js",
  "./js/games/unscramble.js",
  "./js/games/whackmole.js",
  "./js/games/wouldyourather.js",
  "./js/games/xox.js",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if(e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if(cached) return cached;
      return fetch(e.request).then(res => {
        // don't cache google fonts CDN failures etc, only same-origin ok responses
        if(res.ok && e.request.url.startsWith(self.location.origin)){
          const clone = res.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return res;
      }).catch(() => cached);
    })
  );
});
