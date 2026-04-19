'use client';

import { useEffect } from 'react';

const LEFT_RIGHT_AD_CODE = `
<script type="text/javascript">
  atOptions = {
    'key' : 'd77523e3a4ebfe2e347c3c7655ec0803',
    'format' : 'iframe',
    'height' : 600,
    'width' : 160,
    'params' : {}
  };
</script>
<script type="text/javascript" src="//www.highperformanceformat.com/d77523e3a4ebfe2e347c3c7655ec0803/invoke.js"></script>
`;

const BOTTOM_AD_CODE = `
<script type="text/javascript">
  atOptions = {
    'key' : '2429ace9cc5c549aae271204deb7c8e3',
    'format' : 'iframe',
    'height' : 90,
    'width' : 728,
    'params' : {}
  };
</script>
<script type="text/javascript" src="//www.highperformanceformat.com/2429ace9cc5c549aae271204deb7c8e3/invoke.js"></script>
`;

const SIDE_FILL_AD_CODE = `
<script type="text/javascript">
  atOptions = {
    'key' : '46577a89265928ad0e1b1d1053480095',
    'format' : 'iframe',
    'height' : 250,
    'width' : 300,
    'params' : {}
  };
</script>
<script type="text/javascript" src="//www.highperformanceformat.com/46577a89265928ad0e1b1d1053480095/invoke.js"></script>
`;

const IFRAME_WAIT_MS = 5000;
const SLOT_COOLDOWN_MS = 10 * 60 * 1000;

type AdSlot = {
  id: string;
  code: string;
};

type SlotHealth = {
  failCount: number;
  blockedUntil: number;
};

function replaceAndRunScripts(container: HTMLElement): Promise<void> {
  const scripts = Array.from(container.getElementsByTagName('script'));
  let sequence = Promise.resolve();

  for (const oldScript of scripts) {
    sequence = sequence.then(
      () =>
        new Promise<void>((resolve) => {
          const newScript = document.createElement('script');

          for (const attr of Array.from(oldScript.attributes)) {
            newScript.setAttribute(attr.name, attr.value);
          }

          if (oldScript.src) {
            newScript.src = oldScript.src;
            newScript.async = false;
            newScript.onload = () => resolve();
            newScript.onerror = () => resolve();
          } else {
            newScript.text = oldScript.text || oldScript.innerHTML;
            resolve();
          }

          oldScript.parentNode?.replaceChild(newScript, oldScript);
        }),
    );
  }

  return sequence;
}

async function injectAd(containerId: string, adCode: string) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';
  container.innerHTML = adCode;
  await replaceAndRunScripts(container);
}

function waitForIframe(containerId: string, timeoutMs: number): Promise<boolean> {
  const startedAt = Date.now();

  return new Promise((resolve) => {
    const tick = () => {
      const container = document.getElementById(containerId);
      const hasIframe = !!container?.querySelector('iframe');
      if (hasIframe) {
        resolve(true);
        return;
      }

      if (Date.now() - startedAt >= timeoutMs) {
        resolve(false);
        return;
      }

      window.setTimeout(tick, 200);
    };

    tick();
  });
}

export default function AdContainer() {
  useEffect(() => {
    let disposed = false;
    const slots: AdSlot[] = [
      { id: 'top-ad', code: BOTTOM_AD_CODE },
      { id: 'left-ad', code: LEFT_RIGHT_AD_CODE },
      { id: 'right-ad', code: LEFT_RIGHT_AD_CODE },
      { id: 'left-ad-bottom', code: LEFT_RIGHT_AD_CODE },
      { id: 'right-ad-bottom', code: LEFT_RIGHT_AD_CODE },
      { id: 'bottom-ad', code: BOTTOM_AD_CODE },
      { id: 'bottom-left-fill', code: SIDE_FILL_AD_CODE },
      { id: 'bottom-right-fill', code: SIDE_FILL_AD_CODE },
    ];
    const health = new Map<string, SlotHealth>();

    for (const slot of slots) {
      health.set(slot.id, { failCount: 0, blockedUntil: 0 });
    }

    const runAds = async () => {
      for (const slot of slots) {
        if (disposed) return;

        const slotHealth = health.get(slot.id);
        if (!slotHealth) continue;
        if (Date.now() < slotHealth.blockedUntil) continue;

        await injectAd(slot.id, slot.code);
        const loaded = await waitForIframe(slot.id, IFRAME_WAIT_MS);

        if (loaded) {
          slotHealth.failCount = 0;
          slotHealth.blockedUntil = 0;
        } else {
          slotHealth.failCount += 1;
          if (slotHealth.failCount >= 2) {
            slotHealth.blockedUntil = Date.now() + SLOT_COOLDOWN_MS;
          }
        }
      }
    };

    const runWithRetry = async () => {
      if (disposed) return;

      await runAds();

      window.setTimeout(() => {
        if (!disposed) void runAds();
      }, 2500);
    };

    void runWithRetry();

    const refreshTimer = window.setInterval(() => {
      if (!disposed) void runAds();
    }, 120000);

    const onVisible = () => {
      if (document.visibilityState === 'visible' && !disposed) {
        void runAds();
      }
    };

    document.addEventListener('visibilitychange', onVisible);

    return () => {
      disposed = true;
      window.clearInterval(refreshTimer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  return null;
}
