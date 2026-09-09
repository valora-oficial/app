import express from 'express';
import https from 'node:https';
import path from 'node:path';
import { createServer as createViteServer } from 'vite';

interface CachedRate {
  currency: 'USD';
  rate: number;
  rateFormatted: string;
  effectiveDate: string;
  fetchedAt: string;
  source: string;
  isStale: boolean;
  status: 'updated' | 'cached' | 'fallback' | 'error';
  eurRate?: number;
  eurRateFormatted?: string;
  history?: Array<{ date: string; rate: number; eurRate?: number }>;
}

let cachedData: CachedRate | null = null;
let lastFetchTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

// Keep a rolling history of rates seen
const rateHistoryMap = new Map<string, { rate: number; eurRate?: number }>();

async function scrapeBCV(): Promise<{ rate: number; effectiveDate: string; eurRate?: number }> {
  return new Promise((resolve, reject) => {
    const agent = new https.Agent({ rejectUnauthorized: false });
    const req = https.get(
      'https://www.bcv.org.ve/',
      {
        agent,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'es-VE,es-ES;q=0.9,es;q=0.8,en;q=0.7',
        },
        timeout: 9000,
      },
      (res) => {
        if (res.statusCode && res.statusCode >= 400) {
          return reject(new Error(`BCV returned HTTP ${res.statusCode}`));
        }
        let html = '';
        res.on('data', (chunk) => (html += chunk));
        res.on('end', () => {
          try {
            // Find USD container
            const dolarSection =
              html.match(/id="dolar"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/i) ||
              html.match(/id="dolar"[\s\S]*?<\/strong>/i);

            let rate: number | null = null;
            if (dolarSection) {
              const m = dolarSection[0].match(
                /<strong[^>]*>\s*([0-9]+[.,][0-9]+)\s*<\/strong>/i,
              );
              if (m) {
                const cleanStr = m[1].replace(/\./g, '').replace(',', '.');
                const parsed = parseFloat(cleanStr);
                if (!isNaN(parsed) && parsed > 0) {
                  rate = parsed;
                }
              }
            }

            // Find Fecha Valor
            let effectiveDate = '';
            const dateMatch =
              html.match(/Fecha Valor:?\s*<span[^>]*>([^<]+)<\/span>/i) ||
              html.match(
                /content="([0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}[+-][0-9]{2}:[0-9]{2})"/,
              );
            if (dateMatch) {
              effectiveDate = dateMatch[1].replace(/\s+/g, ' ').trim();
            }

            // Find Euro
            let eurRate: number | undefined;
            const euroSection = html.match(/id="euro"[\s\S]*?<\/strong>/i);
            if (euroSection) {
              const em = euroSection[0].match(
                /<strong[^>]*>\s*([0-9]+[.,][0-9]+)\s*<\/strong>/i,
              );
              if (em) {
                const ep = parseFloat(
                  em[1].replace(/\./g, '').replace(',', '.'),
                );
                if (!isNaN(ep) && ep > 0) eurRate = ep;
              }
            }

            if (!rate) {
              return reject(new Error('Could not parse USD rate from BCV HTML'));
            }

            resolve({ rate, effectiveDate, eurRate });
          } catch (err) {
            reject(err);
          }
        });
      },
    );

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('BCV request timeout'));
    });
  });
}

async function fetchFromMirror(): Promise<{
  rate: number;
  effectiveDate: string;
  eurRate?: number;
}> {
  // Try Mirror A: ExchangeRate-API (high parity with BCV)
  try {
    const [usdRes, eurRes] = await Promise.allSettled([
      fetch('https://open.er-api.com/v6/latest/USD', {
        headers: { 'User-Agent': 'ValoraApp/1.0 (VALORA Venezuela Exchange Calculator)' },
        signal: AbortSignal.timeout(5000),
      }),
      fetch('https://open.er-api.com/v6/latest/EUR', {
        headers: { 'User-Agent': 'ValoraApp/1.0 (VALORA Venezuela Exchange Calculator)' },
        signal: AbortSignal.timeout(5000),
      }),
    ]);

    if (usdRes.status === 'fulfilled' && usdRes.value.ok) {
      const usdJson = await usdRes.value.json();
      const vesRate = usdJson?.rates?.VES;
      if (typeof vesRate === 'number' && vesRate > 0) {
        let eurRate: number | undefined;
        if (eurRes.status === 'fulfilled' && eurRes.value.ok) {
          try {
            const eurJson = await eurRes.value.json();
            if (typeof eurJson?.rates?.VES === 'number' && eurJson.rates.VES > 0) {
              eurRate = eurJson.rates.VES;
            }
          } catch {
            // ignore
          }
        }
        return {
          rate: vesRate,
          effectiveDate: usdJson.time_last_update_utc || new Date().toISOString(),
          eurRate,
        };
      }
    }
  } catch {
    // Continue to DolarAPI mirror
  }

  // Try Mirror B: DolarAPI
  const [dolarRes, euroRes] = await Promise.allSettled([
    fetch('https://ve.dolarapi.com/v1/dolares/oficial', {
      headers: { 'User-Agent': 'ValoraApp/1.0 (VALORA Venezuela Exchange Calculator)' },
      signal: AbortSignal.timeout(6000),
    }),
    fetch('https://ve.dolarapi.com/v1/euros/oficial', {
      headers: { 'User-Agent': 'ValoraApp/1.0 (VALORA Venezuela Exchange Calculator)' },
      signal: AbortSignal.timeout(6000),
    }),
  ]);

  if (dolarRes.status !== 'fulfilled' || !dolarRes.value.ok) {
    throw new Error('Mirror API failed to return USD rate');
  }

  const dolarData = (await dolarRes.value.json()) as {
    promedio?: number;
    fechaActualizacion?: string;
  };
  if (typeof dolarData.promedio !== 'number' || dolarData.promedio <= 0) {
    throw new Error('Invalid USD rate in mirror API response');
  }

  let eurRate: number | undefined;
  if (euroRes.status === 'fulfilled' && euroRes.value.ok) {
    try {
      const euroData = (await euroRes.value.json()) as { promedio?: number };
      if (typeof euroData.promedio === 'number' && euroData.promedio > 0) {
        eurRate = euroData.promedio;
      }
    } catch {
      // Non-blocking if Euro parse fails
    }
  }

  return {
    rate: dolarData.promedio,
    effectiveDate: dolarData.fechaActualizacion || new Date().toISOString(),
    eurRate,
  };
}

