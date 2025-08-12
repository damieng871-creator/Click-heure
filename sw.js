<script>
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').then(reg => {
    // si un SW est déjà prêt à remplacer l'ancien
    if (reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' });
    // dès qu'une nouvelle version s'installe, on recharge
    reg.addEventListener('updatefound', () => {
      const nw = reg.installing;
      nw && nw.addEventListener('statechange', () => {
        if (nw.state === 'installed' && navigator.serviceWorker.controller) {
          location.reload();
        }
      });
    });
  });
  navigator.serviceWorker.addEventListener('controllerchange', () => location.reload());
}
</script>
