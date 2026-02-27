export function registerServiceWorker(): void {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then(() => {
          // SW registered
        })
        .catch(() => {
          // SW registration failed - app still works
        });
    });
  }
}
