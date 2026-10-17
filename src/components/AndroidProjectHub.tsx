import React, { useState } from 'react';
import { ANDROID_PROJECT_FILES } from '../data/androidProjectSource';
import { AndroidFileDefinition } from '../types/battery';
import { 
  Folder, 
  FileCode, 
  Download, 
  Copy, 
  Check, 
  Terminal, 
  ExternalLink, 
  HelpCircle,
  FileCheck2,
  Box,
  Layers,
  Smartphone
} from 'lucide-react';

interface AndroidProjectHubProps {
  onDownloadZip: () => void;
  isDownloading: boolean;
  onOpenApkGuide: () => void;
}

export const AndroidProjectHub: React.FC<AndroidProjectHubProps> = ({
  onDownloadZip,
  isDownloading,
  onOpenApkGuide,
}) => {
  const [selectedFile, setSelectedFile] = useState<AndroidFileDefinition>(ANDROID_PROJECT_FILES[0]);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-fade-in">
      
      {/* Banner de Download do Projeto Android Completo */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#070e24] via-[#0B1536] to-[#070e24] border border-cyan-500/30 shadow-2xl relative overflow-hidden">
        
        {/* Glow de fundo */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
              <Smartphone className="w-4 h-4" />
              <span>Código Nativo Android em Kotlin</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Projeto Android Breno Battery Completo
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Todos os arquivos Kotlin, Jetpack Compose, BroadcastReceiver, Foreground Service e arquivos Gradle prontos para abrir no Android Studio ou compilar o arquivo APK instalável.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-400">
              <span className="flex items-center gap-1 text-slate-300">
                <Check className="w-3.5 h-3.5 text-cyan-400" />
                Jetpack Compose
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 text-slate-300">
                <Check className="w-3.5 h-3.5 text-cyan-400" />
                Kotlin 2.0+
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 text-slate-300">
                <Check className="w-3.5 h-3.5 text-cyan-400" />
                SDK 35 (Android 15)
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 text-slate-300">
                <Check className="w-3.5 h-3.5 text-cyan-400" />
                Workflow GitHub Actions APK incluso
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
            <button
              onClick={onDownloadZip}
              disabled={isDownloading}
              className="px-6 py-3.5 text-sm font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-400 hover:from-cyan-300 hover:to-blue-300 active:scale-95 transition-all rounded-xl shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2.5 disabled:opacity-50"
            >
              <Download className="w-5 h-5 text-slate-950" />
              <span>{isDownloading ? 'Gerando Arquivo ZIP...' : 'Baixar Projeto Android (.ZIP)'}</span>
            </button>

            <button
              onClick={onOpenApkGuide}
              className="px-4 py-2.5 text-xs font-semibold text-cyan-300 bg-slate-900/90 border border-cyan-500/30 hover:bg-slate-800 rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <span>Como Gerar o APK (Passo a Passo)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Explorador de Arquivos & Visualizador de Código */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 rounded-2xl bg-[#070e24] border border-blue-900/40 p-4">
        
        {/* Árvore de Diretórios (4 colunas) */}
        <div className="lg:col-span-4 space-y-3 border-b lg:border-b-0 lg:border-r border-blue-900/30 pb-4 lg:pb-0 lg:pr-4">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold px-2">
            <span>ARQUIVOS DO PROJETO ({ANDROID_PROJECT_FILES.length})</span>
            <Folder className="w-3.5 h-3.5 text-cyan-400" />
          </div>

          <div className="space-y-1 max-h-[520px] overflow-y-auto pr-1">
            {ANDROID_PROJECT_FILES.map((file) => {
              const isSelected = selectedFile.path === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-all flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'bg-blue-600/30 text-cyan-300 border border-cyan-500/40 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileCode className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <span className="truncate">{file.filename}</span>
                  </div>
                  <span className="text-[10px] uppercase font-sans text-slate-500 shrink-0">
                    {file.category}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Dica de Compilação Rápida */}
          <div className="p-3 rounded-lg bg-[#030712] border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="text-cyan-400 font-semibold flex items-center gap-1">
              <Terminal className="w-3 h-3" />
              <span>Comando de Compilação:</span>
            </div>
            <code className="block bg-slate-900 px-2 py-1 rounded text-slate-300 font-mono text-[10px]">
              ./gradlew assembleDebug
            </code>
          </div>
        </div>

        {/* Visualizador do Código do Arquivo Selecionado (8 colunas) */}
        <div className="lg:col-span-8 flex flex-col space-y-3">
          
          {/* Header do Arquivo */}
          <div className="flex items-center justify-between gap-3 bg-[#030712] p-3 rounded-xl border border-slate-800">
            <div className="min-w-0">
              <div className="text-xs font-mono text-cyan-300 font-semibold truncate">
                {selectedFile.path}
              </div>
              <div className="text-[11px] text-slate-400 truncate mt-0.5">
                {selectedFile.description}
              </div>
            </div>

            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 active:scale-95 transition-all rounded-lg shrink-0 border border-slate-700"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copiar Código</span>
                </>
              )}
            </button>
          </div>

          {/* Bloco de Código com Scroll e Estilo Android Dark */}
          <div className="relative rounded-xl bg-[#030712] border border-slate-800 p-4 max-h-[500px] overflow-auto font-mono text-xs text-slate-300 leading-relaxed select-text">
            <pre className="whitespace-pre">
              {selectedFile.content}
            </pre>
          </div>

        </div>

      </div>

    </div>
  );
};
