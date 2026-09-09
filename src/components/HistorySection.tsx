import React, { useState } from 'react';
import { History, TrendingUp, Trash2, Calendar, DollarSign, Euro } from 'lucide-react';
import { CalculationHistoryItem, BCVRateData, ForeignCurrency } from '../types';
import { formatBolivares } from '../utils/formatters';

interface HistorySectionProps {
  rateData: BCVRateData | null;
  historyItems: CalculationHistoryItem[];
  onClearHistory: () => void;
}

export const HistorySection: React.FC<HistorySectionProps> = ({
  rateData,
  historyItems,
  onClearHistory,
}) => {
  const [chartRange, setChartRange] = useState<'7' | '30'>('7');
  const [selectedCurrency, setSelectedCurrency] = useState<ForeignCurrency>('USD');

  // Compute history for USD and EUR
  const bcvHistory = React.useMemo(() => {
    if (!rateData) return [];

    const usdHistory = rateData.history && rateData.history.length > 0
      ? rateData.history
      : [{ date: rateData.effectiveDate || 'Hoy', rate: rateData.rate }];

    if (selectedCurrency === 'USD') {
      return usdHistory;
    } else {
      // If EUR is selected:
      // If eurHistory is present, use it. Otherwise calculate proportional EUR history using eurRate / rate
      const ratio = (rateData.eurRate && rateData.rate > 0) ? (rateData.eurRate / rateData.rate) : 1.16;
      if (rateData.eurHistory && rateData.eurHistory.length > 0) {
        return rateData.eurHistory;
      }
      return usdHistory.map((h) => ({
        date: h.date,
        rate: Number((h.rate * ratio).toFixed(4)),
      }));
    }
  }, [rateData, selectedCurrency]);

  const activeRate = selectedCurrency === 'USD'
    ? (rateData?.rate || 0)
    : (rateData?.eurRate || 0);

  // Prepare points for lightweight SVG chart if history exists
  const maxRate = Math.max(...bcvHistory.map((h) => h.rate), 1);
  const minRate = Math.min(...bcvHistory.map((h) => h.rate), 0);
  const rangeDiff = maxRate - minRate || 1;

  return (
    <div className="w-full rounded-2xl bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 shadow-sm p-4 sm:p-6 space-y-6 text-black dark:text-white transition-colors duration-200">
      {/* 1. BCV Official Rate Evolution Section */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-black dark:text-white border border-slate-300 dark:border-zinc-700">
              <TrendingUp className="w-4 h-4 text-current" />
            </span>
            <h3 className="text-sm font-bold text-black dark:text-white">
              Evolución de la Tasa BCV
            </h3>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Currency selector: USD vs EUR */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-lg border border-slate-300 dark:border-zinc-700 text-xs font-bold">
              <button
                type="button"
                onClick={() => setSelectedCurrency('USD')}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-md transition cursor-pointer ${
                  selectedCurrency === 'USD'
                    ? 'bg-white dark:bg-zinc-900 text-black dark:text-white shadow-xs border border-slate-300 dark:border-zinc-700'
                    : 'text-slate-700 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                }`}
              >
                <DollarSign className="w-3 h-3 text-current" />
                <span>USD</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedCurrency('EUR')}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-md transition cursor-pointer ${
                  selectedCurrency === 'EUR'
                    ? 'bg-white dark:bg-zinc-900 text-black dark:text-white shadow-xs border border-slate-300 dark:border-zinc-700'
                    : 'text-slate-700 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                }`}
              >
                <Euro className="w-3 h-3 text-current" />
                <span>EUR</span>
              </button>
            </div>

            {/* Time range */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-lg border border-slate-300 dark:border-zinc-700 text-xs font-bold">
              <button
                type="button"
                onClick={() => setChartRange('7')}
                className={`px-2 py-0.5 rounded-md transition cursor-pointer ${
                  chartRange === '7'
                    ? 'bg-white dark:bg-zinc-900 text-black dark:text-white shadow-xs border border-slate-300 dark:border-zinc-700'
                    : 'text-slate-700 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                }`}
              >
                7 días
              </button>
              <button
                type="button"
                onClick={() => setChartRange('30')}
                className={`px-2 py-0.5 rounded-md transition cursor-pointer ${
                  chartRange === '30'
                    ? 'bg-white dark:bg-zinc-900 text-black dark:text-white shadow-xs border border-slate-300 dark:border-zinc-700'
                    : 'text-slate-700 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                }`}
              >
                30 días
              </button>
            </div>
          </div>
        </div>

        {/* Minimalist SVG Graph */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800">
          <div className="h-36 w-full flex items-end justify-between gap-2 pt-4">
            {bcvHistory.map((item, idx) => {
              const heightPercent = Math.max(
                15,
                Math.min(100, ((item.rate - minRate) / rangeDiff) * 80 + 20),
              );

              return (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center justify-end h-full group relative"
                >
                  {/* Tooltip on hover */}
                  <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition pointer-events-none bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold py-0.5 px-1.5 rounded whitespace-nowrap z-20">
                    Bs. {formatBolivares(item.rate, false)}
                  </div>

                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full max-w-[36px] rounded-t-md transition-all duration-300 ${
                      selectedCurrency === 'USD'
                        ? 'bg-slate-700 dark:bg-zinc-400 hover:bg-black dark:hover:bg-white'
                        : 'bg-slate-600 dark:bg-zinc-500 hover:bg-black dark:hover:bg-white'
                    }`}
                  />

                  <div className="mt-2 text-[10px] text-slate-700 dark:text-zinc-400 font-semibold truncate w-full text-center">
                    {item.date.split(',')[0]}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between text-[11px] text-slate-700 dark:text-zinc-400">
            <span>
              Tasa oficial {selectedCurrency}: <strong className="font-black text-black dark:text-white">Bs. {formatBolivares(activeRate, false)}</strong>
            </span>
            <span>Fuente: Banco Central de Venezuela</span>
          </div>
        </div>

        {/* Official Rates List */}
        <div className="divide-y divide-slate-200 dark:divide-zinc-800 rounded-xl border border-slate-300 dark:border-zinc-800 overflow-hidden text-xs">
          {bcvHistory.map((entry, i) => (
            <div
              key={i}
              className="p-3 bg-white dark:bg-zinc-950 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-black dark:text-white" />
                <span className="font-bold text-black dark:text-white">
                  {entry.date}
                </span>
              </div>
              <div className="font-black text-black dark:text-white tabular-nums">
                {formatBolivares(entry.rate)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. User Conversions History */}
      <div className="space-y-3 pt-4 border-t border-slate-300 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-black dark:text-white border border-slate-300 dark:border-zinc-700">
              <History className="w-4 h-4 text-current" />
            </span>
            <h3 className="text-sm font-bold text-black dark:text-white">
              Cálculos Recientes Locales
            </h3>
          </div>

          {historyItems.length > 0 && (
            <button
              onClick={onClearHistory}
              className="flex items-center gap-1 text-xs font-bold text-rose-700 dark:text-rose-400 hover:underline cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Borrar historial</span>
            </button>
          )}
        </div>

        {historyItems.length === 0 ? (
          <div className="p-6 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 text-center text-xs text-slate-700 dark:text-zinc-400 font-medium">
            Aún no has realizado conversiones en esta sesión. Tus cálculos recientes se guardarán aquí de forma privada en tu dispositivo.
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-zinc-800 rounded-xl border border-slate-300 dark:border-zinc-800 overflow-hidden text-xs">
            {historyItems.map((item) => {
              const isEur = item.foreignCurrency === 'EUR' || item.direction?.includes('EUR');
              return (
                <div
                  key={item.id}
                  className="p-3 bg-white dark:bg-zinc-950 flex items-center justify-between gap-2"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-black dark:text-white border border-slate-300 dark:border-zinc-700"
                      >
                        {isEur ? 'EUR' : 'USD'}
                      </span>
                      <span className="font-bold text-black dark:text-white">
                        {item.formattedText}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-700 dark:text-zinc-400 mt-0.5 pl-0.5 font-medium">
                      Tasa: Bs. {formatBolivares(item.rateUsed, false)} por {isEur ? 'EUR' : 'USD'}
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-600 dark:text-zinc-400 font-semibold whitespace-nowrap">
                    {new Date(item.timestamp).toLocaleTimeString('es-VE', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
