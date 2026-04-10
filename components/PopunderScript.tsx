'use client';

import { useEffect } from 'react';

export default function PopunderScript() {
  useEffect(() => {
    // Determine if mobile (less than 768px width)
    const isMobile = window.innerWidth < 768;
    
    // For mobile, reduce intensity by only loading the script 30% of the time.
    // For desktop, it loads 100% of the time.
    const shouldLoad = !isMobile || Math.random() < 0.3;

    if (!shouldLoad) return;

    const script = document.createElement('script');
    script.src = 'https://ruffianattorneymargarine.com/b5/69/eb/b569eb7b791361d8ac7541e832179947.js';
    script.async = true;
    
    document.head.appendChild(script);

    return () => {
      // Optional: remove script if component unmounts
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  return null;
}
