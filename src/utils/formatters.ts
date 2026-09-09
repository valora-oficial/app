/**
 * Monetary and date formatting utilities for VALORA (Venezuela)
 */

/**
 * Format an amount into Venezuelan Bolívares format: Bs. 1.234.567,89
 */
export function formatBolivares(
  amount: number | null | undefined,
  includePrefix = true,
  decimals = 2,
): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return includePrefix ? 'Bs. 0,00' : '0,00';
  }

  // Round safely
  const rounded = Math.round((amount + Number.EPSILON) * Math.pow(10, decimals)) / Math.pow(10, decimals);

  const parts = rounded.toFixed(decimals).split('.');
  const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const decPart = parts[1] || '00';

  const formatted = `${intPart},${decPart}`;
  return includePrefix ? `Bs. ${formatted}` : formatted;
}

/**
 * Format an amount into USD format: USD 100,00 or $ 100,00
 */
export function formatUSD(
  amount: number | null | undefined,
  includeSymbol = true,
  symbolType: 'USD' | '$' = '$',
  decimals = 2,
): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return includeSymbol ? `${symbolType} 0,00` : '0,00';
  }

  const rounded = Math.round((amount + Number.EPSILON) * Math.pow(10, decimals)) / Math.pow(10, decimals);
  const parts = rounded.toFixed(decimals).split('.');
  const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const decPart = parts[1] || '00';

  const formatted = `${intPart},${decPart}`;
  return includeSymbol ? `${symbolType} ${formatted}` : formatted;
}

/**
 * Format an amount into EUR format: € 100,00 or EUR 100,00
 */
export function formatEUR(
  amount: number | null | undefined,
  includeSymbol = true,
  symbolType: 'EUR' | '€' = '€',
  decimals = 2,
): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return includeSymbol ? `${symbolType} 0,00` : '0,00';
  }

  const rounded = Math.round((amount + Number.EPSILON) * Math.pow(10, decimals)) / Math.pow(10, decimals);
  const parts = rounded.toFixed(decimals).split('.');
  const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const decPart = parts[1] || '00';

  const formatted = `${intPart},${decPart}`;
  return includeSymbol ? `${symbolType} ${formatted}` : formatted;
}

/**
 * Format an amount according to currency code (USD, EUR, VES)
 */
export function formatCurrency(
  amount: number | null | undefined,
  currency: 'USD' | 'EUR' | 'VES',
  decimals = 2,
): string {
  switch (currency) {
    case 'USD':
      return formatUSD(amount, true, '$', decimals);
    case 'EUR':
      return formatEUR(amount, true, '€', decimals);
    case 'VES':
      return formatBolivares(amount, true, decimals);
    default:
      return formatUSD(amount, true, '$', decimals);
  }
}

/**
 * Parse any user input string into a valid positive number
 * Handles both comma (,) and dot (.) as decimal delimiters
 */
export function parseCurrencyInput(value: string): number {
  if (!value) return 0;
  // Strip spaces and currency symbols
  let cleaned = value.replace(/[^\d.,]/g, '').trim();
  if (!cleaned) return 0;

  // If there are multiple dots and one comma: "1.250,50" -> 1250.50
  if (cleaned.includes(',') && cleaned.includes('.')) {
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  } else if (cleaned.includes(',')) {
    // Only commas: could be decimal comma like "100,50"
    cleaned = cleaned.replace(',', '.');
  } else {
    // Only dots: if dot is followed by exactly 2 digits at the end e.g. "100.50"
    // or thousand dots. For simple numeric inputs, standard dot is decimal.
  }

  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : Math.max(0, num);
}

/**
 * Format a date string or timestamp into Venezuela timezone format (America/Caracas)
 * Example: "08/09/2026 — 4:35 PM"
 */
export function formatVenezuelaDateTime(dateInput?: string | number | Date | null): string {
  if (!dateInput) return 'Fecha no disponible';

  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) {
      // If it's already a text date from BCV (like "Miércoles, 09 Septiembre 2026")
      if (typeof dateInput === 'string' && dateInput.length > 5) {
        return dateInput;
      }
      return 'Fecha no disponible';
    }

    const formatterDate = new Intl.DateTimeFormat('es-VE', {
      timeZone: 'America/Caracas',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    const formatterTime = new Intl.DateTimeFormat('es-VE', {
      timeZone: 'America/Caracas',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const dStr = formatterDate.format(date);
    const tStr = formatterTime.format(date);

    return `${dStr} — ${tStr}`;
  } catch {
    return typeof dateInput === 'string' ? dateInput : 'Fecha no disponible';
  }
}

/**
 * Calculate humanized relative time in Spanish
 * Example: "hace 2 min", "hace unos segundos", "hace 1 hora"
 */
export function formatRelativeTime(dateInput?: string | number | Date | null): string {
  if (!dateInput) return '';

  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '';

    const diffSeconds = Math.floor((Date.now() - date.getTime()) / 1000);

    if (diffSeconds < 45) return 'hace unos segundos';
    if (diffSeconds < 90) return 'hace 1 min';

    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `hace ${diffMinutes} min`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours === 1) return 'hace 1 hora';
    if (diffHours < 24) return `hace ${diffHours} horas`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'hace 1 día';
    return `hace ${diffDays} días`;
  } catch {
    return '';
  }
}
