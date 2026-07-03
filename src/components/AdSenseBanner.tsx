import React, { useEffect, useRef } from 'react';

interface AdSenseBannerProps {
  adSlot: string;
  adFormat?: string;
  fullWidthResponsive?: boolean;
}

export function AdSenseBanner({ adSlot, adFormat = 'auto', fullWidthResponsive = true }: AdSenseBannerProps) {
  const clientId = import.meta.env.VITE_ADSENSE_CLIENT_ID || 'ca-pub-placeholder';
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (clientId !== 'ca-pub-placeholder') {
      // Inject script if not already present
      if (!document.getElementById('adsense-script')) {
        const script = document.createElement('script');
        script.id = 'adsense-script';
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
        script.async = true;
        script.crossOrigin = 'anonymous';
        document.head.appendChild(script);
      }

      // Initialize the ad
      const checkWidthAndLoad = () => {
        const adContainer = document.getElementById('adsense-container');
        if (adContainer && adContainer.clientWidth > 0) {
          if (!hasLoaded.current) {
            try {
              // @ts-ignore
              (window.adsbygoogle = window.adsbygoogle || []).push({});
              hasLoaded.current = true;
            } catch (err: any) {
              if (err && err.message && err.message.includes('availableWidth=0')) {
                // Ignore zero width errors
              } else {
                console.error('AdSense initialization error:', err);
              }
            }
          }
        } else {
          if (!hasLoaded.current) {
            setTimeout(checkWidthAndLoad, 1000);
          }
        }
      };

      const timeout = setTimeout(checkWidthAndLoad, 500); // Small delay to allow script to load
      return () => clearTimeout(timeout);
    }
  }, [clientId]);

  return (
    <div id="adsense-container" className="w-full bg-gray-100 dark:bg-gray-800/80 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center my-6 py-4 shadow-sm min-h-[120px] transition-colors">
      <div className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 font-medium w-full text-center">Advertisement</div>
      {clientId === 'ca-pub-placeholder' ? (
        <div className="text-center py-6 px-4">
          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">AdSense Ad Space</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">Add <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">VITE_ADSENSE_CLIENT_ID</code> to your .env to display live ads.</p>
        </div>
      ) : (
        <div className="w-full overflow-hidden flex justify-center">
          <ins
            className="adsbygoogle"
            style={{ display: 'block', minWidth: '300px', width: '100%', height: '90px' }}
            data-ad-client={clientId}
            data-ad-slot={adSlot}
            data-ad-format={adFormat}
            data-full-width-responsive={fullWidthResponsive.toString()}
          />
        </div>
      )}
    </div>
  );
}
