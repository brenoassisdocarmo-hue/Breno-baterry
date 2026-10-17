import React from 'react';
import { BatteryState } from '../types/battery';
import { calculateEstimatedTime } from '../services/batteryEngine';
import { 
  Zap, 
  ShieldCheck, 
  Thermometer, 
  Activity, 
  BatteryMedium, 
  Clock, 
  Leaf, 
  BellRing, 
  Moon,
  AlertTriangle
} from 'lucide-react';

interface SimpleModeProps {
  state: BatteryState;
  onTogglePowerSaving: () => void;
  onToggleFullChargeAlarm: () => void;
  onOpenSimulator: () => void;
}

export const SimpleMode: React.FC<SimpleModeProps> = ({
  state,
  onTogglePowerSaving,
  onToggleFullChargeAlarm,
  onOpenSimulator,
}) => {
  const estimatedTime = calculateEstimatedTime(state.level, state.isCharging, state.isPowerSaving);

  // Math for Circular Gauge SVG
  const radius = 95;
  const circumference = 2 * Math.PI * radius;
  // Sweep angle of 270 degrees (starts at 135 deg, ends at 45 deg)
  const strokeDashoffset = circumference - (state.level / 100) * (circumference * 0.75);

  // Color dynamics
  const getLevelColor = () => {
    if (state.isCharging) return '#00E5FF';
    if (state.level <= 15) return '#EF4444';
    if (state.level <= 30) return '#F59E0B';
    return '#00E5FF';
  };

  const isOverheating = state.temperatureC >= 40;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-fade-in">
      
      {/* Alerta de Sobreaquecimento caso a temperatura passe do limite */}
      {isOverheating && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/50 flex items-center gap-3 text-red-200">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 animate-bounce" />
          <div className="text-xs sm:text-sm">
            <span className="font-bold">Aviso de Temperatura Elevada:</span> A bateria atingiu {state.temperatureC}°C. Desconecte o carregador ou feche apps pesados para preservar a vida útil da célula.
          </div>
        </div>
      )}

      {/* Hero: Medidor Circular Central Futurista */}
      <div className="relative rounded-2xl bg-gradient-to-b from-[#0B1536] to-[#050B1C] border border-blue-900/40 p-6 sm:p-8 flex flex-col items-center justify-center shadow-xl shadow-black/40 overflow-hidden">
        
        {/* Glow de fundo */}
        <div 
          className="absolute -top-12 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors"
          style={{ backgroundColor: getLevelColor() }}
        />

        {/* Medidor Circular */}
        <div className="relative w-64 h-64 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 220 220">
            {/* Trilho de Fundo Cinza Azulado */}
            <circle
              cx="110"
              cy="110"
              r={radius}
              stroke="#0f1f45"
              strokeWidth="14"
              strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
              strokeDashoffset={0}
              strokeLinecap="round"
              fill="none"
              transform="rotate(135 110 110)"
            />

            {/* Arco Ativo com Gradiente e Brilho */}
            <circle
              cx="110"
              cy="110"
              r={radius}
              stroke={getLevelColor()}
              strokeWidth="14"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="none"
              transform="rotate(135 110 110)"
              className="transition-all duration-700 ease-out"
              style={{
                filter: `drop-shadow(0 0 8px ${getLevelColor()})`
              }}
            />
          </svg>

          {/* Conteúdo Central do Medidor */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            {state.isCharging && (
              <div className="flex items-center gap-1 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-1 animate-pulse">
                <Zap className="w-4 h-4 fill-cyan-400 text-cyan-400" />
                <span>Carregando Rápido</span>
              </div>
            )}
            
            <div className="flex items-baseline justify-center">
              <span className="text-5xl sm:text-6xl font-extrabold tracking-tight text-white font-mono-num">
                {state.level}
              </span>
              <span className="text-2xl sm:text-3xl font-bold text-cyan-400 ml-1">%</span>
            </div>

            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-300">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{estimatedTime}</span>
            </div>

            <div className="mt-2 text-[11px] text-slate-400">
              {state.isCharging ? state.powerSource : 'Operando em Bateria'}
            </div>
          </div>
        </div>

        {/* Rodapé do Card do Medidor */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 w-full flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span>Potência: <strong className="text-white font-mono-num">{state.chargingWattageW}W</strong></span>
          </div>
          <button
            onClick={onOpenSimulator}
            className="text-cyan-400 hover:text-cyan-300 font-medium underline-offset-4 hover:underline"
          >
            Ajustar Valores de Teste
          </button>
        </div>
      </div>

      {/* Grid de 4 Métricas Chave do Modo Simples */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Temperatura */}
        <div className="p-4 rounded-xl bg-[#070e24] border border-blue-900/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Temperatura</span>
            <Thermometer className={`w-4 h-4 ${isOverheating ? 'text-red-400' : 'text-cyan-400'}`} />
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-bold text-white font-mono-num">
              {state.temperatureC.toFixed(1)} <span className="text-sm font-normal text-slate-400">°C</span>
            </div>
            <div className={`text-[11px] mt-0.5 ${isOverheating ? 'text-red-400 font-semibold' : 'text-emerald-400'}`}>
              {isOverheating ? 'Alerta Térmico' : 'Faixa Segura'}
            </div>
          </div>
        </div>

        {/* Tensão / Voltagem */}
        <div className="p-4 rounded-xl bg-[#070e24] border border-blue-900/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Voltagem</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-bold text-white font-mono-num">
              {(state.voltageMv / 1000).toFixed(2)} <span className="text-sm font-normal text-slate-400">V</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 font-mono-num">
              {state.voltageMv} mV
            </div>
          </div>
        </div>

        {/* Saúde da Bateria */}
        <div className="p-4 rounded-xl bg-[#070e24] border border-blue-900/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Saúde</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-bold text-emerald-400">
              {state.health}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Capacidade {Math.round((state.estimatedCapacityMah / state.designedCapacityMah) * 100)}%
            </div>
          </div>
        </div>

        {/* Corrente em mA */}
        <div className="p-4 rounded-xl bg-[#070e24] border border-blue-900/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Corrente</span>
            <BatteryMedium className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-bold text-white font-mono-num">
              {state.chargingCurrentMa > 0 ? `+${state.chargingCurrentMa}` : state.chargingCurrentMa} <span className="text-xs font-normal text-slate-400">mA</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {state.isCharging ? 'Taxa de Entrada' : 'Consumo Ativo'}
            </div>
          </div>
        </div>

      </div>

      {/* Controles e Recursos Rápidos */}
      <div className="p-5 rounded-2xl bg-[#070e24] border border-blue-900/30 space-y-4">
        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <span>Otimizações e Alertas Rápidos</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          
          {/* Economia de Energia */}
          <button
            onClick={onTogglePowerSaving}
            className={`p-3.5 rounded-xl border flex items-center justify-between transition-all text-left ${
              state.isPowerSaving
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-100 shadow-md shadow-emerald-900/20'
                : 'bg-[#0B1536]/50 border-slate-800 text-slate-300 hover:bg-[#0B1536]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${state.isPowerSaving ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                <Leaf className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold">Economia de Bateria</div>
                <div className="text-[11px] text-slate-400">Reduz consumo em segundo plano</div>
              </div>
            </div>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${state.isPowerSaving ? 'bg-emerald-500/30 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
              {state.isPowerSaving ? 'ATIVADO' : 'DESLIGADO'}
            </span>
          </button>

          {/* Alarme de Limite 80% */}
          <button
            onClick={onToggleFullChargeAlarm}
            className={`p-3.5 rounded-xl border flex items-center justify-between transition-all text-left ${
              state.fullChargeAlarmActive
                ? 'bg-blue-950/40 border-cyan-500/40 text-cyan-100 shadow-md shadow-cyan-900/20'
                : 'bg-[#0B1536]/50 border-slate-800 text-slate-300 hover:bg-[#0B1536]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${state.fullChargeAlarmActive ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-400'}`}>
                <BellRing className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold">Alarme Proteção 80%</div>
                <div className="text-[11px] text-slate-400">Avisa ao atingir 80% para poupar ciclos</div>
              </div>
            </div>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${state.fullChargeAlarmActive ? 'bg-cyan-500/30 text-cyan-300' : 'bg-slate-800 text-slate-400'}`}>
              {state.fullChargeAlarmActive ? 'ATIVADO' : 'DESLIGADO'}
            </span>
          </button>

        </div>
      </div>

    </div>
  );
};
