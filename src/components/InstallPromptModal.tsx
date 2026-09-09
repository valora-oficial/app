import React, { useState, useEffect } from 'react';
import {
  Download,
  Smartphone,
  Check,
  X,
  Share2,
  PlusSquare,
  Sparkles,
  Zap,
  WifiOff,
  HardDrive,
  ExternalLink,
  ShieldCheck,
  MoreVertical,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface InstallPromptModalProps {
  // Can be controlled externally from Header as well
  isOpenManual?: boolean;
  onCloseManual?: () => void;
}

export const InstallPromptModal: React.FC<InstallPromptModalProps> = ({
  isOpenManual,
  onCloseManual,
}) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  
  // Suggestion banner visibility on entry
  const [showEntryBanner, setShowEntryBanner] = useState(false);
  // Full detail / instruction modal visibility
  const [showDetailModal, setShowDetailModal] = useState(false);
  // Device tab inside detail modal
  const [activeTab, setActiveTab] = useState<'auto' | 'android' | 'ios'>(
    isIOS ? 'ios' : 'android'
  );
  const [isInstalling, setIsInstalling] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  // Sync manual open from Header or Footer
  useEffect(() => {
    if (isOpenManual) {
      setShowDetailModal(true);
      setActiveTab(isIOS ? 'ios' : 'android');
    }
  }, [isOpenManual, isIOS]);

  // Suggestion upon entering the web app
  useEffect(() => {
    // If already installed in standalone mode, do not show suggestion
    if (isInstalled) return;

    // Check if user dismissed during current session
    const hasDismissedSession = sessionStorage.getItem('valora_install_prompt_dismissed');
    if (hasDismissedSession) return;

    // Show after 1.2s delay for a smooth entry experience
    const timer = setTimeout(() => {
      setShowEntryBanner(true);
    }, 1200);

    return () => clearTimeout(timer);
  }, [isInstalled]);

  const handleDismissBanner = () => {
    setShowEntryBanner(false);
    sessionStorage.setItem('valora_install_prompt_dismissed', 'true');
  };

  const handleTriggerInstall = async () => {
    if (isInstallable) {
      setIsInstalling(true);
      const outcome = await install();
      setIsInstalling(false);
      if (outcome) {
        setInstallSuccess(true);
        setShowEntryBanner(false);
        setTimeout(() => {
          setShowDetailModal(false);
        }, 2000);
      }
    } else {
      // If native prompt is not directly available (e.g. iOS or manual browser), open the instructions modal
      setShowEntryBanner(false);
      setShowDetailModal(true);
      setActiveTab(isIOS ? 'ios' : 'android');
    }
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    if (onCloseManual) onCloseManual();
  };

  // If running as standalone installed app, don't show the suggestion banner
  if (isInstalled && !showDetailModal) {
    return null;
  }

  return (
    <>
      {/* 1. AUTO-SUGGESTION BANNER UPON ENTERING THE WEBAPP */}
      {showEntryBanner && !showDetailModal && (
        <div
          role="region"
          aria-label="Sugerencia de instalación de VALORA"
          className="fixed bottom-4 left-3 right-3 sm:left-auto sm:right-4 sm:max-w-md z-40 animate-in slide-in-from-bottom duration-300 pointer-events-auto"
        >
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border-2 border-black dark:border-zinc-700 p-4 sm:p-4.5 shadow-[0_12px_36px_rgba(0,0,0,0.25)] text-black dark:text-white relative transition-colors duration-200">
            {/* Close icon */}
            <button
              onClick={handleDismissBanner}
              className="absolute top-2.5 right-2.5 p-1 text-slate-400 hover:text-black hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800 rounded-lg transition cursor-pointer"
              aria-label="Cerrar sugerencia de instalación"
            >
              <X className="w-4 h-4 text-current" />
            </button>

            <div className="flex items-start gap-3">
              {/* App Icon */}
              <div className="w-12 h-12 rounded-xl bg-black dark:bg-white flex items-center justify-center text-white dark:text-black shrink-0 shadow-sm border border-slate-700 dark:border-zinc-700">
                <span className="font-black text-lg tracking-tighter">V</span>
              </div>

              {/* Text & Badge */}
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-300 font-black text-[10px] tracking-wide uppercase">
                    <Sparkles className="w-2.5 h-2.5 text-emerald-700 dark:text-emerald-400" />
                    Sugerencia
                  </span>
                  <span className="text-[11px] font-bold text-slate-600 dark:text-zinc-400">
                    PWA / App Móvil
                  </span>
                </div>
                <h4 className="font-black text-sm text-black dark:text-white leading-snug">
                  ¿Instalar VALORA en tu teléfono?
                </h4>
                <p className="text-xs text-slate-700 dark:text-zinc-400 font-medium leading-relaxed mt-0.5">
                  Acceso directo en tu pantalla de inicio, más rápida y lista para usar sin internet.
                </p>
              </div>
            </div>

            {/* Benefit pills */}
            <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-zinc-800 grid grid-cols-3 gap-1.5 text-center">
              <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                <Zap className="w-3.5 h-3.5 mx-auto text-black dark:text-white mb-0.5" />
                <span className="text-[10px] font-black text-black dark:text-white block leading-tight">
                  Instantánea
                </span>
              </div>
              <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                <WifiOff className="w-3.5 h-3.5 mx-auto text-black dark:text-white mb-0.5" />
                <span className="text-[10px] font-black text-black dark:text-white block leading-tight">
                  Sin Internet
                </span>
              </div>
              <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                <HardDrive className="w-3.5 h-3.5 mx-auto text-black dark:text-white mb-0.5" />
                <span className="text-[10px] font-black text-black dark:text-white block leading-tight">
                  &lt; 1 MB
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={handleTriggerInstall}
                disabled={isInstalling}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-black hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-white text-xs font-black shadow-sm transition cursor-pointer"
              >
                <Download className="w-4 h-4 text-current" />
                <span>
                  {isInstalling
                    ? 'Iniciando...'
                    : isInstallable
                    ? '⚡ Instalar Ahora'
                    : isIOS
                    ? '📲 Ver cómo en iPhone'
                    : '⚡ Instalar Aplicación'}
                </span>
              </button>

              <button
                onClick={() => {
                  setShowEntryBanner(false);
                  setShowDetailModal(true);
                }}
                className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-black dark:text-white border border-slate-300 dark:border-zinc-700 text-xs font-bold transition cursor-pointer"
                title="Ver pasos e información de instalación"
              >
                Guía
              </button>

              <button
                onClick={handleDismissBanner}
                className="px-2.5 py-2.5 rounded-xl text-slate-600 hover:text-black dark:text-zinc-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-bold transition cursor-pointer"
              >
                Ahora no
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. DETAILED INSTRUCTION MODAL (For Android, iOS, or manual clicks) */}
      {showDetailModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="install-modal-title"
          onClick={handleCloseDetailModal}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-2xl border-2 border-slate-300 dark:border-zinc-800 text-black dark:text-white max-h-[92vh] overflow-y-auto relative space-y-4 transition-colors duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-2 border-b border-slate-200 dark:border-zinc-800 pb-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-black dark:bg-white flex items-center justify-center text-white dark:text-black shrink-0 shadow-sm">
                  <span className="font-black text-xl">V</span>
                </div>
                <div>
                  <h3
                    id="install-modal-title"
                    className="text-base sm:text-lg font-black text-black dark:text-white leading-tight"
                  >
                    Instalar VALORA en tu Móvil
                  </h3>
                  <p className="text-xs font-semibold text-slate-700 dark:text-zinc-400">
                    Formato PWA / APK directo sin ocupar memoria
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseDetailModal}
                className="p-1.5 rounded-lg text-slate-500 hover:text-black hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800 transition cursor-pointer"
                aria-label="Cerrar ventana de instalación"
              >
                <X className="w-5 h-5 text-current" />
              </button>
            </div>

            {/* Success state if installed */}
            {installSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500 dark:border-emerald-600 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="font-black text-emerald-950 dark:text-emerald-200 text-sm">
                  ¡VALORA se ha instalado con éxito!
                </h4>
                <p className="text-xs text-emerald-900 dark:text-emerald-300 font-medium">
                  Busca el ícono en la pantalla de inicio de tu dispositivo para abrirla cuando quieras.
                </p>
              </div>
            ) : null}

            {/* Direct 1-Click Install Button if supported by browser */}
            {isInstallable && (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border-2 border-black dark:border-zinc-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-black dark:text-white uppercase tracking-wider">
                    Instalación Automática Detectada
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 font-black text-[10px]">
                    1 Clic
                  </span>
                </div>
                <button
                  onClick={handleTriggerInstall}
                  disabled={isInstalling}
                  className="w-full py-3 px-4 rounded-xl bg-black hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-white text-xs font-black shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-current" />
                  <span>
                    {isInstalling
                      ? 'Instalando en tu dispositivo...'
                      : '⚡ Instalar en este dispositivo ahora'}
                  </span>
                </button>
              </div>
            )}

            {/* OS Selector Tabs */}
            <div className="flex rounded-xl bg-slate-100 dark:bg-zinc-800 p-1 border border-slate-300 dark:border-zinc-700">
              <button
                onClick={() => setActiveTab('android')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'android'
                    ? 'bg-white dark:bg-zinc-900 text-black dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Android / Chrome</span>
              </button>
              <button
                onClick={() => setActiveTab('ios')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'ios'
                    ? 'bg-white dark:bg-zinc-900 text-black dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                }`}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>iPhone / iPad (iOS)</span>
              </button>
            </div>

            {/* Tab 1: Android Guide */}
            {activeTab === 'android' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-700 dark:text-zinc-400 font-medium">
                  En Android (Chrome, Samsung Internet, Brave, Edge) puedes instalarla como aplicación nativa en segundos:
                </p>

                <div className="space-y-2.5">
                  <div className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                    <div className="w-6 h-6 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                      1
                    </div>
                    <div className="text-xs space-y-0.5">
                      <p className="font-black text-black dark:text-white flex items-center gap-1">
                        Abre el menú del navegador
                        <MoreVertical className="w-3.5 h-3.5 inline text-black dark:text-white" />
                      </p>
                      <p className="text-slate-700 dark:text-zinc-400">
                        Toca los tres puntos (<strong>⋮</strong>) en la esquina superior derecha o inferior de la pantalla.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                    <div className="w-6 h-6 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                      2
                    </div>
                    <div className="text-xs space-y-0.5">
                      <p className="font-black text-black dark:text-white">
                        Selecciona «Instalar aplicación» o «Agregar a pantalla principal»
                      </p>
                      <p className="text-slate-700 dark:text-zinc-400">
                        En Chrome aparecerá <strong>«Instalar app»</strong> o <strong>«Agregar a la pantalla principal»</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                    <div className="w-6 h-6 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                      3
                    </div>
                    <div className="text-xs space-y-0.5">
                      <p className="font-black text-black dark:text-white">¡Listo para usar!</p>
                      <p className="text-slate-700 dark:text-zinc-400">
                        Se creará el icono de <strong>VALORA</strong> en tu menú de aplicaciones, abriendo en pantalla completa como una app normal.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: iOS Safari Guide */}
            {activeTab === 'ios' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-700 dark:text-zinc-400 font-medium">
                  En iPhone / iPad con <strong>Safari</strong>:
                </p>

                <div className="space-y-2.5">
                  <div className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                    <div className="w-6 h-6 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                      1
                    </div>
                    <div className="text-xs space-y-0.5">
                      <p className="font-black text-black dark:text-white flex items-center gap-1.5">
                        Toca el botón «Compartir»
                        <Share2 className="w-4 h-4 text-blue-600 inline" />
                      </p>
                      <p className="text-slate-700 dark:text-zinc-400">
                        En la barra inferior de Safari, toca el ícono del cuadrado con la flecha hacia arriba.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                    <div className="w-6 h-6 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                      2
                    </div>
                    <div className="text-xs space-y-0.5">
                      <p className="font-black text-black dark:text-white flex items-center gap-1.5">
                        Selecciona «Agregar a Inicio»
                        <PlusSquare className="w-4 h-4 text-black dark:text-white inline" />
                      </p>
                      <p className="text-slate-700 dark:text-zinc-400">
                        Desplaza la lista hacia abajo y presiona <strong>«Agregar a la pantalla de inicio»</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                    <div className="w-6 h-6 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                      3
                    </div>
                    <div className="text-xs space-y-0.5">
                      <p className="font-black text-black dark:text-white">Presiona «Agregar»</p>
                      <p className="text-slate-700 dark:text-zinc-400">
                        Confirma tocando <strong>Agregar</strong> en la esquina superior derecha. El ícono aparecerá en tu pantalla.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Ventajas PWA / APK */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 font-black text-black dark:text-white">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>¿Por qué instalar en formato PWA?</span>
              </div>
              <ul className="space-y-1.5 text-slate-700 dark:text-zinc-400 font-medium pl-1 text-[11px]">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white shrink-0" />
                  <span><strong>Ultraligera:</strong> Pesa menos de 1 MB, no ocupa espacio ni satura la memoria.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white shrink-0" />
                  <span><strong>Modo Fuera de Línea:</strong> Puedes consultar las tasas y hacer cálculos sin conexión.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white shrink-0" />
                  <span><strong>Actualizaciones automáticas:</strong> Siempre tienes la última versión sin descargar parches manuales.</span>
                </li>
              </ul>
            </div>

            {/* Bottom button */}
            <div className="pt-1">
              <button
                onClick={handleCloseDetailModal}
                className="w-full py-2.5 rounded-xl bg-black hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-white text-xs font-black transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
