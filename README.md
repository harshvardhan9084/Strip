# Strip

Repository description: this game needs developer + gamer

Strip is a browser-first collection of short, lightweight JavaScript "cartridge" games delivered as a single web app. It already contains a large number of small games and the runtime that loads them in an infinite strip UI.

What is in this repository (accurate to the current main branch)
---------------------------------------------------------------
- Root web app entry: `index.html`
- Progressive Web App files: `manifest.json`, `sw.js`
- Styling under `css/` (CSS files)
- App and runtime scripts under `js/`
  - Core runtime files (examples): `js/app.js`, `js/registry.js`, `js/settings.js`, `js/settings-ui.js`, `js/storage.js`, `js/feedback.js`, `js/shufflebag.js`
  - Game cartridges live in `js/games/` — each cartridge is a self-contained JavaScript file that the app injects into the strip UI.

Games included (files under `js/games/` in this repo)
-----------------------------------------------------
The repository currently includes many small games (listed by filename):

- anthill
- aquarium
- artillery
- balloonpop
- blobmerge
- breakglass
- breathe
- bubbleshoot
- bubblewrap
- chainlink
- colormix
- colorsnap
- etch
- flapdot
- garden
- kaleidoscope
- kingdom
- lightsout
- maze
- memorymatch
- minisudoku
- papercrumple
- petrock
- physicsdrop
- plinko
- randomfact
- reaction
- rhythmtap
- sandbox2048
- sanddrag
- simonsays
- slidepuzzle
- snake
- spinner
- stacktower
- talktowall
- thebutton
- thisorthat
- tonepad
- towerdefense
- tradingpost
- trivia
- typespeed
- unscramble
- whackmole
- wouldyourather
- xox

(Each above corresponds to `js/games/<name>.js` in the current branch.)

Vision — (from repository owner)
--------------------------------
Your stated vision: make this a very large open-source platform that hosts millions of quick games over time, contributed by developers who are "gamers at heart." This README documents the current state and provides guidance for contributors so the project can grow toward that vision. I have not invented features or history — the README only reflects files currently present in the repository.

Getting started (run locally)
-----------------------------
1. Clone the repo:

   git clone https://github.com/harshvardhan9084/strip.git
   cd strip

2. Open `index.html` in a modern browser, or serve the folder with a static server (recommended to enable service worker/dev features):

   npx http-server .

   or

   python -m http.server 8000

3. The app will load the runtime and the cartridges placed in `js/games/`.

Development notes
-----------------
- Each game is a standalone JavaScript file that registers itself with the runtime (see `js/registry.js`). If you add a new game cartridge, follow the existing cartridge files as examples and include it in `index.html` (or update the loader to auto-discover).
- Settings and persistence are handled by `js/settings.js` and `js/storage.js`.
- The app attempts to be installable as a PWA using `manifest.json` and `sw.js`.

Contributing
------------
If you want this repository to become the large, community-driven catalogue you described, here's a minimal contribution workflow:

1. Fork the repo and create a branch: `git checkout -b feature/<your-feature>`.
2. Add a small, self-contained game under `js/games/` (name the file `<yourgame>.js`). Keep the file focused and well-documented.
3. Add any assets under `public/` or `css/` as needed. Avoid large binary files in the main branch; prefer hosting assets in an `assets/` folder and keep sizes small.
4. Update `index.html` or the loader to include your cartridge, and add a short README snippet documenting the game.
5. Open a Pull Request describing the game, gameplay, and any controls. Explain how it registers with the runtime.

Guidelines for game cartridges
------------------------------
- Small and self-contained: a cartridge should not require a complex build step.
- Respect global namespace: prefer registering via the runtime's registration API instead of polluting globals.
- Keep assets minimal and optimized.
- Include a short header comment describing the game, controls, and author.

Next steps I can help with
-------------------------
- Improve this README further (add badges, contribution templates, code of conduct, issue templates).
- Add a simple CONTRIBUTING.md or a template for game cartridges so new contributors have a clear starter.
- Make the game loader auto-discover `js/games/` instead of hardcoding scripts in `index.html`.

License
-------
No license file was found in the repository. To allow others to reuse and contribute, add a LICENSE file (for example MIT, Apache-2.0). If you want, I can add one for you — tell me which license you prefer.

Contact / Links
---------------
- Repo: https://github.com/harshvardhan9084/strip
- Owner: https://github.com/harshvardhan9084

