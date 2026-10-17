import { BatteryHistoryEntry, BatteryState, BatteryHealthStatus } from '../types/battery';

// Web Audio API para tocar alarmes e beeps sem arquivos externos
export function playBatteryAlertSound(type: 'warning' | 'success' | 'beep') {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === 'warning') {
      // Tom de alerta duplo de sobreaquecimento
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(880, ctx.currentTime);
      osc1.frequency.setValueAtTime(440, ctx.currentTime + 0.15);
      gain1.gain.setValueAtTime(0.15, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.35);
    } else if (type === 'success') {
      // Tom melódico agradável de carga completa
      const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + idx * 0.1 + 0.25);
      });
    } else {
      // Beep suave de interação
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(650, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    }
  } catch {
    // Ignore audio permission/context errors silently
  }
}

export function calculateVoltage(level: number, isCharging: boolean): number {
  // Curva de descarga típica Li-ion: 3400 mV (0%) até 4350 mV (100%)
  const base = 3450 + (level / 100) * 850;
  const chargingOffset = isCharging ? 110 : -40;
  return Math.round(base + chargingOffset);
}

export function calculateEstimatedTime(level: number, isCharging: boolean, isPowerSaving: boolean): string {
  if (isCharging) {
    if (level >= 100) return 'Totalmente carregada';
    const remainingPercent = 100 - level;
    // Aproximadamente 1.2 minutos por 1% em carregamento rápido
    const totalMinutes = Math.round(remainingPercent * 1.15);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return hours > 0 ? `${hours}h ${mins}m até 100%` : `${mins} min até 100%`;
  } else {
    if (level <= 0) return 'Bateria esgotada';
    // Estimativa de autonomia: ~8 minutos por 1% (ou 11 min em economia)
    const multiplier = isPowerSaving ? 11 : 8;
    const totalMinutes = Math.round(level * multiplier);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hours}h ${mins}m restantes`;
  }
}

export function evaluateHealthStatus(temperatureC: number, voltageMv: number, cycles: number): BatteryHealthStatus {
  if (temperatureC >= 45) return 'Sobre-aquecimento';
  if (voltageMv > 4450) return 'Tensão Excessiva';
  if (temperatureC < 0) return 'Fria';
  if (cycles > 800) return 'Normal';
  if (cycles > 400) return 'Boa';
  return 'Excelente';
}

export const INITIAL_BATTERY_STATE: BatteryState = {
  level: 82,
  isCharging: true,
  powerSource: 'Carregador CA',
  temperatureC: 32.8,
  voltageMv: 4185,
  health: 'Excelente',
  technology: 'Li-ion (Íons de Lítio)',
  chargingCurrentMa: 2450,
  chargingWattageW: 10.2,
  designedCapacityMah: 5000,
  estimatedCapacityMah: 4860,
  cyclesCount: 168,
  internalResistanceMohm: 114,
  timeRemainingMinutes: 24,
  isPowerSaving: false,
  highTempAlarmThreshold: 40,
  fullChargeAlarmThreshold: 80,
  highTempAlarmActive: true,
  fullChargeAlarmActive: true,
  isRealBatteryApi: false
};

export const INITIAL_HISTORY: BatteryHistoryEntry[] = [
  {
    id: '1',
    timestamp: 'Hoje, 14:32:00',
    level: 82,
    temperatureC: 32.8,
    voltageMv: 4185,
    isCharging: true,
    event: 'Carregamento Rápido Turbo Conectado'
  },
  {
    id: '2',
    timestamp: 'Hoje, 14:10:15',
    level: 70,
    temperatureC: 31.2,
    voltageMv: 4090,
    isCharging: true,
    event: 'Carga contínua iniciada'
  },
  {
    id: '3',
    timestamp: 'Hoje, 13:45:30',
    level: 54,
    temperatureC: 29.8,
    voltageMv: 3980,
    isCharging: false,
    event: 'Desconectado da tomada'
  },
  {
    id: '4',
    timestamp: 'Hoje, 11:20:00',
    level: 68,
    temperatureC: 28.5,
    voltageMv: 4020,
    isCharging: false,
    event: 'Uso de tela normal (Modo Simples)'
  },
  {
    id: '5',
    timestamp: 'Hoje, 09:15:22',
    level: 95,
    temperatureC: 30.1,
    voltageMv: 4290,
    isCharging: false,
    event: 'Retirado do carregador matinal'
  }
];
