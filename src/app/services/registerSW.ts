/**
 * Register the SmartAttend service worker for PWA functionality.
 * Call this once on app mount.
 */
export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.log('Service workers not supported in this browser');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.log('✅ SmartAttend Service Worker registered:', registration.scope);

    // Listen for updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'activated' && navigator.serviceWorker.controller) {
          console.log('🔄 SmartAttend has been updated. Refresh for the latest version.');
        }
      });
    });
  } catch (error) {
    console.error('Service Worker registration failed:', error);
  }
}
