export function setupPWA(){
  if ('serviceWorker' in navigator){
    navigator.serviceWorker.register('./sw.js').then((reg) => {
      const poke = () => reg.update();
      const interval = setInterval(poke, 30000);
      reg.addEventListener('updatefound', () => {
        const nw = reg.installing;
        if (!nw) return;
        nw.addEventListener('statechange', () => {
          if (nw.state === 'installed' && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller?.postMessage('SKIP_WAITING');
          }
        });
      });
      let refreshed = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshed) return;
        refreshed = true;
        location.reload();
      });
      window.addEventListener('beforeunload', () => clearInterval(interval));
    });
  }

  let deferredPrompt;
  const btn = document.getElementById('installBtn');
  window.addEventListener('beforeinstallprompt', (e)=>{
    e.preventDefault();
    deferredPrompt = e;
    if (btn) btn.hidden = false;
  });
  btn?.addEventListener('click', async ()=>{
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    btn.hidden = true;
  });
}
