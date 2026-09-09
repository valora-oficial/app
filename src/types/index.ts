export type ForeignCurrency = 'USD' | 'EUR';
export type CurrencyCode = 'USD' | 'EUR' | 'VES';

export interface BCVRateData {
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
  eurHistory?: Array<{ date: string; rate: number }>;
}

export type RateStatusType =
  | 'updated'    // 🟢 Tasa actualizada
  | 'updating'   // 🟡 Actualizando tasa...
  | 'cached'     // 🟡 / ⚪ Última tasa disponible (en caché)
  | 'offline'    // ⚪ Sin conexión
  | 'error';     // 🔴 Tasa no disponible

export type ConversionDirection =
  | 'USD_TO_VES'
  | 'VES_TO_USD'
  | 'EUR_TO_VES'
  | 'VES_TO_EUR';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface CalculationHistoryItem {
  id: string;
  timestamp: number;
  sourceAmount: number;
  targetAmount: number;
  direction: ConversionDirection;
  rateUsed: number;
  formattedText: string;
  foreignCurrency?: ForeignCurrency;
}

export type ActiveTab = 'converter' | 'calculator' | 'tools' | 'history';
