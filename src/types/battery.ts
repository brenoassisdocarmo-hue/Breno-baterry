export type BatteryHealthStatus = 
  | 'Excelente' 
  | 'Boa' 
  | 'Normal' 
  | 'Sobre-aquecimento' 
  | 'Tensão Excessiva' 
  | 'Fria' 
  | 'Inoperante';

export type PowerSourceType = 'Bateria' | 'Carregador CA' | 'USB' | 'Indução Sem Fio';

export type BatteryTechnology = 'Li-ion (Íons de Lítio)' | 'Li-Poly (Polímero de Lítio)' | 'LiFePO4';

export interface BatteryState {
  level: number; // 0 to 100
  isCharging: boolean;
  powerSource: PowerSourceType;
  temperatureC: number; // Celsius (e.g. 31.5)
  voltageMv: number; // Millivolts (e.g. 4120)
  health: BatteryHealthStatus;
  technology: BatteryTechnology;
  chargingCurrentMa: number; // mA (positive if charging, negative if discharging)
  chargingWattageW: number; // Watts
  designedCapacityMah: number; // e.g. 5000 mAh
  estimatedCapacityMah: number; // e.g. 4850 mAh
  cyclesCount: number; // e.g. 182
  internalResistanceMohm: number; // e.g. 115 mOhm
  timeRemainingMinutes: number | null; // null if calculated, or minutes
  isPowerSaving: boolean;
  highTempAlarmThreshold: number; // default 40°C
  fullChargeAlarmThreshold: number; // default 80% or 100%
  highTempAlarmActive: boolean;
  fullChargeAlarmActive: boolean;
  isRealBatteryApi: boolean;
}

export interface BatteryHistoryEntry {
  id: string;
  timestamp: string; // ISO string or formatted
  level: number;
  temperatureC: number;
  voltageMv: number;
  isCharging: boolean;
  event: string;
}

export interface AndroidFileDefinition {
  path: string;
  filename: string;
  language: 'kotlin' | 'xml' | 'groovy' | 'properties' | 'yaml' | 'markdown';
  content: string;
  category: 'kotlin' | 'manifest' | 'gradle' | 'res' | 'ci';
  description: string;
}
