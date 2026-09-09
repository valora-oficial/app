import React, { useState, useEffect, useRef } from 'react';
import {
  Delete,
  RotateCcw,
  ArrowRight,
  Equal,
  Percent,
  Copy,
  Check,
  Sparkles,
  Calculator as CalcIcon,
  TrendingUp,
  DollarSign,
  Euro,
} from 'lucide-react';
import { safeEvaluate } from '../utils/mathParser';
import { formatBolivares, formatUSD, formatEUR } from '../utils/formatters';

interface MathCalculatorProps {
  rate: number;
  eurRate?: number;
  onSendToConverter: (amount: number, currency: 'USD' | 'EUR' | 'VES') => void;
}

export const MathCalculator: React.FC<MathCalculatorProps> = ({
  rate,
  eurRate,
  onSendToConverter,
}) => {
  const [display, setDisplay] = useState<string>('');
  const [lastOperation, setLastOperation] = useState<string | null>(null);
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [memory, setMemory] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  // Auto-scroll the process display to the right when new digits/operators arrive
  const processDisplayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (processDisplayRef.current) {
      processDisplayRef.current.scrollLeft = processDisplayRef.current.scrollWidth;
    }
  }, [display]);

  // Live preview evaluation as the user is typing
  const livePreview = React.useMemo(() => {
    if (!display.trim()) return null;
    // Don't show live preview if display ends with an open operator or paren
    const trimmed = display.trim();
    if (/[+\-×*÷/]$/.test(trimmed)) return null;
    
    // Evaluate if there are at least two numbers or an operator
    if (/[+\-×*÷/%]/.test(trimmed)) {
      const res = safeEvaluate(trimmed);
      if (res.success && res.value !== result) {
        return res.value;
      }
    }
    return null;
  }, [display, result]);

  // Handle number or operator press
  const handleKey = (char: string) => {
    setError(null);
    setDisplay((prev) => prev + char);
  };

  // Clear all
  const handleClear = () => {
    setDisplay('');
    setResult(null);
    setError(null);
  };

  // Backspace
  const handleBackspace = () => {
    setError(null);
    setDisplay((prev) => {
      // If trailing space from an operator like ' + ', trim properly
      if (prev.endsWith(' ')) {
        return prev.trimEnd().slice(0, -1);
      }
      return prev.slice(0, -1);
    });
  };

  // Calculate result
  const handleEquals = () => {
    if (!display.trim()) return;
    const res = safeEvaluate(display);
    if (res.success) {
      setLastOperation(display);
      setResult(res.value);
      setError(null);
    } else {
      setError(res.error || 'Operación inválida');
    }
  };

  // Apply percentage modifier (+X% or -X%)
  const applyQuickPercent = (pct: number) => {
    setError(null);
    const op = pct > 0 ? '+' : '-';
    const absPct = Math.abs(pct);

    if (result !== null && !display) {
      // Continue chaining from previous result
      setDisplay(`${result} ${op} ${absPct}%`);
    } else if (display) {
      // Append to active expression
      setDisplay((prev) => `${prev} ${op} ${absPct}%`);
    }
  };

  // Memory functions
  const handleMemoryAdd = () => {
    const val = result !== null ? result : safeEvaluate(display).value;
    if (val !== undefined && !isNaN(val)) {
      setMemory((m) => m + val);
    }
  };

  const handleMemorySub = () => {
    const val = result !== null ? result : safeEvaluate(display).value;
    if (val !== undefined && !isNaN(val)) {
      setMemory((m) => m - val);
    }
  };

  const handleMemoryRecall = () => {
    if (memory !== 0) {
      setDisplay((prev) => prev + memory.toString());
    }
  };

  const handleMemoryClear = () => {
    setMemory(0);
  };

  // Copy result to clipboard
  const handleCopyResult = () => {
    const textToCopy =
      result !== null
        ? result.toLocaleString('es-VE', { maximumFractionDigits: 4 })
        : display || '0';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Physical keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not capture if an input or textarea is currently focused
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        handleKey(e.key);
      } else if (e.key === '.') {
        handleKey('.');
      } else if (e.key === ',') {
        handleKey('.');
      } else if (e.key === '+') {
        handleKey(' + ');
      } else if (e.key === '-') {
        handleKey(' − ');
      } else if (e.key === '*') {
        handleKey(' × ');
      } else if (e.key === '/') {
        e.preventDefault();
        handleKey(' ÷ ');
      } else if (e.key === '%') {
        handleKey('%');
      } else if (e.key === '(' || e.key === ')') {
        handleKey(e.key);
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleEquals();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Escape' || e.key.toLowerCase() === 'c') {
        e.preventDefault();
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [display, result]);

  // Conversions for active number
  const activeNumber = result !== null ? result : livePreview !== null ? livePreview : 0;
  const convertedToVes = rate > 0 ? activeNumber * rate : 0;
  const convertedToUsd = rate > 0 ? activeNumber / rate : 0;
  const convertedEurToVes = eurRate && eurRate > 0 ? activeNumber * eurRate : 0;
  const convertedVesToEur = eurRate && eurRate > 0 ? activeNumber / eurRate : 0;

  // Responsive display font size depending on text length
  const resultString =
    result !== null
      ? result.toLocaleString('es-VE', { maximumFractionDigits: 4 })
      : display || '0';

  const getResultFontSize = () => {
    const len = resultString.length;
    if (len > 16) return 'text-2xl sm:text-3xl';
    if (len > 12) return 'text-3xl sm:text-4xl';
    if (len > 8) return 'text-4xl sm:text-5xl';
    return 'text-5xl sm:text-6xl';
  };

  // Helper to highlight operators in the process window for crystal-clear readability
  const renderFormattedFormula = (text: string) => {
    if (!text) {
      return (
        <span className="text-slate-400 dark:text-zinc-600 italic select-none">
          Ingresa una suma, resta u operación...
        </span>
      );
    }

    // Split text into tokens keeping operators highlighted
    const parts = text.split(/(\s*[+−×÷*%/()]+\s*)/);
    return parts.map((part, index) => {
      const isOperator = /[+−×÷*%/()]/.test(part);
      if (isOperator) {
        return (
          <span
            key={index}
            className="text-amber-600 dark:text-amber-400 font-black px-1 mx-0.5 bg-amber-500/10 dark:bg-amber-400/15 rounded-md inline-block"
          >
            {part.trim()}
          </span>
        );
      }
      return (
        <span key={index} className="text-slate-900 dark:text-zinc-100 font-bold">
          {part}
        </span>
      );
    });
  };

  return (
    <div className="w-full rounded-2xl bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 shadow-sm p-4 sm:p-6 space-y-4 text-black dark:text-white transition-colors duration-200">
      {/* 1. VENTANA DE PROCESOS Y PANTALLA PRINCIPAL DE LA CALCULADORA */}
      <div className="rounded-2xl bg-slate-50 dark:bg-zinc-950 border-2 border-slate-300 dark:border-zinc-800 shadow-inner p-4 sm:p-5 space-y-2 relative overflow-hidden transition-colors">
        {/* Top Status & Memory Bar */}
        <div className="flex items-center justify-between text-xs font-semibold pb-1 border-b border-slate-200/80 dark:border-zinc-800/80">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-200 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 font-mono text-[11px] font-bold">
              <CalcIcon className="w-3 h-3 text-slate-600 dark:text-zinc-400" />
              <span>Procesos</span>
            </span>

            {memory !== 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-mono text-[11px] font-bold border border-emerald-300 dark:border-emerald-800">
                M = {memory.toLocaleString('es-VE')}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {lastOperation && (
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 truncate max-w-[140px] sm:max-w-[220px]">
                Ant: {lastOperation} =
              </span>
            )}
            <button
              onClick={handleCopyResult}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold text-slate-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 border border-slate-300 dark:border-zinc-700 transition cursor-pointer shadow-2xs"
              title="Copiar resultado al portapapeles"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-600 dark:text-emerald-400">Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span className="hidden sm:inline">Copiar</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* VENTANA DE PROCESOS SUPERIOR (Sumas, restas, multiplicaciones con números grandes y destacados) */}
        <div
          ref={processDisplayRef}
          className="w-full min-h-[48px] py-1 px-1 overflow-x-auto whitespace-nowrap text-right font-mono text-xl sm:text-2xl md:text-3xl font-bold tracking-wide scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-zinc-700"
        >
          {renderFormattedFormula(display)}
        </div>

        {/* Live Subtotal Indicator (if formula is in progress) */}
        {livePreview !== null && !error && (
          <div className="text-right text-xs sm:text-sm font-mono text-emerald-600 dark:text-emerald-400 font-semibold flex items-center justify-end gap-1.5 animate-in fade-in duration-150">
            <span className="text-[11px] text-slate-500 dark:text-zinc-500">Subtotal en vivo:</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 font-bold">
              ≈ {livePreview.toLocaleString('es-VE', { maximumFractionDigits: 4 })}
            </span>
          </div>
        )}

        {/* PANTALLA PRINCIPAL: NÚMERO DE RESULTADO EXTRA GRANDE Y CLARO */}
        <div className="pt-2 text-right">
          {error ? (
            <div className="min-h-[56px] flex items-center justify-end text-rose-600 dark:text-rose-400 font-bold text-base sm:text-lg">
              <span className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60">
                ⚠️ {error}
              </span>
            </div>
          ) : (
            <div
              className={`font-black font-mono tracking-tight tabular-nums text-black dark:text-white min-h-[56px] flex items-center justify-end leading-none select-all ${getResultFontSize()}`}
            >
              {result !== null ? (
                result.toLocaleString('es-VE', { maximumFractionDigits: 4 })
              ) : (
                <span className="text-slate-400 dark:text-zinc-600">0</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 2. CONVERSIÓN INMEDIATA DEL RESULTADO A TASA OFICIAL BCV */}
      {activeNumber > 0 && (rate > 0 || (eurRate && eurRate > 0)) && (
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-950/80 border border-slate-300 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-black dark:text-white transition-colors">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-zinc-200 text-xs uppercase tracking-wide">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Equivalencia con tasa BCV:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-slate-700 dark:text-zinc-300">
              {rate > 0 && (
                <div>
                  Si son <strong>${activeNumber.toLocaleString('es-VE')} USD</strong> ={' '}
                  <span className="font-black text-black dark:text-white font-mono">
                    {formatBolivares(convertedToVes)}
                  </span>
                </div>
              )}
              {eurRate && eurRate > 0 && (
                <div>
                  Si son <strong>€{activeNumber.toLocaleString('es-VE')} EUR</strong> ={' '}
                  <span className="font-black text-black dark:text-white font-mono">
                    {formatBolivares(convertedEurToVes)}
                  </span>
                </div>
              )}
              <div className="sm:col-span-2 text-slate-600 dark:text-zinc-400 text-[11px] pt-0.5 border-t border-slate-200 dark:border-zinc-800">
                Si son <strong>Bs. {activeNumber.toLocaleString('es-VE')}</strong> ={' '}
                <span className="font-bold text-black dark:text-white">
                  {rate > 0 ? formatUSD(convertedToUsd) : ''}
                  {rate > 0 && eurRate && eurRate > 0 ? ' · ' : ''}
                  {eurRate && eurRate > 0 ? formatEUR(convertedVesToEur) : ''}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-1.5 shrink-0 pt-1 md:pt-0">
            {rate > 0 && (
              <button
                onClick={() => onSendToConverter(activeNumber, 'USD')}
                className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl bg-black dark:bg-zinc-800 hover:bg-slate-800 dark:hover:bg-zinc-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
                title="Cargar como USD en el conversor"
              >
                <span>Cargar $ USD</span>
                <ArrowRight className="w-3 h-3 text-white" />
              </button>
            )}
            {eurRate && eurRate > 0 && (
              <button
                onClick={() => onSendToConverter(activeNumber, 'EUR')}
                className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl bg-black dark:bg-zinc-800 hover:bg-slate-800 dark:hover:bg-zinc-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
                title="Cargar como EUR en el conversor"
              >
                <span>Cargar € EUR</span>
                <ArrowRight className="w-3 h-3 text-white" />
              </button>
            )}
            <button
              onClick={() => onSendToConverter(activeNumber, 'VES')}
              className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-zinc-700 hover:bg-slate-300 dark:hover:bg-zinc-600 text-black dark:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              title="Cargar como Bolívares en el conversor"
            >
              <span>Cargar Bs.</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* 3. BARRA DE ACCESO RÁPIDO: MEMORIA Y PORCENTAJES FISCALES (IVA VENEZUELA) */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 text-xs">
        {/* Memory Keys */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handleMemoryClear}
            className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-black dark:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-700 border border-slate-300 dark:border-zinc-700 text-xs font-bold transition cursor-pointer"
            title="Limpiar memoria (MC)"
          >
            MC
          </button>
          <button
            onClick={handleMemoryRecall}
            disabled={memory === 0}
            className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-black dark:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-700 disabled:opacity-40 border border-slate-300 dark:border-zinc-700 text-xs font-bold transition cursor-pointer"
            title="Recuperar memoria (MR)"
          >
            MR
          </button>
          <button
            onClick={handleMemoryAdd}
            className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-black dark:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-700 border border-slate-300 dark:border-zinc-700 text-xs font-bold transition cursor-pointer"
            title="Sumar a memoria (M+)"
          >
            M+
          </button>
          <button
            onClick={handleMemorySub}
            className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-black dark:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-700 border border-slate-300 dark:border-zinc-700 text-xs font-bold transition cursor-pointer"
            title="Restar de memoria (M-)"
          >
            M-
          </button>
        </div>

        {/* Quick Percentages / Presets */}
        <div className="flex items-center gap-1 shrink-0">
          {/* 16% IVA Highlight Button */}
          <button
            onClick={() => applyQuickPercent(16)}
            className="px-2.5 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-950 dark:text-amber-200 hover:bg-amber-200 dark:hover:bg-amber-900 border border-amber-300 dark:border-amber-700 text-xs font-black flex items-center gap-1 transition cursor-pointer shadow-2xs"
            title="Agregar 16% IVA oficial de Venezuela"
          >
            <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            <span>+16% IVA</span>
          </button>

          <button
            onClick={() => applyQuickPercent(10)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-black dark:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-700 border border-slate-300 dark:border-zinc-700 text-xs font-bold transition cursor-pointer"
            title="Agregar +10% (Propina / Recargo)"
          >
            +10%
          </button>
          <button
            onClick={() => applyQuickPercent(-10)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-black dark:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-700 border border-slate-300 dark:border-zinc-700 text-xs font-bold transition cursor-pointer"
            title="Descontar -10%"
          >
            -10%
          </button>
          <button
            onClick={() => applyQuickPercent(-20)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-black dark:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-700 border border-slate-300 dark:border-zinc-700 text-xs font-bold transition cursor-pointer"
            title="Descontar -20%"
          >
            -20%
          </button>
        </div>
      </div>

      {/* 4. TECLADO NUMÉRICO Y DE OPERACIONES CON BOTONES GRANDES Y ALTO CONTRASTE */}
      <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
        {/* ROW 1: Acciones y División */}
        <button
          onClick={handleClear}
          className="h-14 sm:h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-300 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 active:scale-95 transition-transform flex items-center justify-center font-black text-xl cursor-pointer shadow-2xs"
          title="Borrar todo (C / Esc)"
        >
          C
        </button>

        <button
          onClick={() => handleKey('(')}
          className="h-14 sm:h-16 rounded-2xl bg-slate-100 dark:bg-zinc-800/80 border border-slate-300 dark:border-zinc-700 text-black dark:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-700 active:scale-95 transition-transform font-bold text-xl cursor-pointer"
          title="Abrir paréntesis"
        >
          (
        </button>

        <button
          onClick={() => handleKey(')')}
          className="h-14 sm:h-16 rounded-2xl bg-slate-100 dark:bg-zinc-800/80 border border-slate-300 dark:border-zinc-700 text-black dark:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-700 active:scale-95 transition-transform font-bold text-xl cursor-pointer"
          title="Cerrar paréntesis"
        >
          )
        </button>

        <button
          onClick={() => handleKey(' ÷ ')}
          className="h-14 sm:h-16 rounded-2xl bg-amber-50 dark:bg-zinc-800 border-2 border-amber-300 dark:border-amber-500/40 text-amber-900 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-zinc-700 active:scale-95 transition-transform text-2xl font-black flex items-center justify-center cursor-pointer shadow-2xs"
          title="Dividir"
        >
          ÷
        </button>

        {/* ROW 2: 7, 8, 9 y Multiplicación */}
        <button
          onClick={() => handleKey('7')}
          className="h-14 sm:h-16 rounded-2xl bg-white dark:bg-zinc-800 border-2 border-slate-200 dark:border-zinc-700 text-black dark:text-white hover:bg-slate-100 dark:hover:bg-zinc-750 active:scale-95 transition-transform font-black text-2xl sm:text-3xl cursor-pointer shadow-2xs"
        >
          7
        </button>
        <button
          onClick={() => handleKey('8')}
          className="h-14 sm:h-16 rounded-2xl bg-white dark:bg-zinc-800 border-2 border-slate-200 dark:border-zinc-700 text-black dark:text-white hover:bg-slate-100 dark:hover:bg-zinc-750 active:scale-95 transition-transform font-black text-2xl sm:text-3xl cursor-pointer shadow-2xs"
        >
          8
        </button>
        <button
          onClick={() => handleKey('9')}
          className="h-14 sm:h-16 rounded-2xl bg-white dark:bg-zinc-800 border-2 border-slate-200 dark:border-zinc-700 text-black dark:text-white hover:bg-slate-100 dark:hover:bg-zinc-750 active:scale-95 transition-transform font-black text-2xl sm:text-3xl cursor-pointer shadow-2xs"
        >
          9
        </button>
        <button
          onClick={() => handleKey(' × ')}
          className="h-14 sm:h-16 rounded-2xl bg-amber-50 dark:bg-zinc-800 border-2 border-amber-300 dark:border-amber-500/40 text-amber-900 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-zinc-700 active:scale-95 transition-transform text-2xl font-black flex items-center justify-center cursor-pointer shadow-2xs"
          title="Multiplicar"
        >
          ×
        </button>

        {/* ROW 3: 4, 5, 6 y Resta */}
        <button
          onClick={() => handleKey('4')}
          className="h-14 sm:h-16 rounded-2xl bg-white dark:bg-zinc-800 border-2 border-slate-200 dark:border-zinc-700 text-black dark:text-white hover:bg-slate-100 dark:hover:bg-zinc-750 active:scale-95 transition-transform font-black text-2xl sm:text-3xl cursor-pointer shadow-2xs"
        >
          4
        </button>
        <button
          onClick={() => handleKey('5')}
          className="h-14 sm:h-16 rounded-2xl bg-white dark:bg-zinc-800 border-2 border-slate-200 dark:border-zinc-700 text-black dark:text-white hover:bg-slate-100 dark:hover:bg-zinc-750 active:scale-95 transition-transform font-black text-2xl sm:text-3xl cursor-pointer shadow-2xs"
        >
          5
        </button>
        <button
          onClick={() => handleKey('6')}
          className="h-14 sm:h-16 rounded-2xl bg-white dark:bg-zinc-800 border-2 border-slate-200 dark:border-zinc-700 text-black dark:text-white hover:bg-slate-100 dark:hover:bg-zinc-750 active:scale-95 transition-transform font-black text-2xl sm:text-3xl cursor-pointer shadow-2xs"
        >
          6
        </button>
        <button
          onClick={() => handleKey(' − ')}
          className="h-14 sm:h-16 rounded-2xl bg-amber-50 dark:bg-zinc-800 border-2 border-amber-300 dark:border-amber-500/40 text-amber-900 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-zinc-700 active:scale-95 transition-transform text-2xl font-black flex items-center justify-center cursor-pointer shadow-2xs"
          title="Restar"
        >
          −
        </button>

        {/* ROW 4: 1, 2, 3 y Suma */}
        <button
          onClick={() => handleKey('1')}
          className="h-14 sm:h-16 rounded-2xl bg-white dark:bg-zinc-800 border-2 border-slate-200 dark:border-zinc-700 text-black dark:text-white hover:bg-slate-100 dark:hover:bg-zinc-750 active:scale-95 transition-transform font-black text-2xl sm:text-3xl cursor-pointer shadow-2xs"
        >
          1
        </button>
        <button
          onClick={() => handleKey('2')}
          className="h-14 sm:h-16 rounded-2xl bg-white dark:bg-zinc-800 border-2 border-slate-200 dark:border-zinc-700 text-black dark:text-white hover:bg-slate-100 dark:hover:bg-zinc-750 active:scale-95 transition-transform font-black text-2xl sm:text-3xl cursor-pointer shadow-2xs"
        >
          2
        </button>
        <button
          onClick={() => handleKey('3')}
          className="h-14 sm:h-16 rounded-2xl bg-white dark:bg-zinc-800 border-2 border-slate-200 dark:border-zinc-700 text-black dark:text-white hover:bg-slate-100 dark:hover:bg-zinc-750 active:scale-95 transition-transform font-black text-2xl sm:text-3xl cursor-pointer shadow-2xs"
        >
          3
        </button>
        <button
          onClick={() => handleKey(' + ')}
          className="h-14 sm:h-16 rounded-2xl bg-amber-50 dark:bg-zinc-800 border-2 border-amber-300 dark:border-amber-500/40 text-amber-900 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-zinc-700 active:scale-95 transition-transform text-2xl font-black flex items-center justify-center cursor-pointer shadow-2xs"
          title="Sumar"
        >
          +
        </button>

        {/* ROW 5: 0, 00, Punto Decimal y Borrar Dígito */}
        <button
          onClick={() => handleKey('0')}
          className="h-14 sm:h-16 rounded-2xl bg-white dark:bg-zinc-800 border-2 border-slate-200 dark:border-zinc-700 text-black dark:text-white hover:bg-slate-100 dark:hover:bg-zinc-750 active:scale-95 transition-transform font-black text-2xl sm:text-3xl cursor-pointer shadow-2xs"
        >
          0
        </button>

        <button
          onClick={() => handleKey('00')}
          className="h-14 sm:h-16 rounded-2xl bg-white dark:bg-zinc-800 border-2 border-slate-200 dark:border-zinc-700 text-black dark:text-white hover:bg-slate-100 dark:hover:bg-zinc-750 active:scale-95 transition-transform font-black text-xl cursor-pointer shadow-2xs"
          title="Doble cero"
        >
          00
        </button>

        <button
          onClick={() => handleKey('.')}
          className="h-14 sm:h-16 rounded-2xl bg-white dark:bg-zinc-800 border-2 border-slate-200 dark:border-zinc-700 text-black dark:text-white hover:bg-slate-100 dark:hover:bg-zinc-750 active:scale-95 transition-transform font-black text-2xl sm:text-3xl cursor-pointer shadow-2xs"
          title="Punto decimal"
        >
          .
        </button>

        <button
          onClick={handleBackspace}
          className="h-14 sm:h-16 rounded-2xl bg-slate-100 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-black dark:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-700 active:scale-95 transition-transform flex items-center justify-center cursor-pointer shadow-2xs"
          title="Borrar último dígito (Backspace)"
        >
          <Delete className="w-6 h-6 text-black dark:text-zinc-200" />
        </button>

        {/* ROW 6: Porcentaje y Botón Igual Destacado */}
        <button
          onClick={() => handleKey('%')}
          className="h-14 sm:h-16 rounded-2xl bg-slate-100 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-black dark:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-700 active:scale-95 transition-transform flex items-center justify-center font-black text-xl cursor-pointer shadow-2xs"
          title="Operador Porcentaje (%)"
        >
          %
        </button>

        <button
          onClick={handleEquals}
          className="col-span-3 h-14 sm:h-16 rounded-2xl bg-black dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 active:bg-black text-white font-black text-xl shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
          title="Calcular resultado (= / Enter)"
        >
          <Equal className="w-6 h-6 text-white" />
          <span className="tracking-wide">Calcular resultado</span>
        </button>
      </div>

      {/* Helpful keyboard hint for desktop users */}
      <div className="text-center pt-1 text-[11px] text-slate-500 dark:text-zinc-500 hidden sm:block">
        💡 <span className="font-semibold">Tip:</span> Puedes usar el teclado numérico de tu computadora directamente (0-9, +, -, *, /, Enter, Esc).
      </div>
    </div>
  );
};
