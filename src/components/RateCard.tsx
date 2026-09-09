import React from 'react';
import { RefreshCw, ShieldCheck, AlertTriangle, Building2, DollarSign, Euro, Check } from 'lucide-react';
import { BCVRateData, RateStatusType, ForeignCurrency } from '../types';
import { formatBolivares, formatVenezuelaDateTime } from '../utils/formatters';

interface RateCardProps {
  rateData: BCVRateData | null;
  status: RateStatusType;
  isUpdating: boolean;
  relativeTime: string;
  onRefresh: () => void;
  selectedCurrency?: ForeignCurrency;
  onSelectCurrency?: (currency: ForeignCurrency) => void;
}

export const RateCard: React.FC<RateCardProps> = ({
  rateData,
  status,
  isUpdating,
  relativeTime,
  onRefresh,
  selectedCurrency = 'USD',
  onSelectCurrency,
}) => {
  const isStale = rateData?.isStale ?? true;
  const hasRate = !!(rateData && rateData.rate > 0);
  const hasEurRate = !!(rateData?.eurRate && rateData.eurRate > 0);

  return (
    <div className="w-full rounded-2xl bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 shadow-sm p-4 sm:p-5 relative overflow-hidden transition-all text-black dark:text-white">
      {/* Decorative subtle ambient accent in top-right corner */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-slate-100 dark:bg-zinc-800/40 rounded-full blur-2xl pointer-events-none" />

      {/* Top bar: Badge & Refresh button */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-slate-100 dark:bg-zinc-800 text-black dark:text-white border border-slate-300 dark:border-zinc-700">
            <Building2 className="w-3.5 h-3.5 text-current" />
          </span>
          <span className="text-xs font-black tracking-wider uppercase text-black dark:text-white">
            TASAS OFICIALES BCV
          </span>
        </div>

        <button
          onClick={onRefresh}
          disabled={isUpdating}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-black dark:text-white bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 active:scale-95 disabled:opacity-50 border border-slate-300 dark:border-zinc-700 transition cursor-pointer"
          title="Consultar actualización de las tasas del BCV"
          aria-label="Actualizar tasas BCV"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 text-current ${
              isUpdating ? 'animate-spin' : ''
            }`}
          />
          <span className="hidden xs:inline">
            {isUpdating ? 'Actualizando...' : 'Actualizar tasas'}
          </span>
        </button>
      </div>

      {/* Interactive Dual Rate Grid: Dólar (USD) & Euro (EUR) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2">
        {/* USD Card */}
        <div
          onClick={() => onSelectCurrency?.('USD')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelectCurrency?.('USD')}
          className={`p-3.5 rounded-xl border-2 transition-all text-left relative overflow-hidden cursor-pointer select-none ${
            selectedCurrency === 'USD'
              ? 'bg-white dark:bg-zinc-800 border-black dark:border-white shadow-md ring-2 ring-black/10 dark:ring-white/10'
              : 'bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 hover:border-slate-400 dark:hover:border-zinc-700 hover:bg-white dark:hover:bg-zinc-900'
          }`}
        >
          <div className="flex items-center justify-between text-xs mb-1.5">
            <div className="flex items-center gap-1.5 font-black text-black dark:text-white">
              <span className="p-1 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-black dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                <DollarSign className="w-3.5 h-3.5" />
              </span>
              <span>DÓLAR (USD)</span>
            </div>
            {selectedCurrency === 'USD' ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-black dark:bg-white text-white dark:text-black shadow-xs">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
                <span>Activo</span>
              </span>
            ) : (
              <span className="text-[11px] font-bold text-slate-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition">
                Toca para usar
              </span>
            )}
          </div>

          <div className="text-2xl sm:text-3xl font-black text-black dark:text-white tracking-tight tabular-nums">
            {hasRate ? formatBolivares(rateData.rate) : 'No disponible'}
          </div>
          <div className="text-[11px] text-slate-700 dark:text-zinc-400 font-medium mt-0.5">
            1 USD oficial en Bolívares
          </div>
        </div>

        {/* EUR Card */}
        <div
          onClick={() => onSelectCurrency?.('EUR')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelectCurrency?.('EUR')}
          className={`p-3.5 rounded-xl border-2 transition-all text-left relative overflow-hidden cursor-pointer select-none ${
            selectedCurrency === 'EUR'
              ? 'bg-white dark:bg-zinc-800 border-black dark:border-white shadow-md ring-2 ring-black/10 dark:ring-white/10'
              : 'bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 hover:border-slate-400 dark:hover:border-zinc-700 hover:bg-white dark:hover:bg-zinc-900'
          }`}
        >
          <div className="flex items-center justify-between text-xs mb-1.5">
            <div className="flex items-center gap-1.5 font-black text-black dark:text-white">
              <span className="p-1 rounded-md bg-blue-100 dark:bg-blue-950/80 text-black dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                <Euro className="w-3.5 h-3.5" />
              </span>
              <span>EURO (EUR)</span>
            </div>
            {selectedCurrency === 'EUR' ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-black dark:bg-white text-white dark:text-black shadow-xs">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
                <span>Activo</span>
              </span>
            ) : (
              <span className="text-[11px] font-bold text-slate-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition">
                Toca para usar
              </span>
            )}
          </div>

          <div className="text-2xl sm:text-3xl font-black text-black dark:text-white tracking-tight tabular-nums">
            {hasEurRate ? formatBolivares(rateData.eurRate!) : 'No disponible'}
          </div>
          <div className="text-[11px] text-slate-700 dark:text-zinc-400 font-medium mt-0.5">
            1 EUR oficial en Bolívares
          </div>
        </div>
      </div>

      {/* Stale / Offline Warning Banner */}
      {isStale && hasRate && (
        <div className="my-2.5 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700/60 flex items-start gap-2 text-xs text-black dark:text-amber-200">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-700 dark:text-amber-400" />
          <div>
            <div className="font-black text-black dark:text-amber-200">Últimas tasas disponibles</div>
            <div className="text-[11px] text-slate-800 dark:text-amber-300/80">
              No se pudo conectar con el BCV en este momento. Se están utilizando las últimas tasas registradas.
            </div>
          </div>
        </div>
      )}

      {/* Metadata & Timestamp footer */}
      <div className="pt-3 mt-2 border-t border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs text-slate-800 dark:text-zinc-400">
        <div className="flex items-center gap-1.5 flex-wrap">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
          <span>
            Fuente: <strong className="font-bold text-black dark:text-white">Banco Central de Venezuela</strong>
          </span>
          {rateData?.effectiveDate && (
            <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-black dark:text-white font-semibold border border-slate-200 dark:border-zinc-700">
              {rateData.effectiveDate}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-700 dark:text-zinc-400 font-medium">
          {rateData?.fetchedAt && (
            <span>
              Consultado: {formatVenezuelaDateTime(rateData.fetchedAt)}
            </span>
          )}
          {relativeTime && (
            <span className="text-black dark:text-white font-bold">
              ({relativeTime})
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