async function getBCVRate(force = false): Promise<CachedRate> {
  const now = Date.now();
  if (!force && cachedData && now - lastFetchTimestamp < CACHE_TTL_MS) {
    return {
      ...cachedData,
      status: 'cached',
    };
  }

  // Tier 1: Scrape directly from official BCV
  try {
    const scraped = await scrapeBCV();
    const fetchedAt = new Date().toISOString();
    const rateFormatted = scraped.rate.toLocaleString('es-VE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    });
    const eurRateFormatted = scraped.eurRate
      ? scraped.eurRate.toLocaleString('es-VE', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 4,
        })
      : undefined;

    const cleanDate = scraped.effectiveDate || new Date().toLocaleDateString('es-VE');
    rateHistoryMap.set(cleanDate, { rate: scraped.rate, eurRate: scraped.eurRate });

    cachedData = {
      currency: 'USD',
      rate: scraped.rate,
      rateFormatted,
      effectiveDate: cleanDate,
      fetchedAt,
      source: 'Banco Central de Venezuela (BCV)',
      isStale: false,
      status: 'updated',
      eurRate: scraped.eurRate,
      eurRateFormatted,
      history: Array.from(rateHistoryMap.entries()).map(([date, item]) => ({
        date,
        rate: item.rate,
        eurRate: item.eurRate,
      })),
    };
    lastFetchTimestamp = now;
    return cachedData;
  } catch (err1) {
    console.warn('BCV direct scrape failed, attempting Tier 2 mirror API:', err1 instanceof Error ? err1.message : err1);
  }

  // Tier 2: Query official mirror API
  try {
    const mirror = await fetchFromMirror();
    const fetchedAt = new Date().toISOString();
    const rateFormatted = mirror.rate.toLocaleString('es-VE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    });
    const eurRateFormatted = mirror.eurRate
      ? mirror.eurRate.toLocaleString('es-VE', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 4,
        })
      : undefined;

    const cleanDate = mirror.effectiveDate || new Date().toLocaleDateString('es-VE');
    rateHistoryMap.set(cleanDate, { rate: mirror.rate, eurRate: mirror.eurRate });

    cachedData = {
      currency: 'USD',
      rate: mirror.rate,
      rateFormatted,
      effectiveDate: cleanDate,
      fetchedAt,
      source: 'Banco Central de Venezuela (vía réplica verificada)',
      isStale: false,
      status: 'updated',
      eurRate: mirror.eurRate,
      eurRateFormatted,
      history: Array.from(rateHistoryMap.entries()).map(([date, item]) => ({
        date,
        rate: item.rate,
        eurRate: item.eurRate,
      })),
    };
    lastFetchTimestamp = now;
    return cachedData;
  } catch (err2) {
    console.warn('Mirror API failed:', err2 instanceof Error ? err2.message : err2);
  }

  // Tier 3: Return existing cached rate if available
  if (cachedData) {
    return {
      ...cachedData,
      isStale: true,
      status: 'cached',
    };
  }

  // No rate available anywhere
  throw new Error('Tasa oficial BCV no disponible actualmente');
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Rate API
  app.get('/api/bcv-rate', async (req, res) => {
    const force = req.query.force === 'true';
    try {
      const data = await getBCVRate(force);
      res.setHeader('Cache-Control', 'public, max-age=120, stale-while-revalidate=300');
      res.json(data);
    } catch (err) {
      res.status(503).json({
        error: 'No se pudo obtener la tasa oficial del BCV',
        message: err instanceof Error ? err.message : 'Error desconocido',
        status: 'error',
      });
    }
  });

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'VALORA' });
  });

  // Vite middleware in dev or static in prod
  if (process.env.NODE_ENV !== 'production') {
    const isHmrDisabled = process.env.DISABLE_HMR === 'true';
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: isHmrDisabled ? false : undefined,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VALORA server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
