import { BCVRateData } from '../types';

const STORAGE_KEY = 'valora_bcv_rate_v1';
const CACHE_VALIDITY_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Validates whether a rate payload conforms to BCV standards
 */
export function validateRatePayload(data: unknown): data is Partial<BCVRateData> & { rate: number } {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  if (typeof d.rate !== 'number' || isNaN(d.rate) || d.rate <= 0) return false;
  return true;
}

/**
 * Load cached rate from localStorage
 */
export function getStoredRate(): BCVRateData | null {
  try {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (validateRatePayload(parsed)) {
      return {
        currency: 'USD',
        rate: parsed.rate,
        rateFormatted:
          parsed.rateFormatted ||
          parsed.rate.toLocaleString('es-VE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 4,
          }),
        effectiveDate: parsed.effectiveDate || 'Fecha anterior',
        fetchedAt: parsed.fetchedAt || new Date().toISOString(),
        source: parsed.source || 'Banco Central de Venezuela (BCV)',
        isStale: true,
        status: 'cached',
        eurRate: parsed.eurRate,
        eurRateFormatted:
          parsed.eurRateFormatted ||
          (parsed.eurRate
            ? parsed.eurRate.toLocaleString('es-VE', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 4,
              })
            : undefined),
        history: parsed.history || [],
      };
    }
  } catch (err) {
    console.warn('Error reading stored rate:', err);
  }
  return null;
}

/**
 * Save rate to localStorage
 */
export function saveRateToStorage(rateData: BCVRateData): void {
  try {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rateData));
  } catch (err) {
    console.warn('Error saving rate to storage:', err);
  }
}

/**
 * Direct client-side fetch to official mirrors (used when backend /api is unreachable or on static GitHub Pages)
 */
async function fetchClientMirror(): Promise<BCVRateData> {
  // Mirror Option A: ExchangeRate API with live BCV parity (CORS supported, fast)
  try {
    const [usdRes, eurRes] = await Promise.allSettled([
      fetch('https://open.er-api.com/v6/latest/USD', {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(5000),
      }),
      fetch('https://open.er-api.com/v6/latest/EUR', {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(5000),
      }),
    ]);

    if (usdRes.status === 'fulfilled' && usdRes.value.ok) {
      const usdJson = await usdRes.value.json();
      const vesUsd = usdJson?.rates?.VES;
      if (typeof vesUsd === 'number' && vesUsd > 0) {
        let eurRate: number | undefined;
        let eurRateFormatted: string | undefined;

        if (eurRes.status === 'fulfilled' && eurRes.value.ok) {
          try {
            const eurJson = await eurRes.value.json();
            const vesEur = eurJson?.rates?.VES;
            if (typeof vesEur === 'number' && vesEur > 0) {
              eurRate = vesEur;
              eurRateFormatted = eurRate.toLocaleString('es-VE', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 4,
              });
            }
          } catch {
            // ignore
          }
        }

        const effectiveDate = usdJson.time_last_update_utc
          ? new Date(usdJson.time_last_update_utc).toLocaleDateString('es-VE', {
              weekday: 'long',
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })
          : 'Oficial BCV';

        return {
          currency: 'USD',
          rate: vesUsd,
          rateFormatted: vesUsd.toLocaleString('es-VE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 4,
          }),
          effectiveDate,
          fetchedAt: new Date().toISOString(),
          source: 'Banco Central de Venezuela (vía réplica oficial)',
          isStale: false,
          status: 'updated',
          eurRate,
          eurRateFormatted,
        };
      }
    }
  } catch (errA) {
    console.warn('Mirror Option A error, trying Option B:', errA);
  }

  // Mirror Option B: DolarAPI Venezuela
  const [dolarRes, euroRes] = await Promise.allSettled([
    fetch('https://ve.dolarapi.com/v1/dolares/oficial', {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(6000),
    }),
    fetch('https://ve.dolarapi.com/v1/euros/oficial', {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(6000),
    }),
  ]);

  if (dolarRes.status !== 'fulfilled' || !dolarRes.value.ok) {
    throw new Error('No se pudo obtener la tasa en réplica oficial');
  }

  const json = await dolarRes.value.json();
  if (typeof json.promedio !== 'number' || json.promedio <= 0) {
    throw new Error('Formato de tasa inválido en réplica oficial');
  }

  const rate = json.promedio;
  const effectiveDate = json.fechaActualizacion
    ? new Date(json.fechaActualizacion).toLocaleDateString('es-VE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('es-VE');

  let eurRate: number | undefined;
  let eurRateFormatted: string | undefined;
  if (euroRes.status === 'fulfilled' && euroRes.value.ok) {
    try {
      const euroJson = await euroRes.value.json();
      if (typeof euroJson.promedio === 'number' && euroJson.promedio > 0) {
        eurRate = euroJson.promedio;
        eurRateFormatted = eurRate.toLocaleString('es-VE', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 4,
        });
      }
    } catch {
      // non-blocking
    }
  }

  return {
    currency: 'USD',
    rate,
    rateFormatted: rate.toLocaleString('es-VE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }),
    effectiveDate,
    fetchedAt: new Date().toISOString(),
    source: 'Banco Central de Venezuela (vía réplica oficial)',
    isStale: false,
    status: 'updated',
    eurRate,
    eurRateFormatted,
  };
}

