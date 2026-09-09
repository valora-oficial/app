import React, { useState } from 'react';
import {
  ArrowRightLeft,
  Calculator,
  Wrench,
  History,
  Building2,
  Heart,
  ExternalLink,
} from 'lucide-react';
import { Header } from './components/Header';
import { RateCard } from './components/RateCard';
import { MainConverter } from './components/MainConverter';
import { MathCalculator } from './components/MathCalculator';
import { ToolsSection } from './components/ToolsSection';
import { HistorySection } from './components/HistorySection';
import { OfflineIndicator } from './components/OfflineIndicator';
import { DonateModal } from './components/DonateModal';
import { InstallPromptModal } from './components/InstallPromptModal';
import { useBCVRate } from './hooks/useBCVRate';
import { useTheme } from './hooks/useTheme';
import { ActiveTab, CalculationHistoryItem, ConversionDirection, ForeignCurrency } from './types';

export default function App() {
  const { theme, setTheme } = useTheme();
  const {
    rateData,
    rate,
    status,
    isUpdating,
    relativeTime,
    manualRefresh,
  } = useBCVRate();

  const [activeTab, setActiveTab] = useState<ActiveTab>('converter');
  const [selectedForeignCurrency, setSelectedForeignCurrency] = useState<ForeignCurrency>('USD');
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [showInstallGuideModal, setShowInstallGuideModal] = useState(false);

  // Amount transferred from Calculator to Converter
  const [externalAmount, setExternalAmount] = useState<{
    value: number;
    currency: 'USD' | 'EUR' | 'VES';
  } | null>(null);

  // User calculation history (saved in localStorage)
  const [historyItems, setHistoryItems] = useState<CalculationHistoryItem[]>(
    () => {
      try {
        if (typeof localStorage !== 'undefined') {
          const saved = localStorage.getItem('valora_calc_history');
          if (saved) return JSON.parse(saved);
        }
      } catch {
        // ignore
      }
      return [];
    },
  );

  const handleRecordHistory = (item: {
    sourceAmount: number;
    targetAmount: number;
    direction: ConversionDirection;
    rateUsed: number;
    formattedText: string;
    foreignCurrency?: ForeignCurrency;
  }) => {
    const newItem: CalculationHistoryItem = {
      ...item,
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
    };
    setHistoryItems((prev) => {
      const updated = [newItem, ...prev.slice(0, 14)]; // keep last 15
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('valora_calc_history', JSON.stringify(updated));
        }
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleClearHistory = () => {
    setHistoryItems([]);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('valora_calc_history');
      }
    } catch {
      // ignore
    }
  };

  const handleSendToConverter = (amount: number, currency: 'USD' | 'EUR' | 'VES') => {
    if (currency === 'EUR') {
      setSelectedForeignCurrency('EUR');
    } else if (currency === 'USD') {
      setSelectedForeignCurrency('USD');
    }
    setExternalAmount({ value: amount, currency });
    setActiveTab('converter');
  };

  const eurRate = rateData?.eurRate;

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-black dark:text-zinc-100 flex flex-col font-sans selection:bg-slate-200 dark:selection:bg-zinc-800 selection:text-black dark:selection:text-white transition-colors duration-200">
      {/* 1. Header */}
      <Header
        status={status}
        relativeTime={relativeTime}
        theme={theme}
        onThemeChange={setTheme}
        onOpenDonate={() => setShowDonateModal(true)}
        onOpenInstall={() => setShowInstallGuideModal(true)}
      />

      {/* 2. Main Container */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-5 sm:py-6 space-y-5 pb-24 sm:pb-12 bg-white dark:bg-zinc-950 text-black dark:text-zinc-100 transition-colors duration-200">
        {/* Highlighted Official BCV Rate Card (USD & EUR) */}
        <RateCard
          rateData={rateData}
          status={status}
          isUpdating={isUpdating}
          relativeTime={relativeTime}
          onRefresh={manualRefresh}
          selectedCurrency={selectedForeignCurrency}
          onSelectCurrency={setSelectedForeignCurrency}
        />

        {/* Tab Navigation Pill Bar */}
        <nav className="w-full flex items-center justify-between bg-slate-100 dark:bg-zinc-900 p-1.5 rounded-xl border border-slate-300 dark:border-zinc-800 text-xs font-semibold select-none shadow-xs transition-colors">
          <button
            onClick={() => setActiveTab('converter')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg transition cursor-pointer ${
              activeTab === 'converter'
                ? 'bg-white dark:bg-zinc-800 text-black dark:text-white shadow-sm font-bold border border-slate-300 dark:border-zinc-700'
                : 'text-slate-700 dark:text-zinc-400 hover:text-black dark:hover:text-white font-semibold'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-current" />
            <span>Conversor</span>
          </button>

          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg transition cursor-pointer ${
              activeTab === 'calculator'
                ? 'bg-white dark:bg-zinc-800 text-black dark:text-white shadow-sm font-bold border border-slate-300 dark:border-zinc-700'
                : 'text-slate-700 dark:text-zinc-400 hover:text-black dark:hover:text-white font-semibold'
            }`}
          >
            <Calculator className="w-3.5 h-3.5 text-current" />
            <span>Calculadora</span>
          </button>

          <button
            onClick={() => setActiveTab('tools')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg transition cursor-pointer ${
              activeTab === 'tools'
                ? 'bg-white dark:bg-zinc-800 text-black dark:text-white shadow-sm font-bold border border-slate-300 dark:border-zinc-700'
                : 'text-slate-700 dark:text-zinc-400 hover:text-black dark:hover:text-white font-semibold'
            }`}
          >
            <Wrench className="w-3.5 h-3.5 text-current" />
            <span>Herramientas</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg transition cursor-pointer ${
              activeTab === 'history'
                ? 'bg-white dark:bg-zinc-800 text-black dark:text-white shadow-sm font-bold border border-slate-300 dark:border-zinc-700'
                : 'text-slate-700 dark:text-zinc-400 hover:text-black dark:hover:text-white font-semibold'
            }`}
          >
            <History className="w-3.5 h-3.5 text-current" />
            <span>Historial</span>
          </button>
        </nav>

        {/* Dynamic View Panels */}
        <section aria-label="Contenido principal">
          {activeTab === 'converter' && (
            <MainConverter
              rateData={rateData}
              onRecordHistory={handleRecordHistory}
              externalAmount={externalAmount}
              selectedCurrency={selectedForeignCurrency}
              onCurrencyChange={setSelectedForeignCurrency}
            />
          )}

          {activeTab === 'calculator' && (
            <MathCalculator
              rate={rate}
              eurRate={eurRate}
              onSendToConverter={handleSendToConverter}
            />
          )}

          {activeTab === 'tools' && (
            <ToolsSection rate={rate} eurRate={eurRate} />
          )}

          {activeTab === 'history' && (
            <HistorySection
              rateData={rateData}
              historyItems={historyItems}
              onClearHistory={handleClearHistory}
            />
          )}
        </section>
      </main>

      {/* 3. Footer */}
      <footer className="w-full border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-6 text-center text-xs text-black dark:text-zinc-300 space-y-2.5 transition-colors duration-200">
        <div className="flex items-center justify-center gap-1.5 font-bold text-black dark:text-white">
          <Building2 className="w-3.5 h-3.5 text-black dark:text-white" />
          <span>VALORA — Tu valor, actualizado.</span>
        </div>
        <p className="max-w-md mx-auto px-4 text-[11px] text-slate-700 dark:text-zinc-400">
          Tasas oficiales del Dólar y Euro proporcionadas por el Banco Central de Venezuela (BCV). Aplicación independiente sin publicidad.
        </p>
        <div className="pt-1 flex flex-wrap items-center justify-center gap-2.5 px-4">
          <button
            onClick={() => setShowInstallGuideModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black dark:bg-zinc-800 hover:bg-slate-800 dark:hover:bg-zinc-700 text-white text-xs font-black transition cursor-pointer shadow-2xs border border-transparent dark:border-zinc-700"
            title="Instalar VALORA en tu teléfono"
          >
            <Building2 className="w-3.5 h-3.5 text-white" />
            <span>Instalar App Móvil</span>
          </button>

          <button
            onClick={() => setShowDonateModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 text-xs font-black transition cursor-pointer shadow-2xs"
            title="Donar y apoyar al creador"
          >
            <Heart className="w-3.5 h-3.5 text-rose-600 fill-rose-500" />
            <span>Donar / Apoyar</span>
          </button>

          <a
            href="https://mayfrend-app.github.io/ve/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-black dark:text-white border border-slate-300 dark:border-zinc-800 text-xs font-bold transition cursor-pointer"
          >
            <span>mayfrend-app.github.io/ve</span>
            <ExternalLink className="w-3 h-3 text-black dark:text-white" />
          </a>
        </div>
      </footer>

      {/* Donate Modal */}
      <DonateModal
        isOpen={showDonateModal}
        onClose={() => setShowDonateModal(false)}
      />

      {/* Install Suggestion Banner & Guide Modal */}
      <InstallPromptModal
        isOpenManual={showInstallGuideModal}
        onCloseManual={() => setShowInstallGuideModal(false)}
      />

      {/* Offline Alert Toast */}
      <OfflineIndicator />
    </div>
  );
}
