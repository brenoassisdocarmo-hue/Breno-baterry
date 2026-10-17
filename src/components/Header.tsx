import React from 'react';
import { Zap, Download, FileCode, SlidersHorizontal } from 'lucide-react';

interface HeaderProps {
  activeTab: 'simple' | 'technical' | 'history' | 'android-project';
  setActiveTab: (tab: 'simple' | 'technical' | 'history' | 'android-project') => void;
  onDownloadZip: () => void;
  onOpenSimulator: () => void;
  isDownloading: boolean;
  batteryLevel: number;
  isCharging: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onDownloadZip,
  onOpenSimulator,
  isDownloading,
  batteryLevel,
  isCharging,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#030712]/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 md:gap-8">
        
        {/* Zone 1: Brand Wordmark (Single line text with icon) */}
        <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 via-cyan-500 to-cyan-300 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Zap className="w-5 h-5 text-slate-950 fill-slate-950" />
          </div>
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
              Breno Battery
              <span className="hidden sm:inline text-[11px] font-mono-num font-medium text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30">
                {batteryLevel}% {isCharging ? '⚡' : ''}
              </span>
            </span>
            <span className="text-[10px] text-slate-400 hidden sm:block">Monitor Android & Kotlin APK</span>
          </div>
        </div>

        {/* Zone 2: Navigation Links (Single line, active styling) */}
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('simple')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'simple'
                ? 'bg-blue-600/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            Modo Simples
          </button>

          <button
            onClick={() => setActiveTab('technical')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'technical'
                ? 'bg-blue-600/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            Modo Técnico
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'history'
                ? 'bg-blue-600/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            Histórico
          </button>

          <button
            onClick={() => setActiveTab('android-project')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'android-project'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Código & Gerar APK</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenSimulator}
            title="Ajustar simulação de bateria e testes"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-700/70 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Simulador</span>
          </button>

          <button
            onClick={onDownloadZip}
            disabled={isDownloading}
            className="flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 active:scale-95 transition-all rounded-lg shadow-md shadow-blue-500/20 disabled:opacity-50 whitespace-nowrap shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>{isDownloading ? 'Gerando ZIP...' : 'Baixar APK (.ZIP)'}</span>
          </button>
        </div>

      </div>
    </header>
  );
};
