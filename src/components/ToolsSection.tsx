import React, { useState, useMemo } from 'react';
import {
  Receipt,
  Tag,
  HeartHandshake,
  ShoppingBag,
  DollarSign,
  Euro,
  Coins,
} from 'lucide-react';
import { formatBolivares, formatUSD, formatEUR, parseCurrencyInput } from '../utils/formatters';

interface ToolsSectionProps {
  rate: number;
  eurRate?: number;
}

type ToolTab = 'iva' | 'discount' | 'tip' | 'multi';

export const ToolsSection: React.FC<ToolsSectionProps> = ({ rate, eurRate }) => {
  const [activeTool, setActiveTool] = useState<ToolTab>('iva');
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'VES'>('USD');

  // Helper for equivalent calculation across USD, EUR, and VES
  const getEquivalent = (total: number) => {
    if (currency === 'USD') {
      return rate > 0 ? formatBolivares(total * rate) : null;
    }
    if (currency === 'EUR') {
      return eurRate && eurRate > 0 ? formatBolivares(total * eurRate) : null;
    }
    // Currency is VES
    if (rate > 0 && eurRate && eurRate > 0) {
      return `${formatUSD(total / rate)} · ${formatEUR(total / eurRate)}`;
    }
    if (rate > 0) {
      return formatUSD(total / rate);
    }
    return null;
  };

  // IVA State
  const [ivaPriceInput, setIvaPriceInput] = useState<string>('100');
  const [ivaRate, setIvaRate] = useState<number>(16); // 16% default in Venezuela
  const [customIva, setCustomIva] = useState<string>('');

  // Discount State
  const [discPriceInput, setDiscPriceInput] = useState<string>('50');
  const [discPercentInput, setDiscPercentInput] = useState<number>(20);

  // Tip State
  const [tipSubtotalInput, setTipSubtotalInput] = useState<string>('30');
  const [tipPercent, setTipPercent] = useState<number>(10);

  // Multi-item State
  const [unitPriceInput, setUnitPriceInput] = useState<string>('12.50');
  const [quantityInput, setQuantityInput] = useState<string>('4');

  // Calculations
  const ivaCalculations = useMemo(() => {
    const subtotal = parseCurrencyInput(ivaPriceInput);
    const selectedRate = customIva !== '' ? parseCurrencyInput(customIva) : ivaRate;
    const ivaAmount = (subtotal * selectedRate) / 100;
    const total = subtotal + ivaAmount;

    return {
      subtotal,
      selectedRate,
      ivaAmount,
      total,
      equivalentTotal: getEquivalent(total),
    };
  }, [ivaPriceInput, ivaRate, customIva, rate, eurRate, currency]);

  const discountCalculations = useMemo(() => {
    const base = parseCurrencyInput(discPriceInput);
    const discountAmount = (base * discPercentInput) / 100;
    const total = Math.max(0, base - discountAmount);

    return {
      base,
      discountAmount,
      total,
      equivalentTotal: getEquivalent(total),
    };
  }, [discPriceInput, discPercentInput, rate, eurRate, currency]);

  const tipCalculations = useMemo(() => {
    const subtotal = parseCurrencyInput(tipSubtotalInput);
    const tipAmount = (subtotal * tipPercent) / 100;
    const total = subtotal + tipAmount;

    return {
      subtotal,
      tipAmount,
      total,
      equivalentTotal: getEquivalent(total),
    };
  }, [tipSubtotalInput, tipPercent, rate, eurRate, currency]);

  const multiCalculations = useMemo(() => {
    const unit = parseCurrencyInput(unitPriceInput);
    const qty = Math.max(1, parseCurrencyInput(quantityInput) || 1);
    const total = unit * qty;

    return {
      unit,
      qty,
      total,
      equivalentTotal: getEquivalent(total),
    };
  }, [unitPriceInput, quantityInput, rate, eurRate, currency]);

  const formatWithCurrency = (amount: number) => {
    if (currency === 'USD') return formatUSD(amount);
    if (currency === 'EUR') return formatEUR(amount);
    return formatBolivares(amount);
  };

  return (
    <div className="w-full rounded-2xl bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 shadow-sm p-4 sm:p-6 space-y-5 text-black dark:text-white transition-colors duration-200">
      {/* Sub-navigation tabs & currency switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-zinc-800 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveTool('iva')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              activeTool === 'iva'
                ? 'bg-black dark:bg-white text-white dark:text-black shadow-xs'
                : 'bg-slate-100 dark:bg-zinc-800 text-black dark:text-white border border-slate-300 dark:border-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-700'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>IVA</span>
          </button>

          <button
            onClick={() => setActiveTool('discount')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              activeTool === 'discount'
                ? 'bg-black dark:bg-white text-white dark:text-black shadow-xs'
                : 'bg-slate-100 dark:bg-zinc-800 text-black dark:text-white border border-slate-300 dark:border-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-700'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Descuento</span>
          </button>

          <button
            onClick={() => setActiveTool('tip')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              activeTool === 'tip'
                ? 'bg-black dark:bg-white text-white dark:text-black shadow-xs'
                : 'bg-slate-100 dark:bg-zinc-800 text-black dark:text-white border border-slate-300 dark:border-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-700'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Propina</span>
          </button>

          <button
            onClick={() => setActiveTool('multi')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              activeTool === 'multi'
                ? 'bg-black dark:bg-white text-white dark:text-black shadow-xs'
                : 'bg-slate-100 dark:bg-zinc-800 text-black dark:text-white border border-slate-300 dark:border-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-700'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Multi-artículo</span>
          </button>
        </div>

        {/* Currency Switcher: USD, EUR, VES */}
        <div className="flex items-center self-end sm:self-auto gap-1 bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-lg border border-slate-300 dark:border-zinc-700 text-xs font-bold">
          <button
            onClick={() => setCurrency('USD')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition cursor-pointer ${
              currency === 'USD'
                ? 'bg-white dark:bg-zinc-900 text-black dark:text-white shadow-xs border border-slate-300 dark:border-zinc-700'
                : 'text-slate-700 dark:text-zinc-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <DollarSign className="w-3 h-3 text-current" />
            <span>USD</span>
          </button>
          <button
            onClick={() => setCurrency('EUR')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition cursor-pointer ${
              currency === 'EUR'
                ? 'bg-white dark:bg-zinc-900 text-black dark:text-white shadow-xs border border-slate-300 dark:border-zinc-700'
                : 'text-slate-700 dark:text-zinc-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <Euro className="w-3 h-3 text-current" />
            <span>EUR</span>
          </button>
          <button
            onClick={() => setCurrency('VES')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition cursor-pointer ${
              currency === 'VES'
                ? 'bg-white dark:bg-zinc-900 text-black dark:text-white shadow-xs border border-slate-300 dark:border-zinc-700'
                : 'text-slate-700 dark:text-zinc-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <Coins className="w-3 h-3 text-current" />
            <span>VES</span>
          </button>
        </div>
      </div>

      {/* IVA Tool */}
      {activeTool === 'iva' && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-black dark:text-white mb-1">
              Precio base ({currency}):
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={ivaPriceInput}
              onChange={(e) => setIvaPriceInput(e.target.value)}
              placeholder="0,00"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-950 border-2 border-slate-300 dark:border-zinc-800 text-lg font-black text-black dark:text-white outline-none focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 tabular-nums"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
              Porcentaje de IVA:
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {[
                { label: '16% (General)', val: 16 },
                { label: '8% (Reducido)', val: 8 },
                { label: '0% (Exento)', val: 0 },
              ].map((item) => (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => {
                    setIvaRate(item.val);
                    setCustomIva('');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    ivaRate === item.val && customIva === ''
                      ? 'bg-black dark:bg-white text-white dark:text-black shadow-xs'
                      : 'bg-slate-100 dark:bg-zinc-800 text-black dark:text-white border border-slate-300 dark:border-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}

              <div className="flex items-center gap-1">
                <input
                  type="number"
                  placeholder="Otro %"
                  value={customIva}
                  onChange={(e) => setCustomIva(e.target.value)}
                  className="w-20 px-2 py-1.5 rounded-lg bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 text-xs font-bold text-black dark:text-white outline-none"
                />
                <span className="text-xs text-black dark:text-white font-bold">%</span>
              </div>
            </div>
          </div>

          {/* Breakdown Card */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 space-y-2">
            <div className="flex justify-between text-xs text-slate-800 dark:text-zinc-300">
              <span>Subtotal:</span>
              <span className="font-bold text-black dark:text-white tabular-nums">
                {formatWithCurrency(ivaCalculations.subtotal)}
              </span>
            </div>
            <div className="flex justify-between text-xs text-slate-800 dark:text-zinc-300">
              <span>IVA ({ivaCalculations.selectedRate}%):</span>
              <span className="font-bold text-black dark:text-white tabular-nums">
                +{formatWithCurrency(ivaCalculations.ivaAmount)}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-200 dark:border-zinc-800 flex justify-between items-baseline text-sm">
              <span className="font-black text-black dark:text-white">
                Total a pagar:
              </span>
              <div className="text-right">
                <div className="text-xl font-black text-black dark:text-white tabular-nums">
                  {formatWithCurrency(ivaCalculations.total)}
                </div>
                {ivaCalculations.equivalentTotal && (
                  <div className="text-xs text-slate-700 dark:text-zinc-400 font-medium">
                    ≈ {ivaCalculations.equivalentTotal} (BCV)
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Discount Tool */}
      {activeTool === 'discount' && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-black dark:text-white mb-1">
              Precio original ({currency}):
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={discPriceInput}
              onChange={(e) => setDiscPriceInput(e.target.value)}
              placeholder="0,00"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-950 border-2 border-slate-300 dark:border-zinc-800 text-lg font-black text-black dark:text-white outline-none focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 tabular-nums"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
              Porcentaje de descuento:
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {[5, 10, 15, 20, 30, 50].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setDiscPercentInput(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    discPercentInput === p
                      ? 'bg-black dark:bg-white text-white dark:text-black shadow-xs'
                      : 'bg-slate-100 dark:bg-zinc-800 text-black dark:text-white border border-slate-300 dark:border-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {p}%
                </button>
              ))}
            </div>
          </div>

          {/* Breakdown Card */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 space-y-2">
            <div className="flex justify-between text-xs text-slate-800 dark:text-zinc-300">
              <span>Precio original:</span>
              <span className="font-bold text-black dark:text-white tabular-nums">
                {formatWithCurrency(discountCalculations.base)}
              </span>
            </div>
            <div className="flex justify-between text-xs text-slate-800 dark:text-zinc-300">
              <span>Ahorras ({discPercentInput}%):</span>
              <span className="font-bold text-black dark:text-white tabular-nums">
                -{formatWithCurrency(discountCalculations.discountAmount)}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-200 dark:border-zinc-800 flex justify-between items-baseline text-sm">
              <span className="font-black text-black dark:text-white">
                Total final:
              </span>
              <div className="text-right">
                <div className="text-xl font-black text-black dark:text-white tabular-nums">
                  {formatWithCurrency(discountCalculations.total)}
                </div>
                {discountCalculations.equivalentTotal && (
                  <div className="text-xs text-slate-700 dark:text-zinc-400 font-medium">
                    ≈ {discountCalculations.equivalentTotal} (BCV)
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tip Tool */}
      {activeTool === 'tip' && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-black dark:text-white mb-1">
              Subtotal de la cuenta ({currency}):
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={tipSubtotalInput}
              onChange={(e) => setTipSubtotalInput(e.target.value)}
              placeholder="0,00"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-950 border-2 border-slate-300 dark:border-zinc-800 text-lg font-black text-black dark:text-white outline-none focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 tabular-nums"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
              Porcentaje de propina:
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {[5, 10, 12, 15, 20].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTipPercent(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    tipPercent === t
                      ? 'bg-black dark:bg-white text-white dark:text-black shadow-xs'
                      : 'bg-slate-100 dark:bg-zinc-800 text-black dark:text-white border border-slate-300 dark:border-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {t}%
                </button>
              ))}
            </div>
          </div>

          {/* Breakdown Card */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 space-y-2">
            <div className="flex justify-between text-xs text-slate-800 dark:text-zinc-300">
              <span>Cuenta:</span>
              <span className="font-bold text-black dark:text-white tabular-nums">
                {formatWithCurrency(tipCalculations.subtotal)}
              </span>
            </div>
            <div className="flex justify-between text-xs text-slate-800 dark:text-zinc-300">
              <span>Propina sugerida ({tipPercent}%):</span>
              <span className="font-bold text-black dark:text-white tabular-nums">
                +{formatWithCurrency(tipCalculations.tipAmount)}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-200 dark:border-zinc-800 flex justify-between items-baseline text-sm">
              <span className="font-black text-black dark:text-white">
                Total con propina:
              </span>
              <div className="text-right">
                <div className="text-xl font-black text-black dark:text-white tabular-nums">
                  {formatWithCurrency(tipCalculations.total)}
                </div>
                {tipCalculations.equivalentTotal && (
                  <div className="text-xs text-slate-700 dark:text-zinc-400 font-medium">
                    ≈ {tipCalculations.equivalentTotal} (BCV)
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Multi-item Tool */}
      {activeTool === 'multi' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-black dark:text-white mb-1">
                Precio unitario ({currency}):
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={unitPriceInput}
                onChange={(e) => setUnitPriceInput(e.target.value)}
                placeholder="0,00"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-950 border-2 border-slate-300 dark:border-zinc-800 text-lg font-black text-black dark:text-white outline-none focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-black dark:text-white mb-1">
                Cantidad:
              </label>
              <input
                type="number"
                min="1"
                value={quantityInput}
                onChange={(e) => setQuantityInput(e.target.value)}
                placeholder="1"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-950 border-2 border-slate-300 dark:border-zinc-800 text-lg font-black text-black dark:text-white outline-none focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 tabular-nums"
              />
            </div>
          </div>

          {/* Breakdown Card */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 space-y-2">
            <div className="flex justify-between text-xs text-slate-800 dark:text-zinc-300">
              <span>
                {multiCalculations.qty} artículos × {formatWithCurrency(multiCalculations.unit)}:
              </span>
              <span className="font-bold text-black dark:text-white tabular-nums">
                {formatWithCurrency(multiCalculations.total)}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-200 dark:border-zinc-800 flex justify-between items-baseline text-sm">
              <span className="font-black text-black dark:text-white">
                Total compra:
              </span>
              <div className="text-right">
                <div className="text-xl font-black text-black dark:text-white tabular-nums">
                  {formatWithCurrency(multiCalculations.total)}
                </div>
                {multiCalculations.equivalentTotal && (
                  <div className="text-xs text-slate-700 dark:text-zinc-400 font-medium">
                    ≈ {multiCalculations.equivalentTotal} (BCV)
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
