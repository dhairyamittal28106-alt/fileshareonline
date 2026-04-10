'use client';

import { useEffect } from 'react';

export default function MobileOnlyTagScript() {
  useEffect(() => {
    if (window.innerWidth >= 1024) return;

    const script = document.createElement('script');
    script.src = 'https://quge5.com/88/tag.min.js';
    script.async = true;
    script.setAttribute('data-zone', '227979');
    script.setAttribute('data-cfasync', 'false');
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  return null;
}
