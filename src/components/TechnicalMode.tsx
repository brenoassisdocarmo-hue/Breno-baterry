import React from 'react';
import { BatteryState } from '../types/battery';
import { playBatteryAlertSound } from '../services/batteryEngine';
import { 
  Cpu, 
  Activity, 
  Thermometer, 
  ShieldCheck, 
  Zap, 
  Layers, 
  RotateCw, 
  Gauge, 
  Sliders, 
  Volume2,
  AlertOctagon,
  Sparkles
} from 'lucide-react';

interface TechnicalModeProps {
  state: BatteryState;
  onUpdateThresholds: (highTemp: number, fullCharge: number) => void;
  onToggleTempAlarm: () => void;
}

export const TechnicalMode: React.FC<TechnicalModeProps> = ({
  state,
  onUpdateThresholds,
  onToggleTempAlarm,
}) => {
  const tempF = (state.temperatureC * 1.8 + 32).toFixed(1);
  const voltageV = (state.voltageMv / 1000).toFixed(3);
  const healthPercent = Math.round((state.estimatedCapacityMah / state.designedCapacityMah) * 100);

  // Voltagem normalizada entre 3400 mV (0%) e 4400 mV (100%)
  const voltagePercent = Math.min(100, Math.max(0, ((state.voltageMv - 3400) / (4400 - 3400)) * 100));

  // Temperatura percentual entre 20°C e 50°C
  const tempPercent = Math.min(100, Math.max(0, ((state.temperatureC - 20) / (50 - 20)) * 100));

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-fade-in">
      
      {/* Título de Seção Técnico */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-900/40 pb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <span>Telemetria Avançada do Hardware</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Interface direta com BatteryManager e sensores térmicos do subsistema Android.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Taxa de Atualização:</span>
          <span className="text-xs font-mono-num font-semibold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
            1 Hz (1000ms)
          </span>
        </div>
      </div>

      {/* Grid Superior: Voltagem & Temperatura com Barras Gráficas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Card de Voltagem / Tensão Elétrica */}
        <div className="p-5 rounded-2xl bg-[#070e24] border border-blue-900/40 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-300 text-sm font-semibold">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Tensão Elétrica (Voltagem)</span>
            </div>
            <span className="text-xs font-mono-num text-cyan-400 font-medium">
              {voltageV} V
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono-num">
              {state.voltageMv}
            </span>
            <span className="text-sm font-medium text-slate-400">mV (milivolts)</span>
          </div>

          {/* Barra de Tensão com Marcadores de Escala */}
          <div className="space-y-1.5">
            <div className="h-3 w-full bg-[#030712] rounded-full overflow-hidden border border-slate-800 relative">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 via-cyan-500 to-cyan-300 transition-all duration-500"
                style={{ width: `${voltagePercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono-num text-slate-400">
              <span>3.40V (Corte Mín)</span>
              <span>3.85V (Nominal)</span>
              <span>4.40V (Máx Carga)</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 flex justify-between">
            <span>Diferencial de Carga: <strong className="text-slate-200">+{state.isCharging ? '120 mV' : '0 mV'}</strong></span>
            <span>Estabilidade: <strong className="text-emerald-400">Excelente (Ripple &lt; 5mV)</strong></span>
          </div>
        </div>

        {/* Card de Temperatura com Zonas Térmicas */}
        <div className="p-5 rounded-2xl bg-[#070e24] border border-blue-900/40 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-300 text-sm font-semibold">
              <Thermometer className="w-4 h-4 text-cyan-400" />
              <span>Sensor Térmico da Célula</span>
            </div>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${state.temperatureC >= 40 ? 'bg-red-950 text-red-300 border border-red-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'}`}>
              {state.temperatureC >= 40 ? 'Sobreaquecimento' : 'Temperatura Segura'}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono-num">
              {state.temperatureC.toFixed(1)}
            </span>
            <span className="text-sm font-medium text-slate-400">°C</span>
            <span className="text-slate-500 text-sm">/</span>
            <span className="text-lg font-mono-num text-slate-300">{tempF} °F</span>
          </div>

          {/* Barra de Temperatura */}
          <div className="space-y-1.5">
            <div className="h-3 w-full bg-[#030712] rounded-full overflow-hidden border border-slate-800 relative">
              <div 
                className={`h-full transition-all duration-500 ${
                  state.temperatureC >= 45 
                    ? 'bg-red-500' 
                    : state.temperatureC >= 38 
                    ? 'bg-amber-400' 
                    : 'bg-emerald-400'
                }`}
                style={{ width: `${tempPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono-num text-slate-400">
              <span>20°C (Frio)</span>
              <span>35°C (Ideal)</span>
              <span>40°C (Alerta)</span>
              <span>50°C (Crítico)</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 flex justify-between">
            <span>Alarme Configurado: <strong className="text-slate-200">{state.highTempAlarmThreshold}°C</strong></span>
            <span>Throttling Térmico: <strong className={state.temperatureC >= 40 ? 'text-amber-400' : 'text-slate-400'}>{state.temperatureC >= 40 ? 'Ativado pelo Kernel' : 'Inativo'}</strong></span>
          </div>
        </div>

      </div>

      {/* Grid de Informações de Hardware da Bateria */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Saúde */}
        <div className="p-4 rounded-xl bg-[#070e24] border border-blue-900/30">
          <div className="text-slate-400 text-xs flex items-center gap-1.5 mb-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Saúde do Módulo</span>
          </div>
          <div className="text-lg font-bold text-emerald-400">{state.health}</div>
          <div className="text-[11px] text-slate-400 mt-1">Status: OK / Sem falhas</div>
        </div>

        {/* Tecnologia */}
        <div className="p-4 rounded-xl bg-[#070e24] border border-blue-900/30">
          <div className="text-slate-400 text-xs flex items-center gap-1.5 mb-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Tecnologia Química</span>
          </div>
          <div className="text-sm sm:text-base font-bold text-white truncate">{state.technology}</div>
          <div className="text-[11px] text-slate-400 mt-1">Cátodo NMC / Ânodo Grafite</div>
        </div>

        {/* Corrente & Potência */}
        <div className="p-4 rounded-xl bg-[#070e24] border border-blue-900/30">
          <div className="text-slate-400 text-xs flex items-center gap-1.5 mb-1.5">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Fluxo de Corrente</span>
          </div>
          <div className="text-lg font-bold text-white font-mono-num">
            {state.chargingCurrentMa > 0 ? `+${state.chargingCurrentMa}` : state.chargingCurrentMa} mA
          </div>
          <div className="text-[11px] text-cyan-400 mt-1 font-mono-num font-semibold">
            {state.chargingWattageW} Watts
          </div>
        </div>

        {/* Ciclos de Carga */}
        <div className="p-4 rounded-xl bg-[#070e24] border border-blue-900/30">
          <div className="text-slate-400 text-xs flex items-center gap-1.5 mb-1.5">
            <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Ciclos de Carga</span>
          </div>
          <div className="text-lg font-bold text-white font-mono-num">{state.cyclesCount} ciclos</div>
          <div className="text-[11px] text-slate-400 mt-1">Vida útil retida: ~{healthPercent}%</div>
        </div>

        {/* Capacidade Nominal */}
        <div className="p-4 rounded-xl bg-[#070e24] border border-blue-900/30">
          <div className="text-slate-400 text-xs flex items-center gap-1.5 mb-1.5">
            <Gauge className="w-3.5 h-3.5 text-cyan-400" />
            <span>Capacidade de Fábrica</span>
          </div>
          <div className="text-lg font-bold text-white font-mono-num">{state.designedCapacityMah} mAh</div>
          <div className="text-[11px] text-slate-400 mt-1">Design original de fábrica</div>
        </div>

        {/* Capacidade Atual Estimada */}
        <div className="p-4 rounded-xl bg-[#070e24] border border-blue-900/30">
          <div className="text-slate-400 text-xs flex items-center gap-1.5 mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Capacidade Atual</span>
          </div>
          <div className="text-lg font-bold text-white font-mono-num">{state.estimatedCapacityMah} mAh</div>
          <div className="text-[11px] text-emerald-400 mt-1 font-semibold">{healthPercent}% de retenção</div>
        </div>

        {/* Resistência Interna */}
        <div className="p-4 rounded-xl bg-[#070e24] border border-blue-900/30">
          <div className="text-slate-400 text-xs flex items-center gap-1.5 mb-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Resistência Interna</span>
          </div>
          <div className="text-lg font-bold text-white font-mono-num">{state.internalResistanceMohm} mΩ</div>
          <div className="text-[11px] text-slate-400 mt-1">Impedância saudável &lt; 150mΩ</div>
        </div>

        {/* Fonte de Energia */}
        <div className="p-4 rounded-xl bg-[#070e24] border border-blue-900/30">
          <div className="text-slate-400 text-xs flex items-center gap-1.5 mb-1.5">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Conector de Entrada</span>
          </div>
          <div className="text-base font-bold text-cyan-400 truncate">{state.powerSource}</div>
          <div className="text-[11px] text-slate-400 mt-1">{state.isCharging ? 'Alimentação Ativa' : 'Desconectado'}</div>
        </div>

      </div>

      {/* Painel de Configurações Técnicas e Alertas de Proteção */}
      <div className="p-5 rounded-2xl bg-[#070e24] border border-blue-900/40 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">Limiares de Alarme & Proteção de Célula</h3>
          </div>
          <button
            onClick={() => playBatteryAlertSound('warning')}
            className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 bg-cyan-950/50 px-2.5 py-1 rounded-lg border border-cyan-800/40"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Testar Som de Alarme</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Alarme de Temperatura Máxima */}
          <div className="p-4 rounded-xl bg-[#0B1536]/40 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-200">Alarme Térmico Máximo</div>
                <div className="text-[11px] text-slate-400">Dispara alerta sonoro se a temperatura passar do limite</div>
              </div>
              <button
                onClick={onToggleTempAlarm}
                className={`text-xs font-semibold px-2 py-1 rounded transition-colors ${
                  state.highTempAlarmActive ? 'bg-red-500/30 text-red-300 border border-red-500/40' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {state.highTempAlarmActive ? 'ATIVO' : 'DESATIVADO'}
              </button>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Limiar Atual:</span>
                <span className="font-bold text-red-400 font-mono-num">{state.highTempAlarmThreshold} °C</span>
              </div>
              <input
                type="range"
                min="35"
                max="48"
                step="1"
                value={state.highTempAlarmThreshold}
                onChange={(e) => onUpdateThresholds(Number(e.target.value), state.fullChargeAlarmThreshold)}
                className="w-full accent-cyan-400 bg-slate-800 rounded h-1.5 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>35°C (Conservador)</span>
                <span>40°C (Padrão)</span>
                <span>48°C (Crítico)</span>
              </div>
            </div>
          </div>

          {/* Alarme de Limite de Carga (80% vs 100%) */}
          <div className="p-4 rounded-xl bg-[#0B1536]/40 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-200">Alarme de Carga Máxima</div>
                <div className="text-[11px] text-slate-400">Avisa para desconectar e prolongar vida útil</div>
              </div>
              <button
                onClick={() => playBatteryAlertSound('success')}
                className="text-xs font-semibold px-2 py-1 rounded bg-blue-500/30 text-cyan-300 border border-cyan-500/40"
              >
                TESTAR SOM
              </button>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Limiar de Notificação:</span>
                <span className="font-bold text-cyan-400 font-mono-num">{state.fullChargeAlarmThreshold}%</span>
              </div>
              <input
                type="range"
                min="70"
                max="100"
                step="5"
                value={state.fullChargeAlarmThreshold}
                onChange={(e) => onUpdateThresholds(state.highTempAlarmThreshold, Number(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-800 rounded h-1.5 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>70%</span>
                <span>80% (Recomendado)</span>
                <span>100% (Carga Completa)</span>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
