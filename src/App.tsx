import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { SimpleMode } from './components/SimpleMode';
import { TechnicalMode } from './components/TechnicalMode';
import { HistoryMode } from './components/HistoryMode';
import { AndroidProjectHub } from './components/AndroidProjectHub';
import { SimulationControlsModal } from './components/SimulationControlsModal';
import { ApkGuideModal } from './components/ApkGuideModal';
import { 
  BatteryState, 
  BatteryHistoryEntry 
} from './types/battery';
import { 
  INITIAL_BATTERY_STATE, 
  INITIAL_HISTORY, 
  calculateVoltage, 
  evaluateHealthStatus,
  playBatteryAlertSound
} from './services/batteryEngine';
import { downloadAndroidProjectZip } from './utils/zipGenerator';

// Definição da interface da Web Battery API
interface BatteryManagerNavigator extends Navigator {
  getBattery?: () => Promise<{
    level: number;
    charging: boolean;
    addEventListener: (event: string, handler: () => void) => void;
    removeEventListener: (event: string, handler: () => void) => void;
  }>;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'simple' | 'technical' | 'history' | 'android-project'>('simple');
  const [batteryState, setBatteryState] = useState<BatteryState>(INITIAL_BATTERY_STATE);
  const [history, setHistory] = useState<BatteryHistoryEntry[]>(INITIAL_HISTORY);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isApkGuideOpen, setIsApkGuideOpen] = useState(false);
  const [hasRealBatteryApi, setHasRealBatteryApi] = useState(false);

  // Evitar disparos repetidos de som para o mesmo alerta
  const lastAlarmLevelRef = useRef<number | null>(null);
  const lastAlarmTempRef = useRef<number | null>(null);

  // Download do ZIP completo do projeto Android
  const handleDownloadZip = async () => {
    try {
      setIsDownloading(true);
      await downloadAndroidProjectZip();
    } catch (err) {
      console.error('Erro ao gerar o arquivo ZIP:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  // Adicionar ponto ao histórico
  const addHistorySnapshot = useCallback((eventDesc: string, customLevel?: number) => {
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const lvl = customLevel ?? batteryState.level;

    const newEntry: BatteryHistoryEntry = {
      id: Date.now().toString(),
      timestamp: `Hoje, ${timeFormatted}`,
      level: lvl,
      temperatureC: batteryState.temperatureC,
      voltageMv: batteryState.voltageMv,
      isCharging: batteryState.isCharging,
      event: eventDesc
    };

    setHistory(prev => [newEntry, ...prev.slice(0, 49)]); // Mantém até 50 registros
  }, [batteryState]);

  // Verificar se o alarme térmico ou de carga deve disparar
  useEffect(() => {
    // Alarme Térmico
    if (
      batteryState.highTempAlarmActive && 
      batteryState.temperatureC >= batteryState.highTempAlarmThreshold &&
      lastAlarmTempRef.current !== Math.floor(batteryState.temperatureC)
    ) {
      lastAlarmTempRef.current = Math.floor(batteryState.temperatureC);
      playBatteryAlertSound('warning');
    }

    // Alarme de Carga
    if (
      batteryState.fullChargeAlarmActive && 
      batteryState.isCharging &&
      batteryState.level >= batteryState.fullChargeAlarmThreshold &&
      lastAlarmLevelRef.current !== batteryState.level
    ) {
      lastAlarmLevelRef.current = batteryState.level;
      playBatteryAlertSound('success');
    }
  }, [batteryState]);

  // Detecção e integração com a Web Battery API Real (se suportada no browser)
  useEffect(() => {
    const nav = navigator as BatteryManagerNavigator;
    if (nav.getBattery) {
      setHasRealBatteryApi(true);

      nav.getBattery().then(battery => {
        const updateRealValues = () => {
          const realLevel = Math.round(battery.level * 100);
          const realCharging = battery.charging;

          setBatteryState(prev => {
            if (!prev.isRealBatteryApi) return prev;
            const newVolts = calculateVoltage(realLevel, realCharging);
            return {
              ...prev,
              level: realLevel,
              isCharging: realCharging,
              powerSource: realCharging ? 'Carregador CA' : 'Bateria',
              voltageMv: newVolts,
              chargingCurrentMa: realCharging ? 2100 : -350
            };
          });
        };

        battery.addEventListener('levelchange', updateRealValues);
        battery.addEventListener('chargingchange', updateRealValues);

        return () => {
          battery.removeEventListener('levelchange', updateRealValues);
          battery.removeEventListener('chargingchange', updateRealValues);
        };
      }).catch(() => {
        // Fallback silencioso
      });
    }
  }, []);

  // Leve oscilação de telemetria realista em tempo real (1 segundo)
  useEffect(() => {
    const interval = setInterval(() => {
      setBatteryState(prev => {
        if (prev.isRealBatteryApi) return prev; // Se estiver na API real, respeitar dispositivo

        // Micro-flutuação de milivolts e temperatura para sensação de hardware vivo
        const jitterMv = (Math.random() - 0.5) * 4;
        const newMv = Math.round(calculateVoltage(prev.level, prev.isCharging) + jitterMv);

        // Flutuação térmica suave
        const tempDelta = (Math.random() - 0.5) * 0.08;
        const baseTemp = prev.isCharging ? 33.2 : 29.8;
        const newTemp = Math.max(20, Math.min(48, prev.temperatureC + (baseTemp - prev.temperatureC) * 0.02 + tempDelta));

        return {
          ...prev,
          voltageMv: newMv,
          temperatureC: parseFloat(newTemp.toFixed(1))
        };
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Alternar Modo de Economia
  const handleTogglePowerSaving = () => {
    setBatteryState(prev => {
      const nextSaving = !prev.isPowerSaving;
      const current = nextSaving ? -140 : -380;
      addHistorySnapshot(nextSaving ? 'Modo Economia de Bateria Ativado' : 'Modo Economia Desativado');
      return {
        ...prev,
        isPowerSaving: nextSaving,
        chargingCurrentMa: prev.isCharging ? prev.chargingCurrentMa : current
      };
    });
  };

  // Alternar Alarme de Carga Máxima (80%)
  const handleToggleFullChargeAlarm = () => {
    setBatteryState(prev => ({
      ...prev,
      fullChargeAlarmActive: !prev.fullChargeAlarmActive
    }));
  };

  // Alternar Alarme Térmico
  const handleToggleTempAlarm = () => {
    setBatteryState(prev => ({
      ...prev,
      highTempAlarmActive: !prev.highTempAlarmActive
    }));
  };

  // Atualizar limiares de alarme
  const handleUpdateThresholds = (highTemp: number, fullCharge: number) => {
    setBatteryState(prev => ({
      ...prev,
      highTempAlarmThreshold: highTemp,
      fullChargeAlarmThreshold: fullCharge
    }));
  };

  // Atualizações manuais da simulação
  const handleUpdateState = (newState: Partial<BatteryState>) => {
    setBatteryState(prev => {
      const updated = { ...prev, ...newState, isRealBatteryApi: false };
      return updated;
    });
  };

  // Restaurar padrões
  const handleResetDefaults = () => {
    setBatteryState(INITIAL_BATTERY_STATE);
    addHistorySnapshot('Parâmetros restaurados para o padrão de fábrica');
  };

  // Alternar modo real
  const handleToggleRealApi = () => {
    setBatteryState(prev => ({
      ...prev,
      isRealBatteryApi: !prev.isRealBatteryApi
    }));
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Barra de Navegação Superior (Top Bar Contract) */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onDownloadZip={handleDownloadZip}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        isDownloading={isDownloading}
        batteryLevel={batteryState.level}
        isCharging={batteryState.isCharging}
      />

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6">
        {activeTab === 'simple' && (
          <SimpleMode
            state={batteryState}
            onTogglePowerSaving={handleTogglePowerSaving}
            onToggleFullChargeAlarm={handleToggleFullChargeAlarm}
            onOpenSimulator={() => setIsSimulatorOpen(true)}
          />
        )}

        {activeTab === 'technical' && (
          <TechnicalMode
            state={batteryState}
            onUpdateThresholds={handleUpdateThresholds}
            onToggleTempAlarm={handleToggleTempAlarm}
          />
        )}

        {activeTab === 'history' && (
          <HistoryMode
            history={history}
            onClearHistory={() => setHistory([])}
            onAddSnapshot={(desc) => addHistorySnapshot(desc)}
          />
        )}

        {activeTab === 'android-project' && (
          <AndroidProjectHub
            onDownloadZip={handleDownloadZip}
            isDownloading={isDownloading}
            onOpenApkGuide={() => setIsApkGuideOpen(true)}
          />
        )}
      </main>

      {/* Rodapé Quiet & Clean */}
      <footer className="border-t border-slate-900 bg-[#02050E] py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong className="text-slate-300">Breno Battery</strong> · Monitor de Hardware Android & Projeto Kotlin
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsApkGuideOpen(true)}
              className="hover:text-cyan-400 transition-colors"
            >
              Guia de Compilação APK
            </button>
            <span>·</span>
            <button
              onClick={handleDownloadZip}
              className="hover:text-cyan-400 transition-colors"
            >
              Download ZIP
            </button>
          </div>
        </div>
      </footer>

      {/* Modais de Controle & Tutorial */}
      <SimulationControlsModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        state={batteryState}
        onUpdateState={handleUpdateState}
        onResetDefaults={handleResetDefaults}
        hasRealBatteryApi={hasRealBatteryApi}
        onToggleRealApi={handleToggleRealApi}
      />

      <ApkGuideModal
        isOpen={isApkGuideOpen}
        onClose={() => setIsApkGuideOpen(false)}
        onDownloadZip={handleDownloadZip}
      />

    </div>
  );
}
