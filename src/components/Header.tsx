import React, { useState } from 'react';
import {
  Download,
  Moon,
  Sun,
  Monitor,
  Share2,
  Check,
  HelpCircle,
  X,
  Heart,
} from 'lucide-react';
import { RateStatusType, ThemeMode } from '../types';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface HeaderProps {
  status: RateStatusType;
  relativeTime: string;
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  onOpenDonate?: () => void;
  onOpenInstall?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  relativeTime,
  theme,
  onThemeChange,
  onOpenDonate,
  onOpenInstall,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  // Status badge config
  const getStatusBadge = () => {
    switch (status) {
      case 'updated':
        return {
          dotClass: 'bg-emerald-500',
          textClass: 'text-emerald-800 bg-emerald-50 border-emerald-300',
          label: 'BCV actualizado',
        };
      case 'updating':
        return {
          dotClass: 'bg-amber-500 animate-pulse',
          textClass: 'text-amber-800 bg-amber-50 border-amber-300',
          label: 'Actualizando tasa...',
        };
      case 'cached':
        return {
          dotClass: 'bg-sky-600',
          textClass: 'text-sky-800 bg-sky-50 border-sky-300',
          label: 'Última tasa disponible',
        };
      case 'offline':
        return {
          dotClass: 'bg-slate-500',
          textClass: 'text-slate-800 bg-slate-100 border-slate-300',
          label: 'Sin conexión',
        };
      case 'error':
      default:
        return {
          dotClass: 'bg-rose-500',
          textClass: 'text-rose-800 bg-rose-50 border-rose-300',
          label: 'Tasa no disponible',
        };
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <header className="w-full border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 sticky top-0 z-40 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center p-1.5 shadow-sm border border-slate-800">
            <img
              src="/icon.svg"
              alt="VALORA logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-black dark:text-white">
                VALORA
              </h1>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/80 text-black dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                BCV
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-zinc-400 font-medium">
              Tu valor, actualizado.
            </p>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          {/* Status badge */}
          <div
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusBadge.textClass}`}
          >
            <span
              className={`w-2 h-2 rounded-full ${statusBadge.dotClass}`}
            />
            <span>{statusBadge.label}</span>
            {relativeTime && (
              <span className="text-[11px] opacity-80 pl-1 border-l border-current/30 font-medium">
                {relativeTime}
              </span>
            )}
          </div>

          {/* PWA Install Button */}
          {!isInstalled && (
            <button
              onClick={() => {
                if (isInstallable) {
                  install();
                } else if (onOpenInstall) {
                  onOpenInstall();
                } else if (isIOS) {
                  setShowIOSModal(true);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-black dark:bg-zinc-800 hover:bg-slate-800 dark:hover:bg-zinc-700 active:bg-black rounded-lg shadow-sm border border-transparent dark:border-zinc-700 transition cursor-pointer"
              title="Instalar VALORA como App (PWA / Acceso directo)"
              aria-label="Instalar aplicación"
            >
              <Download className="w-3.5 h-3.5 text-white" />
              <span className="hidden sm:inline">Instalar app</span>
            </button>
          )}

          {/* Donate / Apoyar Button */}
          {onOpenDonate && (
            <button
              onClick={onOpenDonate}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-black text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-900/60 rounded-lg transition cursor-pointer shadow-2xs"
              title="Donar / Apoyar el proyecto"
              aria-label="Donar y apoyar al creador"
            >
              <Heart className="w-3.5 h-3.5 text-rose-600 fill-rose-500" />
              <span>Donar</span>
            </button>
          )}

          {/* Info Modal Button */}
          <button
            onClick={() => setShowInfoModal(true)}
            className="p-2 text-black dark:text-zinc-200 hover:text-black dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-750 transition"
            title="Información sobre VALORA y la tasa BCV"
            aria-label="Información"
          >
            <HelpCircle className="w-4 h-4 text-current" />
          </button>

          {/* Theme selector */}
          <div className="flex items-center bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-lg border border-slate-200 dark:border-zinc-700">
            <button
              onClick={() => onThemeChange('light')}
              className={`p-1.5 rounded-md transition ${
                theme === 'light'
                  ? 'bg-white dark:bg-zinc-900 text-black dark:text-white font-bold shadow-xs'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-black dark:hover:text-white'
              }`}
              title="Modo claro"
              aria-label="Modo claro"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onThemeChange('dark')}
              className={`p-1.5 rounded-md transition ${
                theme === 'dark'
                  ? 'bg-white dark:bg-zinc-900 text-black dark:text-white font-bold shadow-xs'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-black dark:hover:text-white'
              }`}
              title="Modo oscuro"
              aria-label="Modo oscuro"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onThemeChange('system')}
              className={`p-1.5 rounded-md transition ${
                theme === 'system'
                  ? 'bg-white dark:bg-zinc-900 text-black dark:text-white font-bold shadow-xs'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-black dark:hover:text-white'
              }`}
              title="Ajuste del sistema"
              aria-label="Ajuste del sistema"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile status indicator bar */}
      <div className="sm:hidden px-4 py-1.5 bg-slate-100 dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between text-[11px] transition-colors">
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${statusBadge.dotClass}`} />
          <span className="font-semibold text-black dark:text-white">
            {statusBadge.label}
          </span>
        </div>
        {relativeTime && (
          <span className="text-slate-700 dark:text-zinc-400 font-medium">
            {relativeTime}
          </span>
        )}
      </div>

      {/* iOS Installation Guide Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-zinc-900 p-6 shadow-2xl border border-slate-300 dark:border-zinc-800 text-black dark:text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-black dark:text-white flex items-center gap-2">
                <Download className="w-4 h-4 text-current" />
                Instalar VALORA en iOS
              </h3>
              <button
                onClick={() => setShowIOSModal(false)}
                className="p-1 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-black dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-800 dark:text-zinc-300 leading-relaxed mb-4">
              Para instalar VALORA en tu pantalla de inicio como una aplicación nativa:
            </p>
            <ol className="space-y-2.5 text-xs text-black dark:text-zinc-200 mb-6">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-zinc-800 text-black dark:text-white font-bold flex items-center justify-center shrink-0 border border-slate-300 dark:border-zinc-700">
                  1
                </span>
                <span>
                  Pulsa el botón <strong>Compartir</strong> en la barra inferior de Safari.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-zinc-800 text-black dark:text-white font-bold flex items-center justify-center shrink-0 border border-slate-300 dark:border-zinc-700">
                  2
                </span>
                <span>
                  Baja y selecciona <strong>«Agregar al inicio»</strong> (+).
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-zinc-800 text-black dark:text-white font-bold flex items-center justify-center shrink-0 border border-slate-300 dark:border-zinc-700">
                  3
                </span>
                <span>
                  Pulsa <strong>Agregar</strong> en la esquina superior derecha.
                </span>
              </li>
            </ol>
            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-bold shadow-sm hover:bg-slate-800 dark:hover:bg-zinc-200 transition cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Info Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 p-6 shadow-2xl border border-slate-300 dark:border-zinc-800 max-h-[90vh] overflow-y-auto text-black dark:text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-black dark:bg-zinc-800 p-1 flex items-center justify-center border border-transparent dark:border-zinc-700">
                  <img src="/icon.svg" alt="VALORA" className="w-full h-full" />
                </div>
                <h3 className="text-base font-bold text-black dark:text-white">
                  Acerca de VALORA
                </h3>
              </div>
              <button
                onClick={() => setShowInfoModal(false)}
                className="p-1 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-black dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs text-black dark:text-zinc-200 leading-relaxed">
              <p>
                <strong>VALORA</strong> es una calculadora inteligente y conversor financiero de alta precisión para Venezuela. Diseñada para ser rápida, limpia y 100% gratuita.
              </p>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-1.5">
                <div className="font-bold text-black dark:text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Fuente Oficial
                </div>
                <p className="text-slate-800 dark:text-zinc-300">
                  La tasa mostrada corresponde a la información oficial disponible publicada por el <strong>Banco Central de Venezuela (BCV)</strong>.
                </p>
                <p className="text-[11px] text-slate-600 dark:text-zinc-400">
                  Las tasas pueden cambiar según las publicaciones oficiales del BCV. VALORA es una herramienta independiente.
                </p>
              </div>
              <ul className="space-y-1.5 list-disc pl-4 text-slate-800 dark:text-zinc-300 font-medium">
                <li>Sin anuncios ni publicidad comercial.</li>
                <li>Sin registro ni recopilación de información personal.</li>
                <li>Funciona sin conexión a internet con la última tasa guardada.</li>
                <li>Cálculos matemáticos con precedencia y porcentajes intuitivos.</li>
              </ul>
            </div>
            <button
              onClick={() => setShowInfoModal(false)}
              className="mt-6 w-full py-2.5 rounded-xl bg-black dark:bg-white hover:bg-slate-800 dark:hover:bg-zinc-200 text-white dark:text-black text-xs font-bold transition cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
