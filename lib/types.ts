export type FreshnessState = 'FRESH' | 'USE_SOON' | 'CHECK_FOOD' | 'SENSOR_FAULT';

export type FoodCategory =
  | 'Dairy'
  | 'Meat & Poultry'
  | 'Seafood'
  | 'Fresh Produce'
  | 'Leftovers & Cooked'
  | 'Beverages'
  | 'Bakery & Sweets';

export interface SensorTelemetry {
  temperature: number; // in °C
  humidity: number; // in %
  gasRaw: number; // 0-32767 ADS1115 16-bit
  gasVoltage: number; // in Volts
  gasBaseline: number; // calibrated clean air baseline
  gasRatio: number; // Rs/Ro relative ratio
  gasStatus: 'CLEAN' | 'NORMAL' | 'ELEVATED' | 'SPOILAGE_WARNING';
  doorOpen: boolean;
  doorOpenSeconds: number;
  doorOpenCountToday: number;
  dht11Healthy: boolean;
  ads1115Healthy: boolean;
  mq135Healthy: boolean;
  ds3231Healthy: boolean;
  rc522Healthy: boolean;
  reedSwitchHealthy: boolean;
  psuVoltage: number; // e.g. 5.12V
  lastUpdated: string;
}

export interface FoodItem {
  id: string;
  rfidUid: string;
  name: string;
  category: FoodCategory;
  quantity: string;
  storageZone: 'Shelf 1 (Chilled)' | 'Shelf 2 (Main)' | 'Crisper Drawer' | 'Door Rack';
  storedDate: string; // ISO date or formatted
  expiryDate: string;
  maxStorageDays: number;
  daysRemaining: number;
  status: FreshnessState;
  storageDurationHours: number;
  lastInspectionNote?: string;
  flaggedReason?: string;
}

export interface Alert {
  id: string;
  level: 'CRITICAL' | 'WARNING' | 'INFO' | 'RECOMMENDATION';
  title: string;
  message: string;
  timestamp: string;
  source: 'DHT11' | 'MQ135' | 'REED_SWITCH' | 'EXPIRY' | 'SENSOR_FAULT' | 'RFID';
  resolved: boolean;
  actionAdvice: string;
}

export interface ThresholdMatrixEntry {
  category: FoodCategory;
  tempMin: number;
  tempMax: number;
  humidityMin: number;
  humidityMax: number;
  maxDays: number;
  gasThresholdMultiplier: number;
  spoilageSigns: string;
  storageGuideline: string;
}

export interface HardwareStatus {
  rpi3b: {
    hostname: string;
    ipAddress: string;
    cpuUsage: number;
    cpuTemp: number;
    ramUsageMB: number;
    ramTotalMB: number;
    uptime: string;
    wifiSignalDbm: number;
  };
  ads1115: {
    address: '0x48';
    channel: 'A0 (Single-Ended)';
    resolution: '16-bit Sigma-Delta';
    status: 'ONLINE' | 'FAULT';
  };
  dht11: {
    gpioPin: 'GPIO 4 (Pin 7)';
    protocol: '1-Wire Digital';
    checksumErrors: number;
    status: 'ONLINE' | 'FAULT';
  };
  mq135: {
    connection: 'ADS1115 Channel A0';
    preheatingStatus: 'Stabilized (Warmed Up)';
    baselinePpm: number;
    status: 'ONLINE' | 'FAULT';
  };
  ds3231: {
    address: '0x68';
    batteryVoltage: number; // 3.2V CR2032
    timeDriftSec: number;
    syncedTime: string;
    status: 'SYNCED' | 'FAULT';
  };
  lcd1602: {
    i2cAddress: '0x27 (PCF8574)';
    backlight: boolean;
    line1: string;
    line2: string;
    status: 'ONLINE' | 'FAULT';
  };
  rfidRc522: {
    interface: 'SPI (CE0, MOSI, MISO, SCK)';
    lastCardUid: string | null;
    lastCardTime: string | null;
    status: 'READY' | 'FAULT';
  };
  reedSwitch: {
    gpioPin: 'GPIO 17 (Pin 11)';
    circuit: 'Internal Pull-Up + Debounce 50ms';
    status: 'ONLINE' | 'FAULT';
  };
  leds: {
    greenPin: 'GPIO 27';
    yellowPin: 'GPIO 22';
    redPin: 'GPIO 23';
    activeLed: 'GREEN' | 'YELLOW' | 'RED';
  };
  psu: {
    rail5v: number;
    currentAmps: number;
    powerState: 'CONTINUOUS_MAINS';
  };
}
