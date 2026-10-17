import React, { useState } from 'react';
import { BatteryHistoryEntry } from '../types/battery';
import { 
  History, 
  Trash2, 
  Download, 
  PlusCircle, 
  TrendingUp, 
  Zap, 
  Calendar, 
  CheckCircle2, 
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface HistoryModeProps {
  history: BatteryHistoryEntry[];
  onClearHistory: () => void;
  onAddSnapshot: (eventDesc: string) => void;
}

export const HistoryMode: React.FC<HistoryModeProps> = ({
  history,
  onClearHistory,
  onAddSnapshot,
}) => {
  const [filter, setFilter] = useState<'all' | 'charging' | 'discharging'>('all');
  const [customEvent, setCustomEvent] = useState('');

  const filteredHistory = history.filter(item => {
    if (filter === 'charging') return item.isCharging;
    if (filter === 'discharging') return !item.isCharging;
    return true;
  });

  const handleExportCSV = () => {
    const headers = 'ID,Data/Hora,Nivel(%),Temperatura(C),Voltagem(mV),Carregando,Evento\n';
    const rows = history
      .map(h => `"${h.id}","${h.timestamp}",${h.level},${h.temperatureC},${h.voltageMv},${h.isCharging},"${h.event}"`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `BrenoBattery_Historico_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEvent.trim()) return;
    onAddSnapshot(customEvent.trim());
    setCustomEvent('');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-fade-in">
      
      {/* Top Header of History Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-blue-900/40 pb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-400" />
            <span>Histórico & Linha do Tempo</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Registro contínuo de cargas, descargas, temperatura e variações de tensão.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-900 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={onClearHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-300 bg-red-950/40 border border-red-800/50 rounded-lg hover:bg-red-900/50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
            <span>Limpar Histórico</span>
          </button>
        </div>
      </div>

      {/* Gráfico Visual Dinâmico de Curva de Carga (SVG Interativo) */}
      <div className="p-5 rounded-2xl bg-[#070e24] border border-blue-900/40 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-200 text-sm font-semibold">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span>Gráfico de Nível da Bateria (%) e Temperatura (°C)</span>
          </div>
          <span className="text-xs text-slate-400 font-mono-num">{history.length} amostras</span>
        </div>

        {/* Renderização do Gráfico SVG */}
        <div className="h-44 w-full relative pt-2">
          {history.length > 1 ? (
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 120" preserveAspectRatio="none">
              <defs>
                <linearGradient id="batteryGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#00E5FF" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Linhas de Grade Horizontais */}
              <line x1="0" y1="20" x2="500" y2="20" stroke="#1e293b" strokeDasharray="3 3" />
              <line x1="0" y1="60" x2="500" y2="60" stroke="#1e293b" strokeDasharray="3 3" />
              <line x1="0" y1="100" x2="500" y2="100" stroke="#1e293b" strokeDasharray="3 3" />

              {/* Curva de Nível da Bateria */}
              {(() => {
                const points = history.map((item, index) => {
                  const x = (index / (history.length - 1)) * 500;
                  // y maps 100% to 15, 0% to 110
                  const y = 110 - (item.level / 100) * 95;
                  return { x, y, item };
                });

                const pathD = points.reduce((acc, curr, i) => {
                  return i === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
                }, '');

                const areaD = `${pathD} L 500 120 L 0 120 Z`;

                return (
                  <>
                    <path d={areaD} fill="url(#batteryGrad)" />
                    <path d={pathD} fill="none" stroke="#00E5FF" strokeWidth="2.5" strokeLinecap="round" />
                    {points.map((p, idx) => (
                      <circle
                        key={idx}
                        cx={p.x}
                        cy={p.y}
                        r="3.5"
                        fill="#030712"
                        stroke="#00E5FF"
                        strokeWidth="2"
                      />
                    ))}
                  </>
                );
              })()}
            </svg>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-500">
              Coletando mais dados para traçar curva gráfica completa...
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 font-mono-num">
          <span>Início do Monitoramento</span>
          <span className="flex items-center gap-1 text-cyan-400">
            <span className="w-2.5 h-0.5 bg-cyan-400 inline-block"></span> Linha de Carga (%)
          </span>
          <span>Tempo Real (Agora)</span>
        </div>
      </div>

      {/* Formulário Rápido para Criar Ponto de Verificação */}
      <form onSubmit={handleManualAdd} className="p-4 rounded-xl bg-[#070e24] border border-blue-900/30 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={customEvent}
          onChange={(e) => setCustomEvent(e.target.value)}
          placeholder="Ex: Jogo 3D pesado iniciado, Teste de recarga turbo, etc."
          className="flex-1 bg-[#030712] border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
        />
        <button
          type="submit"
          className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-900 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors whitespace-nowrap"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Registrar Ponto</span>
        </button>
      </form>

      {/* Filtro e Lista de Entradas de Histórico */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold text-slate-300">
            Registros Coletados ({filteredHistory.length})
          </div>

          {/* Filtros em abas limpas (Sem pills) */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                filter === 'all' ? 'bg-[#0B1536] text-cyan-300 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilter('charging')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                filter === 'charging' ? 'bg-[#0B1536] text-cyan-300 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Carregando
            </button>
            <button
              onClick={() => setFilter('discharging')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                filter === 'discharging' ? 'bg-[#0B1536] text-cyan-300 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Em Descarga
            </button>
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-[#070e24] border border-slate-800 text-slate-500 text-xs">
            Nenhum registro com o filtro atual. Conecte o carregador ou clique em "Registrar Ponto".
          </div>
        ) : (
          <div className="space-y-2">
            {filteredHistory.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-[#070e24] border border-blue-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:border-cyan-500/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg shrink-0 ${
                    item.isCharging 
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' 
                      : 'bg-slate-800/80 text-slate-400'
                  }`}>
                    {item.isCharging ? (
                      <ArrowUpRight className="w-4 h-4 text-cyan-400" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-amber-400" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-semibold text-white">
                      {item.event}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>{item.timestamp}</span>
                      </span>
                      <span>·</span>
                      <span className="font-mono-num">{item.temperatureC.toFixed(1)}°C</span>
                      <span>·</span>
                      <span className="font-mono-num">{item.voltageMv} mV</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 text-right">
                  <span className={`text-base font-bold font-mono-num ${
                    item.isCharging ? 'text-cyan-400' : 'text-slate-200'
                  }`}>
                    {item.level}%
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase font-medium">
                    {item.isCharging ? 'Carga' : 'Uso'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
