import React, { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 flex items-center gap-2.5 rounded-xl bg-white dark:bg-zinc-900 text-black dark:text-white px-4 py-3 shadow-xl border-2 border-slate-300 dark:border-zinc-800 backdrop-blur-md animate-in slide-in-from-bottom-2 duration-200"
    >
      <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
      <div className="text-xs">
        <span className="font-black">Sin conexión:</span> Operando en modo offline con la última tasa BCV guardada.
      </div>
    </div>
  );
};
