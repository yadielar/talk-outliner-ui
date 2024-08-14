import { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { toast } from 'sonner';
import { useEffectEvent } from '@/lib/react.ts';

export function RegisterServiceWorker() {
  // check for updates every [period]
  const period = 60 * 60 * 1000; // 1 hour

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      console.debug(
        '[RegisterServiceWorker][onRegisteredSW] Service worker has been registered.',
        swUrl,
      );

      // Fetch the new app at load time in the background
      // r && r.update();

      if (period <= 0) return;

      // Register a periodic sync check
      if (r?.active?.state === 'activated') {
        registerPeriodicSync(period, swUrl, r);
      } else if (r?.installing) {
        r.installing.addEventListener('statechange', (e) => {
          const sw = e.target as ServiceWorker;
          if (sw.state === 'activated') {
            registerPeriodicSync(period, swUrl, r);
          }
        });
      }
    },
    onNeedRefresh() {
      console.debug(
        '[RegisterServiceWorker][onNeedRefresh] New content available.',
      );
    },
    onOfflineReady() {
      console.debug(
        '[RegisterServiceWorker][onOfflineReady] Content is cached for offline use.',
      );
    },
    onRegisterError(error) {
      console.error(
        '[RegisterServiceWorker][onRegisterError] Error registering the service worker',
        error.message,
      );
    },
  });

  const onUpdateServiceWorker = useEffectEvent(updateServiceWorker);
  const onClose = useEffectEvent(() => {
    setOfflineReady(false);
    setNeedRefresh(false);
  });

  useEffect(() => {
    // dismiss any existing toast
    toast.dismiss();

    console.debug('[RegisterServiceWorker][Effect] Dependencies changed', {
      offlineReady,
      needRefresh,
    });

    if (needRefresh) {
      toast('New content available, click on reload button to update.', {
        cancel: {
          label: 'Close',
          onClick: () => onClose(),
        },
        action: {
          label: 'Reload',
          onClick: async () => {
            console.debug(
              '[RegisterServiceWorker][Effect] User requested reload. Reloading...',
            );
            await onUpdateServiceWorker(true);
            window.location.reload();
          },
        },
        duration: Infinity,
      });
      return;
    }

    if (offlineReady) {
      toast('App ready to work offline', {
        cancel: {
          label: 'Close',
          onClick: () => onClose(),
        },
        duration: Infinity,
      });
    }
  }, [offlineReady, needRefresh, onUpdateServiceWorker, onClose]);

  return null;
}

/**
 * This function will register a periodic sync check.
 */
function registerPeriodicSync(
  period: number,
  swUrl: string,
  r: ServiceWorkerRegistration,
) {
  console.debug(
    '[RegisterServiceWorker][registerPeriodicSync] Registering periodic sync',
  );

  if (period <= 0) return;

  setInterval(async () => {
    console.debug('[RegisterServiceWorker][registerPeriodicSync] Sync started');

    if ('onLine' in navigator && !navigator.onLine) {
      console.debug(
        '[RegisterServiceWorker][registerPeriodicSync] User is offline. Skipping sync.',
      );
      return;
    }

    // This fetch should avoid issue with some edge cases like:
    // - server is down when calling the update method
    // - the user can go offline at any time
    // See https://vite-pwa-org.netlify.app/guide/periodic-sw-updates.html#handling-edge-cases
    const resp = await fetch(swUrl, {
      cache: 'no-store',
      headers: {
        'cache': 'no-store',
        'cache-control': 'no-cache',
      },
    });

    if (resp?.status === 200) {
      console.debug(
        '[RegisterServiceWorker][registerPeriodicSync] Checking for new version of the app...',
      );
      await r.update();
      console.debug(
        '[RegisterServiceWorker][registerPeriodicSync] Sync completed',
      );
    } else {
      console.debug(
        '[RegisterServiceWorker][registerPeriodicSync] Error fetching the service worker',
        resp,
      );
    }
  }, period);
}