/**
 * Fetches official BCV exchange rate through multi-tier architecture:
 * Level 1: Internal backend /api/bcv-rate (direct BCV scraping + server cache)
 * Level 2: Direct browser client query to official mirror API
 * Level 3: Stored localStorage fallback (marked as isStale = true)
 */
export async function getOfficialBCVRate(force = false): Promise<BCVRateData> {
  const cached = getStoredRate();

  // If we have a very fresh cache and force is false, return it immediately
  if (!force && cached && !cached.isStale) {
    const age = Date.now() - new Date(cached.fetchedAt).getTime();
    if (age < CACHE_VALIDITY_MS) {
      return cached;
    }
  }

  // Tier 1: Try backend /api/bcv-rate (active in full-stack Node environments)
  try {
    const url = force ? '/api/bcv-rate?force=true' : '/api/bcv-rate';
    const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const data = await res.json();
      if (validateRatePayload(data)) {
        const validated: BCVRateData = {
          currency: 'USD',
          rate: data.rate,
          rateFormatted:
            data.rateFormatted ||
            data.rate.toLocaleString('es-VE', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 4,
            }),
          effectiveDate: data.effectiveDate || 'Fecha oficial',
          fetchedAt: data.fetchedAt || new Date().toISOString(),
          source: data.source || 'Banco Central de Venezuela (BCV)',
          isStale: false,
          status: 'updated',
          eurRate: data.eurRate,
          eurRateFormatted:
            data.eurRateFormatted ||
            (data.eurRate
              ? data.eurRate.toLocaleString('es-VE', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 4,
                })
              : undefined),
          history: data.history || (cached?.history ? cached.history : []),
        };
        saveRateToStorage(validated);
        return validated;
      }
    }
  } catch (err) {
    console.warn('Fallo en endpoint local /api/bcv-rate:', err);
  }

  // Tier 2: Try direct client mirror API
  try {
    const mirrorData = await fetchClientMirror();
    if (validateRatePayload(mirrorData)) {
      const merged: BCVRateData = {
        ...mirrorData,
        history: cached?.history || [],
      };
      saveRateToStorage(merged);
      return merged;
    }
  } catch (err2) {
    console.warn('Fallo en réplica cliente:', err2);
  }

  // Tier 3: Use cached rate from storage if available
  if (cached) {
    return {
      ...cached,
      isStale: true,
      status: 'cached',
    };
  }

  // Tier 4: No rate available at all
  throw new Error('Tasa oficial BCV no disponible actualmente.');
}
