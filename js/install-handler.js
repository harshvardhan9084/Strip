// Install handler: shows install button in HUD and settings, prompts when available
let deferredPrompt = null;

function isInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

function showInstallUI() {
  // show HUD button
  const hudRight = document.getElementById('hud-right');
  if (hudRight && !document.getElementById('install-btn')) {
    const btn = document.createElement('button');
    btn.id = 'install-btn';
    btn.title = 'Install Strip';
    btn.className = 'hud-btn';
    btn.textContent = 'Install';
    btn.addEventListener('click', triggerPromptFromElement);
    hudRight.insertBefore(btn, hudRight.firstChild);
  }

  // show settings button (if markup exists)
  const settingsBtn = document.getElementById('install-setting-btn');
  if (settingsBtn) {
    settingsBtn.style.display = 'block';
    settingsBtn.removeEventListener('click', triggerPromptFromElement);
    settingsBtn.addEventListener('click', triggerPromptFromElement);
  }

  const note = document.getElementById('install-note');
  if (note) note.style.display = 'none';
}

function hideInstallUI() {
  const hudBtn = document.getElementById('install-btn');
  if (hudBtn) hudBtn.style.display = 'none';
  const settingsBtn = document.getElementById('install-setting-btn');
  if (settingsBtn) settingsBtn.style.display = 'none';
  const note = document.getElementById('install-note');
  if (note) note.style.display = 'none';
}

async function triggerPromptFromElement(e) {
  // prefer the deferred prompt
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    console.log('User choice', choice);
    // clear stored prompt regardless of choice
    deferredPrompt = null;
    // hide buttons after prompt
    hideInstallUI();
    return;
  }

  // No deferredPrompt available: show helpful note in settings
  const note = document.getElementById('install-note');
  if (note) {
    note.style.display = 'block';
    // briefly highlight
    note.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, fill: 'forwards' });
  } else {
    alert('To install: use your browser menu (⋮) → "Install app" or "Add to Home screen".');
  }
}

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent automatic prompt
  e.preventDefault();
  deferredPrompt = e;
  if (isInstalled()) return; // already installed
  showInstallUI();
});

window.addEventListener('appinstalled', () => {
  console.log('App installed');
  deferredPrompt = null;
  hideInstallUI();
});

// On load, if already installed, hide UI; otherwise, keep settings button visible as a fallback
window.addEventListener('DOMContentLoaded', () => {
  if (isInstalled()) {
    hideInstallUI();
    return;
  }
  // if settings button exists in markup, show it as a fallback (it will be hidden by CSS if not supported)
  const settingsBtn = document.getElementById('install-setting-btn');
  const note = document.getElementById('install-note');
  if (settingsBtn) {
    // hide until beforeinstallprompt fires; but keep it visible to allow manual note
    settingsBtn.style.display = 'none';
    // attach click in case deferredPrompt becomes available later
    settingsBtn.addEventListener('click', triggerPromptFromElement);
  }
  if (note) note.style.display = 'none';
});
