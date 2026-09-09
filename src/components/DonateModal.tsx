import React, { useState } from 'react';
import {
  Heart,
  X,
  Copy,
  Check,
  Smartphone,
  ExternalLink,
  Coins,
  CreditCard,
  Globe,
} from 'lucide-react';

interface DonateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DonateModal: React.FC<DonateModalProps> = ({ isOpen, onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = async (text: string, key: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedKey(key);
      setTimeout(() => {
        setCopiedKey((prev) => (prev === key ? null : prev));
      }, 2000);
    } catch {
      // Fallback
    }
  };

  const pagoMovilAllText =
    'PAGO MÓVIL:\nBanco: 0108 (Banco Provincial)\nTeléfono: 04248056092\nCédula: 19629049';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="donate-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-2xl border-2 border-slate-300 dark:border-zinc-800 text-black dark:text-white max-h-[90vh] overflow-y-auto relative space-y-4 transition-colors duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2 border-b border-slate-200 dark:border-zinc-800 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center justify-center shrink-0">
              <Heart className="w-5 h-5 text-rose-600 dark:text-rose-400 fill-rose-500" />
            </div>
            <div>
              <h3
                id="donate-modal-title"
                className="text-base sm:text-lg font-black text-black dark:text-white leading-tight"
              >
                Apoyar y Donar a VALORA
              </h3>
              <p className="text-xs font-semibold text-slate-700 dark:text-zinc-400">
                Tu aporte mantiene esta herramienta activa y gratuita
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-black hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800 transition cursor-pointer"
            aria-label="Cerrar ventana de donación"
          >
            <X className="w-5 h-5 text-current" />
          </button>
        </div>

        {/* Creator Message & Web link */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 space-y-2">
          <p className="text-xs font-bold text-black dark:text-white leading-relaxed">
            ❤️ Gracias por tu donación, me ayudas a seguir creando.
          </p>
          <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-[11px] font-semibold text-slate-700 dark:text-zinc-400">
              Te invito a visitar mi página web:
            </span>
            <a
              href="https://mayfrend-app.github.io/ve/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black hover:bg-slate-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:border dark:border-zinc-700 text-white text-xs font-black transition self-start sm:self-auto cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>mayfrend-app.github.io/ve</span>
              <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
            </a>
          </div>
        </div>

        {/* Option 1: Pago Móvil */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-black text-black dark:text-white uppercase tracking-wider">
              <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Pago Móvil (Venezuela)</span>
            </div>
            <button
              onClick={() => handleCopy(pagoMovilAllText, 'pm-all')}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold transition border cursor-pointer ${
                copiedKey === 'pm-all'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white dark:bg-zinc-800 text-black dark:text-white border-slate-300 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-700'
              }`}
              title="Copiar todos los datos de Pago Móvil juntos"
            >
              {copiedKey === 'pm-all' ? (
                <>
                  <Check className="w-3 h-3" />
                  <span>¡Todo copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-current" />
                  <span>Copiar todo</span>
                </>
              )}
            </button>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-zinc-800 rounded-xl border border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden text-xs">
            {/* Banco */}
            <div className="flex items-center justify-between p-2.5 sm:p-3 hover:bg-slate-50 dark:hover:bg-zinc-900/60 transition">
              <div className="space-y-0.5 pr-2">
                <span className="text-[10px] font-bold uppercase text-slate-600 dark:text-zinc-400 block">
                  Banco
                </span>
                <span className="font-black text-sm text-black dark:text-white tabular-nums">
                  0108
                </span>
                <span className="text-[11px] font-medium text-slate-700 dark:text-zinc-400 ml-1.5">
                  (Banco Provincial / BBVA)
                </span>
              </div>
              <button
                onClick={() => handleCopy('0108', 'pm-banco')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition shrink-0 border cursor-pointer ${
                  copiedKey === 'pm-banco'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-black dark:text-white border-slate-300 dark:border-zinc-700'
                }`}
              >
                {copiedKey === 'pm-banco' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-current" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>

            {/* Teléfono */}
            <div className="flex items-center justify-between p-2.5 sm:p-3 hover:bg-slate-50 dark:hover:bg-zinc-900/60 transition">
              <div className="space-y-0.5 pr-2">
                <span className="text-[10px] font-bold uppercase text-slate-600 dark:text-zinc-400 block">
                  Teléfono
                </span>
                <span className="font-black text-sm text-black dark:text-white tabular-nums tracking-wide">
                  04248056092
                </span>
              </div>
              <button
                onClick={() => handleCopy('04248056092', 'pm-telf')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition shrink-0 border cursor-pointer ${
                  copiedKey === 'pm-telf'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-black dark:text-white border-slate-300 dark:border-zinc-700'
                }`}
              >
                {copiedKey === 'pm-telf' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-current" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>

            {/* Cédula */}
            <div className="flex items-center justify-between p-2.5 sm:p-3 hover:bg-slate-50 dark:hover:bg-zinc-900/60 transition">
              <div className="space-y-0.5 pr-2">
                <span className="text-[10px] font-bold uppercase text-slate-600 dark:text-zinc-400 block">
                  Cédula / Documento
                </span>
                <span className="font-black text-sm text-black dark:text-white tabular-nums">
                  19629049
                </span>
                <span className="text-[11px] font-medium text-slate-700 dark:text-zinc-400 ml-1.5">
                  (V-19629049)
                </span>
              </div>
              <button
                onClick={() => handleCopy('19629049', 'pm-ci')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition shrink-0 border cursor-pointer ${
                  copiedKey === 'pm-ci'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-black dark:text-white border-slate-300 dark:border-zinc-700'
                }`}
              >
                {copiedKey === 'pm-ci' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-current" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Option 2: Binance Pay */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-black text-black dark:text-white uppercase tracking-wider">
            <Coins className="w-4 h-4 text-amber-500" />
            <span>Binance Pay / Criptomonedas</span>
          </div>

          <div className="rounded-xl border border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 pr-2">
                <span className="text-[10px] font-bold uppercase text-slate-600 dark:text-zinc-400 block">
                  Binance Pay ID
                </span>
                <span className="font-black text-base text-black dark:text-white tabular-nums tracking-wider">
                  549055049
                </span>
              </div>
              <button
                onClick={() => handleCopy('549055049', 'binance-id')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 border cursor-pointer ${
                  copiedKey === 'binance-id'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-black dark:text-white border-slate-300 dark:border-zinc-700'
                }`}
              >
                {copiedKey === 'binance-id' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-current" />
                    <span>Copiar ID</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-700 dark:text-zinc-400 font-medium">
              Válido para transferencias directas de USDT u otras monedas en Binance Pay sin comisiones.
            </p>
          </div>
        </div>

        {/* Close Button */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-black hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-white text-xs font-black shadow-sm transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
