import { useCallback, useEffect, useState } from 'react';
import { getOfficialBCVRate, getStoredRate } from '../services/exchangeRateService';
import { BCVRateData, RateStatusType } from '../types';
import { formatRelativeTime } from '../utils/formatters';

export function useBCVRate() {
  const initialCache = getStoredRate();
  const [rateData, setRateData] = useState<BCVRateData | null>(initialCache);
  const [status, setStatus] = useState<RateStatusType>(
    initialCache ? 'cached' : 'updating',
  );
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [relativeTime, setRelativeTime] = useState<string>(
    initialCache ? formatRelativeTime(initialCache.fetchedAt) : '',
  );

  const fetchRate = useCallback(async (force = false) => {
    if (!navigator.onLine) {
      const cached = getStoredRate();
      if (cached) {
        setRateData(cached);
        setStatus('offline');
        setRelativeTime(formatRelativeTime(cached.fetchedAt));
      } else {
        setStatus('offline');
        setError('Sin conexión — tasa no disponible');
      }
      return;
    }

    setIsUpdating(true);
    if (!rateData) {
      setStatus('updating');
    }

    try {
      const data = await getOfficialBCVRate(force);
      setRateData(data);
      setStatus(data.isStale ? 'cached' : 'updated');
      setError(null);
      setRelativeTime(formatRelativeTime(data.fetchedAt));
    } catch (err) {
      const cached = getStoredRate();
      if (cached) {
        setRateData(cached);
        setStatus('cached');
        setError('No pudimos actualizar la tasa BCV. Usando la última disponible.');
        setRelativeTime(formatRelativeTime(cached.fetchedAt));
      } else {
        setRateData(null);
        setStatus('error');
        setError('No pudimos actualizar la tasa BCV. Tasa no disponible.');
      }
    } finally {
      setIsUpdating(false);
    }
  }, [rateData]);

  // Initial fetch
  useEffect(() => {
    fetchRate(false);
  }, []); // Run once on mount

  // Refresh when refocusing window or regaining internet
  useEffect(() => {
    const handleFocus = () => {
      fetchRate(false);
    };

    const handleOnline = () => {
      fetchRate(true);
    };

    const handleOffline = () => {
      setStatus('offline');
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Auto update check every 10 minutes
    const interval = setInterval(() => {
      fetchRate(false);
    }, 10 * 60 * 1000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [fetchRate]);

  // Relative time updater every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      if (rateData?.fetchedAt) {
        setRelativeTime(formatRelativeTime(rateData.fetchedAt));
      }
    }, 30000);
    return () => clearInterval(timer);
  }, [rateData?.fetchedAt]);

  const manualRefresh = useCallback(() => {
    return fetchRate(true);
  }, [fetchRate]);

  return {
    rateData,
    rate: rateData?.rate ?? 0,
    eurRate: rateData?.eurRate ?? 0,
    status,
    error,
    isUpdating,
    isStale: rateData?.isStale ?? true,
    relativeTime,
    manualRefresh,
  };
}
