// Lightweight beforeinstallprompt handler and install button injector
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  showInstallButton();
});

function showInstallButton(){
  // if an install button exists already, show it
  if(document.getElementById('install-btn')){
    document.getElementById('install-btn').style.display = 'inline-block';
    return;
  }

  // create a small install button in the HUD
  const hudRight = document.getElementById('hud-right');
  if(!hudRight) return;

  const btn = document.createElement('button');
  btn.id = 'install-btn';
  btn.title = 'Install Strip';
  btn.style.display = 'none';
  btn.className = 'hud-btn';
  btn.textContent = 'Install';
  btn.addEventListener('click', async () => {
    if(!deferredPrompt) return;
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    console.log('Install prompt choice', choice);
    deferredPrompt = null;
    btn.style.display = 'none';
  });

  hudRight.insertBefore(btn, hudRight.firstChild);
  // show after insertion
  btn.style.display = 'inline-block';
}

// Optional: hide if already installed
window.addEventListener('appinstalled', () => {
  const b = document.getElementById('install-btn');
  if (b) b.style.display = 'none';
  console.log('Strip was installed');
});
