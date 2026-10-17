import React from 'react';
import { BatteryState, PowerSourceType } from '../types/battery';
import { calculateVoltage, evaluateHealthStatus } from '../services/batteryEngine';
import { X, SlidersHorizontal, RotateCcw, Zap, Thermometer, ShieldAlert } from 'lucide-react';

interface SimulationControlsModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: BatteryState;
  onUpdateState: (newState: Partial<BatteryState>) => void;
  onResetDefaults: () => void;
  hasRealBatteryApi: boolean;
  onToggleRealApi: () => void;
}

export const SimulationControlsModal: React.FC<SimulationControlsModalProps> = ({
  isOpen,
  onClose,
  state,
  onUpdateState,
  onResetDefaults,
  hasRealBatteryApi,
  onToggleRealApi,
}) => {
  if (!isOpen) return null;

  const handleLevelChange = (lvl: number) => {
    const newVolts = calculateVoltage(lvl, state.isCharging);
    const newHealth = evaluateHealthStatus(state.temperatureC, newVolts, state.cyclesCount);
    onUpdateState({
      level: lvl,
      voltageMv: newVolts,
      health: newHealth
    });
  };

  const handleTempChange = (temp: number) => {
    const newHealth = evaluateHealthStatus(temp, state.voltageMv, state.cyclesCount);
    onUpdateState({
      temperatureC: temp,
      health: newHealth
    });
  };

  const handleChargingToggle = (charging: boolean) => {
    const newVolts = calculateVoltage(state.level, charging);
    const source: PowerSourceType = charging ? 'Carregador CA' : 'Bateria';
    onUpdateState({
      isCharging: charging,
      powerSource: source,
      voltageMv: newVolts,
      chargingCurrentMa: charging ? 2450 : (state.isPowerSaving ? -150 : -380),
      chargingWattageW: charging ? 10.2 : 0
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-lg bg-[#070e24] border border-cyan-500/30 rounded-2xl p-6 shadow-2xl space-y-5"
        role="dialog"
        aria-modal="true"
      >
        {/* Header do Modal */}
        <div className="flex items-center justify-between border-b border-blue-900/40 pb-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">Painel de Simulação & Testes</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informação sobre API Real do Navegador */}
        {hasRealBatteryApi && (
          <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-800 flex items-center justify-between">
            <div className="text-xs">
              <div className="font-semibold text-cyan-300">Web Battery API Detectada</div>
              <div className="text-[11px] text-slate-400">Ler dados reais da bateria do seu dispositivo</div>
            </div>
            <button
              onClick={onToggleRealApi}
              className={`px-3 py-1 rounded text-xs font-semibold ${
                state.isRealBatteryApi 
                  ? 'bg-cyan-500 text-slate-950' 
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              {state.isRealBatteryApi ? 'MODO REAL' : 'ATIVAR REAL'}
            </button>
          </div>
        )}

        {/* Controles de Simulação */}
        <div className="space-y-4">
          
          {/* Nível de Bateria (Slider) */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Nível de Carga da Bateria:</span>
              <span className="font-mono-num font-bold text-cyan-400">{state.level}%</span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              value={state.level}
              onChange={(e) => handleLevelChange(Number(e.target.value))}
              className="w-full accent-cyan-400 bg-slate-900 rounded h-2 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0% Crítico</span>
              <span>20% Alerta</span>
              <span>50%</span>
              <span>80% Protegido</span>
              <span>100% Cheia</span>
            </div>
          </div>

          {/* Estado de Carregamento (Toggle) */}
          <div className="space-y-1.5">
            <div className="text-xs text-slate-300 font-medium">Status de Carregamento:</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleChargingToggle(true)}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  state.isCharging
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>Carregando (Conectado)</span>
              </button>

              <button
                onClick={() => handleChargingToggle(false)}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  !state.isCharging
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                <span>Em Descarga (Sem Cabo)</span>
              </button>
            </div>
          </div>

          {/* Temperatura (Slider) */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Temperatura Térmica (°C):</span>
              <span className={`font-mono-num font-bold ${state.temperatureC >= 40 ? 'text-red-400' : 'text-emerald-400'}`}>
                {state.temperatureC.toFixed(1)} °C
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="50"
              step="0.5"
              value={state.temperatureC}
              onChange={(e) => handleTempChange(Number(e.target.value))}
              className="w-full accent-cyan-400 bg-slate-900 rounded h-2 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>20°C (Frio)</span>
              <span>32°C (Ideal)</span>
              <span>42°C (Alarme de Calor)</span>
              <span>50°C (Crítico)</span>
            </div>
          </div>

          {/* Teste Rápido de Cenários */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <div className="text-[11px] text-slate-400 font-semibold">Cenários Rápidos:</div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  handleLevelChange(12);
                  handleChargingToggle(false);
                  handleTempChange(30);
                }}
                className="px-2.5 py-1 text-[11px] rounded bg-slate-900 hover:bg-slate-800 text-red-300 border border-red-900/40"
              >
                Bateria Fraca (12%)
              </button>

              <button
                onClick={() => {
                  handleLevelChange(80);
                  handleChargingToggle(true);
                  handleTempChange(33);
                }}
                className="px-2.5 py-1 text-[11px] rounded bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-900/40"
              >
                Carga 80% (Alarme)
              </button>

              <button
                onClick={() => {
                  handleTempChange(44);
                }}
                className="px-2.5 py-1 text-[11px] rounded bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-900/40"
              >
                Sobreaquecimento (44°C)
              </button>
            </div>
          </div>

        </div>

        {/* Rodapé */}
        <div className="pt-3 border-t border-blue-900/40 flex items-center justify-between">
          <button
            onClick={onResetDefaults}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Valores Padrão</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors"
          >
            Fechar Painel
          </button>
        </div>

      </div>
    </div>
  );
};
