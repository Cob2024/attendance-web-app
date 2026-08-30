import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

/**
 * Animated offline detection banner.
 * Slides in from the top when the browser loses internet connectivity.
 */
export const OfflineBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2.5 flex items-center justify-center gap-2 shadow-lg animate-[slideDown_0.3s_ease-out]"
      role="alert"
    >
      <WifiOff className="w-4 h-4 flex-shrink-0" />
      <span className="text-sm font-medium">
        You are offline — some features may be unavailable
      </span>
    </div>
  );
};
