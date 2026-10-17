import React from 'react';
import { X, Smartphone, Terminal, Github, CheckCircle2, Copy } from 'lucide-react';

interface ApkGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownloadZip: () => void;
}

export const ApkGuideModal: React.FC<ApkGuideModalProps> = ({
  isOpen,
  onClose,
  onDownloadZip,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-2xl bg-[#070e24] border border-cyan-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        {/* Header do Guia */}
        <div className="flex items-center justify-between border-b border-blue-900/40 pb-4">
          <div className="flex items-center gap-2.5">
            <Smartphone className="w-6 h-6 text-cyan-400" />
            <div>
              <h3 className="text-lg font-bold text-white">Guia: Como Gerar o Arquivo APK Instalável</h3>
              <p className="text-xs text-slate-400">Passo a passo para compilar o Breno Battery no seu Android</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Métodos de Compilação */}
        <div className="space-y-4">
          
          {/* Método 1: Android Studio */}
          <div className="p-4 rounded-xl bg-[#030712] border border-blue-900/50 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 text-sm font-bold">
              <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-xs">1</span>
              <span>Método Oficial: Usando o Android Studio (Recomendado)</span>
            </div>
            <ol className="list-decimal list-inside text-xs text-slate-300 space-y-1.5 pl-1 leading-relaxed">
              <li>Clique no botão <strong>"Baixar Projeto (.ZIP)"</strong> no topo deste app e descompacte a pasta no seu computador.</li>
              <li>Abra o <strong>Android Studio</strong> (Ladybug ou versão recente).</li>
              <li>Selecione <strong>File &gt; Open...</strong> e escolha a pasta descompactada.</li>
              <li>Aguarde o Gradle sincronizar as dependências automaticamente (leva ~1 minuto).</li>
              <li>No menu superior do Android Studio, clique em:
                <div className="mt-1 p-2 rounded bg-slate-900 font-mono text-[11px] text-cyan-300">
                  Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)
                </div>
              </li>
              <li>Quando a notificação aparecer no canto inferior direito, clique em <strong>locate</strong> para abrir o arquivo gerado:
                <code className="text-emerald-400 block mt-1">app/build/outputs/apk/debug/app-debug.apk</code>
              </li>
            </ol>
          </div>

          {/* Método 2: Linha de comando Gradle */}
          <div className="p-4 rounded-xl bg-[#030712] border border-blue-900/50 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 text-sm font-bold">
              <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-xs">2</span>
              <span>Método Rápido: Linha de Comando (Terminal / PowerShell)</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Se você já tem o Java 17 e o Android SDK configurados:
            </p>
            <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-200 space-y-1">
              <div className="text-slate-500 text-[10px]"># Linux ou macOS:</div>
              <div>chmod +x gradlew</div>
              <div>./gradlew assembleDebug</div>
              <div className="text-slate-500 text-[10px] pt-1"># Windows (PowerShell):</div>
              <div>.\gradlew.bat assembleDebug</div>
            </div>
          </div>

          {/* Método 3: Compilação na Nuvem pelo GitHub Actions */}
          <div className="p-4 rounded-xl bg-[#030712] border border-blue-900/50 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 text-sm font-bold">
              <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-xs">3</span>
              <span>Método Nuvem: Compilar Grátis pelo GitHub Actions (Sem Instalar Nada)</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              O projeto baixado já contém o arquivo <code className="text-cyan-300">.github/workflows/build-apk.yml</code> configurado!
            </p>
            <ol className="list-decimal list-inside text-xs text-slate-300 space-y-1 pl-1">
              <li>Crie um repositório no seu GitHub e suba os arquivos do ZIP.</li>
              <li>O GitHub iniciará a compilação automaticamente na aba <strong>Actions</strong>.</li>
              <li>Ao finalizar, clique na execução do workflow e baixe o artefato <strong>BrenoBattery-debug-apk</strong> pronto para instalar!</li>
            </ol>
          </div>

          {/* Dica de Instalação no Celular */}
          <div className="p-3.5 rounded-xl bg-blue-950/30 border border-cyan-800/40 text-xs text-slate-300 space-y-1">
            <div className="font-semibold text-cyan-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>Como Instalar o APK no Celular:</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Envie o arquivo <code className="text-cyan-300">app-debug.apk</code> para o seu celular (por WhatsApp, Drive ou cabo USB). Toque no arquivo e permita <em>"Instalar aplicativos de fontes desconhecidas"</em> no Android.
            </p>
          </div>

        </div>

        {/* Rodapé com Ações */}
        <div className="pt-4 border-t border-blue-900/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Fechar
          </button>

          <button
            onClick={() => {
              onClose();
              onDownloadZip();
            }}
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-400 hover:from-cyan-300 hover:to-blue-300 rounded-xl transition-all shadow-md shadow-cyan-500/20"
          >
            Baixar Projeto Android Agora (.ZIP)
          </button>
        </div>

      </div>
    </div>
  );
};
