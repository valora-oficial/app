import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowUpDown,
  Copy,
  Check,
  Share2,
  DollarSign,
  Euro,
  Coins,
  Sparkles,
} from 'lucide-react';
import { ConversionDirection, BCVRateData, ForeignCurrency } from '../types';
import {
  formatBolivares,
  formatUSD,
  formatEUR,
  parseCurrencyInput,
} from '../utils/formatters';

interface MainConverterProps {
  rateData: BCVRateData | null;
  onRecordHistory?: (item: {
    sourceAmount: number;
    targetAmount: number;
    direction: ConversionDirection;
    rateUsed: number;
    formattedText: string;
    foreignCurrency?: ForeignCurrency;
  }) => void;
  externalAmount?: { value: number; currency: 'USD' | 'EUR' | 'VES' } | null;
  selectedCurrency?: ForeignCurrency;
  onCurrencyChange?: (currency: ForeignCurrency) => void;
}

const PRESET_AMOUNTS = [1, 5, 10, 20, 50, 100, 500, 1000];

export const MainConverter: React.FC<MainConverterProps> = ({
  rateData,
  onRecordHistory,
  externalAmount,
  selectedCurrency = 'USD',
  onCurrencyChange,
}) => {
  const [foreignCurrency, setForeignCurrency] = useState<ForeignCurrency>(selectedCurrency);
  // 'FOREIGN_TO_VES' or 'VES_TO_FOREIGN'
  const [directionMode, setDirectionMode] = useState<'FOREIGN_TO_VES' | 'VES_TO_FOREIGN'>('FOREIGN_TO_VES');
  const [foreignInput, setForeignInput] = useState<string>('1');
  const [vesInput, setVesInput] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [shared, setShared] = useState<boolean>(false);

  // Keep internal currency state synced with parent prop
  useEffect(() => {
    if (selectedCurrency && selectedCurrency !== foreignCurrency) {
      setForeignCurrency(selectedCurrency);
    }
  }, [selectedCurrency]);

  const activeRate = useMemo(() => {
    if (!rateData) return 0;
    return foreignCurrency === 'USD' ? rateData.rate : (rateData.eurRate || 0);
  }, [rateData, foreignCurrency]);

  // Derived ConversionDirection for history
  const conversionDirection: ConversionDirection = useMemo(() => {
    if (foreignCurrency === 'USD') {
      return directionMode === 'FOREIGN_TO_VES' ? 'USD_TO_VES' : 'VES_TO_USD';
    } else {
      return directionMode === 'FOREIGN_TO_VES' ? 'EUR_TO_VES' : 'VES_TO_EUR';
    }
  }, [foreignCurrency, directionMode]);

  // Sync with incoming external calculation from the calculator
  useEffect(() => {
    if (externalAmount) {
      if (externalAmount.currency === 'USD') {
        setForeignCurrency('USD');
        onCurrencyChange?.('USD');
        setDirectionMode('FOREIGN_TO_VES');
        setForeignInput(externalAmount.value.toString());
      } else if (externalAmount.currency === 'EUR') {
        setForeignCurrency('EUR');
        onCurrencyChange?.('EUR');
        setDirectionMode('FOREIGN_TO_VES');
        setForeignInput(externalAmount.value.toString());
      } else {
        setDirectionMode('VES_TO_FOREIGN');
        setVesInput(externalAmount.value.toString());
      }
    }
  }, [externalAmount]);

  // Handle currency toggle
  const handleCurrencySwitch = (curr: ForeignCurrency) => {
    setForeignCurrency(curr);
    onCurrencyChange?.(curr);
    const newRate = curr === 'USD' ? (rateData?.rate || 0) : (rateData?.eurRate || 0);
    if (newRate > 0) {
      if (directionMode === 'FOREIGN_TO_VES') {
        const numForeign = parseCurrencyInput(foreignInput);
        if (numForeign > 0) {
          setVesInput((numForeign * newRate).toFixed(2));
        }
      } else {
        const numVes = parseCurrencyInput(vesInput);
        if (numVes > 0) {
          setForeignInput((numVes / newRate).toFixed(2));
        }
      }
    }
  };

  // Handle Foreign input change
  const handleForeignChange = (val: string) => {
    setForeignInput(val);
    if (activeRate > 0) {
      const numForeign = parseCurrencyInput(val);
      const calculatedVes = numForeign * activeRate;
      setVesInput(numForeign > 0 ? calculatedVes.toFixed(2) : '');
    }
  };

  // Handle VES input change
  const handleVesChange = (val: string) => {
    setVesInput(val);
    if (activeRate > 0) {
      const numVes = parseCurrencyInput(val);
      const calculatedForeign = numVes / activeRate;
      setForeignInput(numVes > 0 ? calculatedForeign.toFixed(2) : '');
    }
  };

  // Live recalculate when activeRate updates
  useEffect(() => {
    if (activeRate <= 0) return;
    if (directionMode === 'FOREIGN_TO_VES') {
      const numForeign = parseCurrencyInput(foreignInput);
      if (numForeign > 0) {
        setVesInput((numForeign * activeRate).toFixed(2));
      }
    } else {
      const numVes = parseCurrencyInput(vesInput);
      if (numVes > 0) {
        setForeignInput((numVes / activeRate).toFixed(2));
      }
    }
  }, [activeRate, directionMode]);

  // Swap direction
  const handleSwap = () => {
    setDirectionMode((prev) => (prev === 'FOREIGN_TO_VES' ? 'VES_TO_FOREIGN' : 'FOREIGN_TO_VES'));
  };

  // Quick preset click
  const handlePresetClick = (amount: number) => {
    if (directionMode === 'FOREIGN_TO_VES') {
      handleForeignChange(amount.toString());
    } else {
      if (activeRate > 0) {
        const equivalentVes = (amount * activeRate).toFixed(2);
        handleVesChange(equivalentVes);
      } else {
        handleVesChange(amount.toString());
      }
    }
  };

  // Calculated values for prominent display
  const currentForeignNum = parseCurrencyInput(foreignInput);
  const currentVesNum = parseCurrencyInput(vesInput);

  // Active result object
  const resultDisplay = useMemo(() => {
    const isUsd = foreignCurrency === 'USD';
    const foreignFormatter = isUsd ? formatUSD : formatEUR;
    const currencyName = isUsd ? 'USD' : 'EUR';

    if (directionMode === 'FOREIGN_TO_VES') {
      const ves = currentForeignNum * activeRate;
      return {
        source: foreignFormatter(currentForeignNum),
        target: formatBolivares(ves),
        targetRaw: ves,
        sourceNum: currentForeignNum,
        currencyName,
      };
    } else {
      const foreign = activeRate > 0 ? currentVesNum / activeRate : 0;
      return {
        source: formatBolivares(currentVesNum),
        target: foreignFormatter(foreign),
        targetRaw: foreign,
        sourceNum: currentVesNum,
        currencyName,
      };
    }
  }, [directionMode, foreignCurrency, currentForeignNum, currentVesNum, activeRate]);

  // Copy result
  const handleCopy = async () => {
    const textToCopy = `${resultDisplay.target}`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);

      // Save to calculation history
      if (onRecordHistory && resultDisplay.sourceNum > 0 && activeRate > 0) {
        onRecordHistory({
          sourceAmount: resultDisplay.sourceNum,
          targetAmount: resultDisplay.targetRaw,
          direction: conversionDirection,
          rateUsed: activeRate,
          formattedText: `${resultDisplay.source} = ${resultDisplay.target}`,
          foreignCurrency,
        });
      }
    } catch {
      // Fallback
    }
  };

  // Share result
  const handleShare = async () => {
    const shareText = `VALORA — ${resultDisplay.source} = ${resultDisplay.target} según tasa oficial BCV (Bs. ${formatBolivares(activeRate, false)} por ${resultDisplay.currencyName}).`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'VALORA — Conversión oficial BCV',
          text: shareText,
          url: window.location.href,
        });
        setShared(true);
        setTimeout(() => setShared(false), 2500);
      } catch {
        // user cancelled or share failed
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch {
        // ignore
      }
    }
  };

  const foreignSymbol = foreignCurrency === 'USD' ? '$' : '€';
  const foreignLabel = foreignCurrency === 'USD' ? 'DÓLARES (USD)' : 'EUROS (EUR)';

  return (
    <div className="w-full rounded-2xl bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 shadow-sm p-4 sm:p-6 space-y-5 text-black dark:text-white transition-colors duration-200">
      {/* 1. Currency Selector Pill Bar */}
      <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 border-b border-slate-200 dark:border-zinc-800 pb-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-black dark:text-white">
          <Sparkles className="w-3.5 h-3.5 text-current" />
          <span>Seleccionar divisa:</span>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl border border-slate-300 dark:border-zinc-700 w-full xs:w-auto">
          <button
            type="button"
            onClick={() => handleCurrencySwitch('USD')}
            className={`flex-1 xs:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              foreignCurrency === 'USD'
                ? 'bg-white dark:bg-zinc-900 text-black dark:text-white shadow-xs border border-slate-300 dark:border-zinc-700'
                : 'text-slate-700 dark:text-zinc-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5 text-current" />
            <span>Dólar (USD)</span>
          </button>

          <button
            type="button"
            onClick={() => handleCurrencySwitch('EUR')}
            className={`flex-1 xs:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              foreignCurrency === 'EUR'
                ? 'bg-white dark:bg-zinc-900 text-black dark:text-white shadow-xs border border-slate-300 dark:border-zinc-700'
                : 'text-slate-700 dark:text-zinc-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <Euro className="w-3.5 h-3.5 text-current" />
            <span>Euro (EUR)</span>
          </button>
        </div>
      </div>

      {/* 2. Rate Information Callout */}
      <div className="flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
        <span className="text-slate-700 dark:text-zinc-400 font-medium">
          Tasa oficial aplicada:
        </span>
        <span className="font-black text-black dark:text-white tabular-nums">
          1 {foreignCurrency} = {activeRate > 0 ? formatBolivares(activeRate) : 'No disponible'}
        </span>
      </div>

      {/* 3. Prominent Conversion Boxes */}
      <div className="flex flex-col gap-3 relative">
        {/* Top Field (Source) */}
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-950 border-2 border-slate-300 dark:border-zinc-800 focus-within:border-black dark:focus-within:border-white focus-within:ring-2 focus-within:ring-black/10 dark:focus-within:ring-white/10 transition">
          <div className="flex items-center justify-between text-xs font-bold text-black dark:text-white mb-1">
            <label htmlFor="source-input" className="flex items-center gap-1.5 cursor-pointer">
              {directionMode === 'FOREIGN_TO_VES' ? (
                <>
                  {foreignCurrency === 'USD' ? (
                    <DollarSign className="w-3.5 h-3.5 text-current" />
                  ) : (
                    <Euro className="w-3.5 h-3.5 text-current" />
                  )}
                  <span>{foreignLabel}</span>
                </>
              ) : (
                <>
                  <Coins className="w-3.5 h-3.5 text-current" />
                  <span>BOLÍVARES (VES)</span>
                </>
              )}
            </label>
            <span className="text-[11px] font-semibold text-slate-600 dark:text-zinc-400">
              {directionMode === 'FOREIGN_TO_VES'
                ? `Cantidad en ${foreignSymbol}`
                : 'Cantidad en Bs.'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl font-black text-black dark:text-white select-none">
              {directionMode === 'FOREIGN_TO_VES' ? foreignSymbol : 'Bs.'}
            </span>
            <input
              id="source-input"
              type="text"
              inputMode="decimal"
              placeholder="0,00"
              value={directionMode === 'FOREIGN_TO_VES' ? foreignInput : vesInput}
              onChange={(e) =>
                directionMode === 'FOREIGN_TO_VES'
                  ? handleForeignChange(e.target.value)
                  : handleVesChange(e.target.value)
              }
              className="w-full bg-transparent text-2xl sm:text-3xl font-black text-black dark:text-white outline-none tabular-nums placeholder:text-slate-400 dark:placeholder:text-zinc-600"
            />
          </div>
        </div>

        {/* Central Swap Button */}
        <div className="flex justify-center -my-2 z-10">
          <button
            onClick={handleSwap}
            type="button"
            className="w-10 h-10 rounded-full bg-black dark:bg-zinc-800 hover:bg-slate-800 dark:hover:bg-zinc-700 active:bg-black text-white shadow-md border border-transparent dark:border-zinc-700 flex items-center justify-center transition transform active:scale-90 hover:rotate-180 duration-200 cursor-pointer"
            title={`Intercambiar dirección (${foreignCurrency} ⇄ VES)`}
            aria-label="Intercambiar divisas"
          >
            <ArrowUpDown className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Bottom Field (Target) */}
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-950 border-2 border-slate-300 dark:border-zinc-800 focus-within:border-black dark:focus-within:border-white focus-within:ring-2 focus-within:ring-black/10 dark:focus-within:ring-white/10 transition">
          <div className="flex items-center justify-between text-xs font-bold text-black dark:text-white mb-1">
            <label htmlFor="target-input" className="flex items-center gap-1.5 cursor-pointer">
              {directionMode === 'FOREIGN_TO_VES' ? (
                <>
                  <Coins className="w-3.5 h-3.5 text-current" />
                  <span>BOLÍVARES (VES)</span>
                </>
              ) : (
                <>
                  {foreignCurrency === 'USD' ? (
                    <DollarSign className="w-3.5 h-3.5 text-current" />
                  ) : (
                    <Euro className="w-3.5 h-3.5 text-current" />
                  )}
                  <span>{foreignLabel}</span>
                </>
              )}
            </label>
            <span className="text-[11px] font-semibold text-slate-600 dark:text-zinc-400">
              {directionMode === 'FOREIGN_TO_VES'
                ? 'Resultado en Bs.'
                : `Resultado en ${foreignSymbol}`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl font-black text-black dark:text-white select-none">
              {directionMode === 'FOREIGN_TO_VES' ? 'Bs.' : foreignSymbol}
            </span>
            <input
              id="target-input"
              type="text"
              inputMode="decimal"
              placeholder="0,00"
              value={directionMode === 'FOREIGN_TO_VES' ? vesInput : foreignInput}
              onChange={(e) =>
                directionMode === 'FOREIGN_TO_VES'
                  ? handleVesChange(e.target.value)
                  : handleForeignChange(e.target.value)
              }
              className="w-full bg-transparent text-2xl sm:text-3xl font-black text-black dark:text-white outline-none tabular-nums placeholder:text-slate-400 dark:placeholder:text-zinc-600"
            />
          </div>
        </div>
      </div>

      {/* 4. Quick Amount Chips */}
      <div>
        <div className="text-xs font-bold text-black dark:text-white mb-2">
          Cantidades rápidas ({foreignCurrency}):
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_AMOUNTS.map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => handlePresetClick(amt)}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-zinc-800 text-black dark:text-white hover:bg-slate-200 dark:hover:bg-zinc-700 border border-slate-300 dark:border-zinc-700 active:scale-95 transition cursor-pointer"
            >
              {foreignSymbol}{amt}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Prominent Highlighted Result Card */}
      {resultDisplay.sourceNum > 0 && activeRate > 0 && (
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-950 text-black dark:text-white border-2 border-black dark:border-white shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-700 dark:text-zinc-400 font-bold mb-1">
            <span>Conversión oficial BCV ({foreignCurrency})</span>
            <span className="text-[11px] text-black dark:text-white font-black">
              Tasa: Bs. {formatBolivares(activeRate, false)}
            </span>
          </div>

          <div className="text-xs text-slate-700 dark:text-zinc-400 font-medium">
            {resultDisplay.source} equivalen a:
          </div>

          <div className="text-2xl sm:text-3xl font-black text-black dark:text-white tracking-tight my-1 tabular-nums">
            {resultDisplay.target}
          </div>

          {/* Action buttons: Copiar y Compartir */}
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-zinc-800">
            <button
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 active:bg-slate-300 text-black dark:text-white border border-slate-300 dark:border-zinc-700 transition cursor-pointer"
              title="Copiar resultado al portapapeles"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 font-bold" />
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar resultado</span>
                </>
              )}
            </button>

            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 active:bg-slate-300 text-black dark:text-white border border-slate-300 dark:border-zinc-700 transition cursor-pointer"
              title="Compartir resultado"
            >
              {shared ? (
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 font-bold" />
              ) : (
                <Share2 className="w-3.5 h-3.5" />
              )}
              <span className="hidden xs:inline">Compartir</span>
            </button>
          </div>
        </div>
      )}

      {/* Discrete Legal Note */}
      <p className="text-[11px] text-center text-slate-600 dark:text-zinc-500 leading-normal">
        Las tasas mostradas corresponden a la información oficial disponible del Banco Central de Venezuela (BCV).
      </p>
    </div>
  );
};
