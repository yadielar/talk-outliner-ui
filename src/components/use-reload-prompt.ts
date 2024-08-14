import { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { toast } from 'sonner';
import { useEffectEvent } from '@/lib/react.ts';

export function useReloadPrompt() {
  // check for updates every hour
  const period = 60 * 60 * 1000;

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      if (period <= 0) return;
      if (r?.active?.state === 'activated') {
        registerPeriodicSync(period, swUrl, r);
      } else if (r?.installing) {
        r.installing.addEventListener('statechange', (e) => {
          const sw = e.target as ServiceWorker;
          if (sw.state === 'activated') registerPeriodicSync(period, swUrl, r);
        });
      }
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

    if (offlineReady) {
      toast(
        offlineReady
          ? 'App ready to work offline'
          : 'New content available, click on reload button to update.',
        {
          cancel: {
            label: 'Close',
            onClick: () => onClose(),
          },
          action: needRefresh
            ? {
                label: 'Reload',
                onClick: () => onUpdateServiceWorker(true),
              }
            : undefined,
          duration: Infinity,
        },
      );
    }
  }, [offlineReady, needRefresh, onUpdateServiceWorker, onClose]);
}

/**
 * This function will register a periodic sync check every hour, you can modify the interval as needed.
 */
function registerPeriodicSync(
  period: number,
  swUrl: string,
  r: ServiceWorkerRegistration,
) {
  if (period <= 0) return;

  setInterval(async () => {
    if ('onLine' in navigator && !navigator.onLine) return;

    const resp = await fetch(swUrl, {
      cache: 'no-store',
      headers: {
        'cache': 'no-store',
        'cache-control': 'no-cache',
      },
    });

    if (resp?.status === 200) await r.update();
  }, period);
}
