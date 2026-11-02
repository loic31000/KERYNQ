/* KERYNQ · cache hors ligne et mises à jour, uniquement sous HTTPS ou en local.
   Rien ne se recharge sans clic : une nouvelle version attend que l'utilisateur la demande. */
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  window.addEventListener('load', async () => {
    const banner = document.getElementById('updateBanner'), text = document.getElementById('updateText'), button = document.getElementById('updateNow');
    const hadController = !!navigator.serviceWorker.controller;
    let registration, requested = false, reloading = false;
    const reload = () => {
      if (reloading) return;
      reloading = true;
      location.reload();
    };
    const privateWarning = () => document.getElementById('privateSearchToggle')?.getAttribute('aria-pressed') === 'true' ? ' Votre recherche en mode privé sera effacée.' : '';
    const offer = message => {
      text.textContent = message + privateWarning();
      button.disabled = false;
      banner.hidden = false;
    };
    const offerWaiting = () => {
      if (registration.waiting && registration.active) offer('Nouvelle version disponible.');
    };
    button.addEventListener('click', () => {
      if (!registration.waiting) return reload();
      requested = true;
      button.disabled = true;
      registration.waiting.postMessage('kerynq-activate');
    });
    // Un onglet qui n'a rien demandé garde sa session et propose simplement de recharger.
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!hadController) return;
      if (requested) reload();
      else offer('Une nouvelle version est active. Rechargez quand vous êtes prêt.');
    });
    try {
      registration = await navigator.serviceWorker.register('./service-worker.js');
    } catch {
      return;
    }
    if (!registration) return;
    offerWaiting();
    registration.addEventListener('updatefound', () => {
      const worker = registration.installing;
      worker?.addEventListener('statechange', () => {
        if (worker.state === 'installed') offerWaiting();
      });
    });
    const check = () => registration.update().catch(() => {});
    window.addEventListener('online', check);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') check();
    });
    if (navigator.onLine) check();
  });
}
