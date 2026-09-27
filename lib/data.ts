import { FoodItem, HardwareStatus, SensorTelemetry, ThresholdMatrixEntry, Alert } from './types';

export const INITIAL_THRESHOLDS: ThresholdMatrixEntry[] = [
  {
    category: 'Dairy',
    tempMin: 1.0,
    tempMax: 4.5,
    humidityMin: 60,
    humidityMax: 75,
    maxDays: 7,
    gasThresholdMultiplier: 1.35,
    spoilageSigns: 'Sour odor, curdling, bacterial acidification producing ethyl alcohol and acetic traces.',
    storageGuideline: 'Keep in coldest section of main chamber; avoid door shelf if possible.',
  },
  {
    category: 'Meat & Poultry',
    tempMin: 0.0,
    tempMax: 3.5,
    humidityMin: 70,
    humidityMax: 85,
    maxDays: 3,
    gasThresholdMultiplier: 1.25,
    spoilageSigns: 'Sulfur/ammonia VOC off-gassing, slime formation, color oxidation (browning).',
    storageGuideline: 'Store in lowest shelf in sealed container to prevent cross-contamination drips.',
  },
  {
    category: 'Seafood',
    tempMin: -0.5,
    tempMax: 2.5,
    humidityMin: 75,
    humidityMax: 90,
    maxDays: 2,
    gasThresholdMultiplier: 1.2,
    spoilageSigns: 'Trimethylamine (TMA) and ammonia emission, pungent fishy odor.',
    storageGuideline: 'Store on crushed ice or lowest chilled shelf. Consume as soon as possible.',
  },
  {
    category: 'Fresh Produce',
    tempMin: 3.0,
    tempMax: 7.0,
    humidityMin: 80,
    humidityMax: 95,
    maxDays: 10,
    gasThresholdMultiplier: 1.5,
    spoilageSigns: 'Ethylene accumulation, mold spores, wilting, fermentation off-gassing.',
    storageGuideline: 'Store in high-humidity crisper drawer with ventilated bin divider.',
  },
  {
    category: 'Leftovers & Cooked',
    tempMin: 1.0,
    tempMax: 4.0,
    humidityMin: 50,
    humidityMax: 70,
    maxDays: 4,
    gasThresholdMultiplier: 1.3,
    spoilageSigns: 'Microbial fermentation, sour vapors, fungal growth.',
    storageGuideline: 'Cool to room temperature within 2 hrs of cooking before sealing into container.',
  },
  {
    category: 'Beverages',
    tempMin: 2.0,
    tempMax: 8.0,
    humidityMin: 40,
    humidityMax: 75,
    maxDays: 14,
    gasThresholdMultiplier: 1.8,
    spoilageSigns: 'Fermentation bubbles, yeast bloom, fungal pellicle in fruit juices.',
    storageGuideline: 'Upright storage on door racks or top compartment.',
  },
  {
    category: 'Bakery & Sweets',
    tempMin: 4.0,
    tempMax: 10.0,
    humidityMin: 40,
    humidityMax: 60,
    maxDays: 6,
    gasThresholdMultiplier: 1.6,
    spoilageSigns: 'Mold mycelium colonies, stale starch retrogradation.',
    storageGuideline: 'Airtight packaging; prevent condensation buildup.',
  },
];

export const INITIAL_ITEMS: FoodItem[] = [
  {
    id: 'item-101',
    rfidUid: 'E2-80-69-15',
    name: 'Farm Fresh Whole Milk (1L)',
    category: 'Dairy',
    quantity: '1 Bottle',
    storageZone: 'Shelf 1 (Chilled)',
    storedDate: '2026-09-24 09:30',
    expiryDate: '2026-09-29 23:59',
    maxStorageDays: 5,
    daysRemaining: 2,
    status: 'USE_SOON',
    storageDurationHours: 76,
    flaggedReason: 'Approaching 48h shelf-life threshold limit (§1.6.xi)',
    lastInspectionNote: 'Cap sealed, sensory evaluation normal.',
  },
  {
    id: 'item-102',
    rfidUid: '4A-B1-9F-73',
    name: 'Artisan Sharp Cheddar Block',
    category: 'Dairy',
    quantity: '350g',
    storageZone: 'Shelf 2 (Main)',
    storedDate: '2026-09-20 14:15',
    expiryDate: '2026-10-18 23:59',
    maxStorageDays: 30,
    daysRemaining: 21,
    status: 'FRESH',
    storageDurationHours: 168,
    lastInspectionNote: 'Wax rind intact. Optimum storage temperature maintained.',
  },
  {
    id: 'item-103',
    rfidUid: '9D-33-28-E1',
    name: 'Organic Cherry Tomatoes',
    category: 'Fresh Produce',
    quantity: '250g Box',
    storageZone: 'Crisper Drawer',
    storedDate: '2026-09-18 11:00',
    expiryDate: '2026-09-26 12:00',
    maxStorageDays: 8,
    daysRemaining: 0,
    status: 'CHECK_FOOD',
    storageDurationHours: 219,
    flaggedReason: 'Exceeded recommended storage limit & elevated local humidity readings',
    lastInspectionNote: 'Requires immediate inspection. Softening detected on lower layer.',
  },
  {
    id: 'item-104',
    rfidUid: '3C-89-AA-04',
    name: 'Fresh Atlantic Salmon Fillet',
    category: 'Seafood',
    quantity: '400g',
    storageZone: 'Shelf 1 (Chilled)',
    storedDate: '2026-09-26 18:20',
    expiryDate: '2026-09-28 20:00',
    maxStorageDays: 2,
    daysRemaining: 1,
    status: 'FRESH',
    storageDurationHours: 20,
    lastInspectionNote: 'Kept on ice pack inside chilled section. Zero off-odor.',
  },
  {
    id: 'item-105',
    rfidUid: 'F1-44-88-C9',
    name: 'Slow-Cooked Beef Stew (Leftover)',
    category: 'Leftovers & Cooked',
    quantity: '600ml Glass Pyrex',
    storageZone: 'Shelf 2 (Main)',
    storedDate: '2026-09-25 21:00',
    expiryDate: '2026-09-28 21:00',
    maxStorageDays: 3,
    daysRemaining: 1,
    status: 'USE_SOON',
    storageDurationHours: 41,
    flaggedReason: 'Cooked food nearing 72-hour food safety boundary (§1.2)',
    lastInspectionNote: 'Stored in sealed borosilicate container. Reheat thoroughly >75°C.',
  },
  {
    id: 'item-106',
    rfidUid: '1B-62-77-30',
    name: 'Baby Spinach & Arugula Blend',
    category: 'Fresh Produce',
    quantity: '180g Bag',
    storageZone: 'Crisper Drawer',
    storedDate: '2026-09-26 10:00',
    expiryDate: '2026-10-02 12:00',
    maxStorageDays: 6,
    daysRemaining: 5,
    status: 'FRESH',
    storageDurationHours: 28,
    lastInspectionNote: 'Crisper drawer humidity at 88%, optimal crispness.',
  }
];

export const INITIAL_TELEMETRY: SensorTelemetry = {
  temperature: 3.8, // °C
  humidity: 68.4, // %
  gasRaw: 1420, // ADS1115 16-bit counts
  gasVoltage: 0.865, // Volts
  gasBaseline: 1100, // ADS1115 baseline clean air counts
  gasRatio: 1.29, // Rs/Ro
  gasStatus: 'NORMAL',
  doorOpen: false,
  doorOpenSeconds: 0,
  doorOpenCountToday: 8,
  dht11Healthy: true,
  ads1115Healthy: true,
  mq135Healthy: true,
  ds3231Healthy: true,
  rc522Healthy: true,
  reedSwitchHealthy: true,
  psuVoltage: 5.14,
  lastUpdated: new Date().toLocaleTimeString(),
};

export const INITIAL_ALERTS: Alert[] = [
  {
    id: 'alt-001',
    level: 'WARNING',
    title: 'Food Item Approaching Expiry',
    message: 'Farm Fresh Whole Milk (RFID: E2-80-69-15) enters "Use Soon" window (< 48 hrs remaining).',
    timestamp: 'Today at 08:30 AM',
    source: 'EXPIRY',
    resolved: false,
    actionAdvice: 'Prioritize for breakfast consumption or baking to avoid spoilage.',
  },
  {
    id: 'alt-002',
    level: 'CRITICAL',
    title: 'Immediate Inspection Recommended',
    message: 'Organic Cherry Tomatoes in Crisper Drawer have exceeded maximum duration limit (8 days).',
    timestamp: 'Today at 11:45 AM',
    source: 'EXPIRY',
    resolved: false,
    actionAdvice: 'Physically inspect container; discard decayed units to prevent fungal spread to adjacent greens.',
  },
  {
    id: 'alt-003',
    level: 'INFO',
    title: 'RFID Container Verified',
    message: 'Scanned Tag 3C-89-AA-04 (Fresh Atlantic Salmon Fillet) registered on Shelf 1.',
    timestamp: 'Yesterday at 06:20 PM',
    source: 'RFID',
    resolved: true,
    actionAdvice: 'Shelf life timer synchronized with DS3231 hardware clock.',
  },
];

export const INITIAL_HARDWARE_STATUS: HardwareStatus = {
  rpi3b: {
    hostname: 'freshguard-pi3b',
    ipAddress: '192.168.1.105',
    cpuUsage: 19.4,
    cpuTemp: 44.2,
    ramUsageMB: 284,
    ramTotalMB: 948,
    uptime: '6d 14h 22m',
    wifiSignalDbm: -54,
  },
  ads1115: {
    address: '0x48',
    channel: 'A0 (Single-Ended)',
    resolution: '16-bit Sigma-Delta',
    status: 'ONLINE',
  },
  dht11: {
    gpioPin: 'GPIO 4 (Pin 7)',
    protocol: '1-Wire Digital',
    checksumErrors: 0,
    status: 'ONLINE',
  },
  mq135: {
    connection: 'ADS1115 Channel A0',
    preheatingStatus: 'Stabilized (Warmed Up)',
    baselinePpm: 1100,
    status: 'ONLINE',
  },
  ds3231: {
    address: '0x68',
    batteryVoltage: 3.24,
    timeDriftSec: 0.04,
    syncedTime: '2026-09-27 14:45:00',
    status: 'SYNCED',
  },
  lcd1602: {
    i2cAddress: '0x27 (PCF8574)',
    backlight: true,
    line1: 'T:3.8C H:68% G:OK',
    line2: 'STATUS: FRESH-OK',
    status: 'ONLINE',
  },
  rfidRc522: {
    interface: 'SPI (CE0, MOSI, MISO, SCK)',
    lastCardUid: '3C-89-AA-04',
    lastCardTime: '2026-09-26 18:20:11',
    status: 'READY',
  },
  reedSwitch: {
    gpioPin: 'GPIO 17 (Pin 11)',
    circuit: 'Internal Pull-Up + Debounce 50ms',
    status: 'ONLINE',
  },
  leds: {
    greenPin: 'GPIO 27',
    yellowPin: 'GPIO 22',
    redPin: 'GPIO 23',
    activeLed: 'GREEN',
  },
  psu: {
    rail5v: 5.14,
    currentAmps: 0.78,
    powerState: 'CONTINUOUS_MAINS',
  },
};

export interface IoTTestScenario {
  id: string;
  name: string;
  category: string;
  description: string;
  srsSection: string;
  applyMutation: (
    telemetry: SensorTelemetry,
    items: FoodItem[],
    hardware: HardwareStatus
  ) => { telemetry: SensorTelemetry; items: FoodItem[]; hardware: HardwareStatus; newAlert?: Alert };
}

export const IOT_TEST_SCENARIOS: IoTTestScenario[] = [
  {
    id: 'test-1-normal',
    name: '1. Normal Environmental Condition',
    category: 'Baseline',
    srsSection: '§1.6.xi & §1.6.xxi',
    description: 'Storage temperature (3.5°C), humidity (68%), and gas (1,150) within calibrated limits. All status indicators Green.',
    applyMutation: (t, items, h) => {
      return {
        telemetry: {
          ...t,
          temperature: 3.5,
          humidity: 66.0,
          gasRaw: 1150,
          gasVoltage: 0.72,
          gasRatio: 1.05,
          gasStatus: 'CLEAN',
          doorOpen: false,
          doorOpenSeconds: 0,
          dht11Healthy: true,
          ads1115Healthy: true,
          mq135Healthy: true,
          lastUpdated: new Date().toLocaleTimeString(),
        },
        items: items.map(item => ({
          ...item,
          status: item.id === 'item-103' ? 'CHECK_FOOD' : item.daysRemaining <= 2 ? 'USE_SOON' : 'FRESH',
        })),
        hardware: {
          ...h,
          dht11: { ...h.dht11, status: 'ONLINE' },
          mq135: { ...h.mq135, status: 'ONLINE' },
          leds: { ...h.leds, activeLed: 'GREEN' },
          lcd1602: {
            ...h.lcd1602,
            line1: 'T:3.5C H:66% G:OK',
            line2: 'STATUS: FRESH-OK',
          },
        },
      };
    },
  },
  {
    id: 'test-2-high-temp',
    name: '2. High Temperature Violation (> 8.5°C)',
    category: 'Threshold Violation',
    srsSection: '§1.6.xii & §1.6.xxi',
    description: 'Simulates compressor failure or door gasket leak pushing chamber temperature up to 9.2°C.',
    applyMutation: (t, items, h) => {
      const alert: Alert = {
        id: `alt-test-${Date.now()}`,
        level: 'CRITICAL',
        title: 'Chamber Temperature Critical (9.2°C)',
        message: 'Storage area exceeded the safe maximum threshold (4.5°C). Accelerated spoilage risk for dairy and meat products.',
        timestamp: new Date().toLocaleTimeString(),
        source: 'DHT11',
        resolved: false,
        actionAdvice: 'Verify door seal and ensure power supply stability. Do not consume raw dairy if held >8°C for >2h.',
      };
      return {
        telemetry: {
          ...t,
          temperature: 9.2,
          lastUpdated: new Date().toLocaleTimeString(),
        },
        items: items.map(item => (item.category === 'Dairy' || item.category === 'Meat & Poultry' ? { ...item, status: 'CHECK_FOOD' } : item)),
        hardware: {
          ...h,
          leds: { ...h.leds, activeLed: 'RED' },
          lcd1602: {
            ...h.lcd1602,
            line1: 'T:9.2C HIGH TEMP!',
            line2: 'ALARM: CHECK FOOD',
          },
        },
        newAlert: alert,
      };
    },
  },
  {
    id: 'test-3-gas-spike',
    name: '3. Abnormal Gas Spike (MQ-135 / ADS1115)',
    category: 'Threshold Violation',
    srsSection: '§1.6.iv & §1.6.xxi',
    description: 'MQ-135 detects elevated VOCs / microbial spoilage gases (ADC raw 3,850 / 2.38V, ratio 3.5).',
    applyMutation: (t, items, h) => {
      const alert: Alert = {
        id: `alt-test-${Date.now()}`,
        level: 'CRITICAL',
        title: 'Elevated Gas Concentration Detected',
        message: 'MQ-135 through ADS1115 recorded a significant gas surge (3.5x baseline). Shared chamber air compromised.',
        timestamp: new Date().toLocaleTimeString(),
        source: 'MQ135',
        resolved: false,
        actionAdvice: 'Perform physical inspection of all containers in Zone 1. Gas alone does not pinpoint item (§1.6.iv); inspect seafood & meat first.',
      };
      return {
        telemetry: {
          ...t,
          gasRaw: 3850,
          gasVoltage: 2.38,
          gasRatio: 3.5,
          gasStatus: 'SPOILAGE_WARNING',
          lastUpdated: new Date().toLocaleTimeString(),
        },
        items: items.map(item => ({ ...item, status: 'CHECK_FOOD' })),
        hardware: {
          ...h,
          leds: { ...h.leds, activeLed: 'RED' },
          lcd1602: {
            ...h.lcd1602,
            line1: 'GAS SPIKE! 2.38V',
            line2: 'INSPECT CHAMBER',
          },
        },
        newAlert: alert,
      };
    },
  },
  {
    id: 'test-4-door-timeout',
    name: '4. Door Left Open Beyond Timeout (> 45s)',
    category: 'Door Monitoring',
    srsSection: '§1.6.vi & §1.6.xxi',
    description: 'Reed switch detects magnet separation for 54 continuous seconds. Triggers buzzer warning and notification.',
    applyMutation: (t, items, h) => {
      const alert: Alert = {
        id: `alt-test-${Date.now()}`,
        level: 'WARNING',
        title: 'Door Open Warning (> 45s)',
        message: 'Storage door has been open for 54 seconds. Cold air loss detected.',
        timestamp: new Date().toLocaleTimeString(),
        source: 'REED_SWITCH',
        resolved: false,
        actionAdvice: 'Close the refrigerator door immediately to prevent temperature fluctuations and energy loss.',
      };
      return {
        telemetry: {
          ...t,
          doorOpen: true,
          doorOpenSeconds: 54,
          doorOpenCountToday: t.doorOpenCountToday + 1,
          temperature: t.temperature + 1.2,
          lastUpdated: new Date().toLocaleTimeString(),
        },
        items,
        hardware: {
          ...h,
          leds: { ...h.leds, activeLed: 'YELLOW' },
          lcd1602: {
            ...h.lcd1602,
            line1: 'DOOR IS OPEN:54s',
            line2: 'WARNING: CLOSE !',
          },
        },
        newAlert: alert,
      };
    },
  },
  {
    id: 'test-5-sensor-fault',
    name: '5. Sensor Fault / Disconnection (§1.6.vii Mandate)',
    category: 'Safety & Fault Tolerance',
    srsSection: '§1.6.vii & §1.6.xvi',
    description: 'Simulates DHT11 signal wire disconnection. The system MUST NOT display Fresh/Normal; it MUST display "Sensor Fault / Data Unavailable".',
    applyMutation: (t, items, h) => {
      const alert: Alert = {
        id: `alt-test-${Date.now()}`,
        level: 'CRITICAL',
        title: 'Hardware Fault: DHT11 Sensor Offline',
        message: 'Communication timeout on GPIO 4. SRS §1.6.vii safety protocol engaged: Fresh/Normal state locked out.',
        timestamp: new Date().toLocaleTimeString(),
        source: 'SENSOR_FAULT',
        resolved: false,
        actionAdvice: 'Inspect DHT11 jumper wires on GPIO 4 and ensure 3.3V/5V VCC and common ground are securely connected.',
      };
      return {
        telemetry: {
          ...t,
          dht11Healthy: false,
          temperature: 0,
          humidity: 0,
          lastUpdated: new Date().toLocaleTimeString(),
        },
        items: items.map(item => ({
          ...item,
          status: 'SENSOR_FAULT',
          flaggedReason: 'Sensor Fault / Data Unavailable (§1.6.vii)',
        })),
        hardware: {
          ...h,
          dht11: { ...h.dht11, status: 'FAULT', checksumErrors: 12 },
          leds: { ...h.leds, activeLed: 'YELLOW' },
          lcd1602: {
            ...h.lcd1602,
            line1: 'SENSOR FAULT !',
            line2: 'DATA UNAVAIL §1.6',
          },
        },
        newAlert: alert,
      };
    },
  },
  {
    id: 'test-6-rfid-scan',
    name: '6. RFID Tag Tap Simulation (RC522)',
    category: 'Identification',
    srsSection: '§1.6.i, §1.8.1',
    description: 'Simulates an RFID tag (UID: 7D-2E-99-4A) being read by the RC522 module at the chamber entrance.',
    applyMutation: (t, items, h) => {
      const alert: Alert = {
        id: `alt-test-${Date.now()}`,
        level: 'INFO',
        title: 'RFID Tag Detected by RC522',
        message: 'Card UID 7D-2E-99-4A scanned via SPI bus. Item ready for quick check-in or inventory lookup.',
        timestamp: new Date().toLocaleTimeString(),
        source: 'RFID',
        resolved: true,
        actionAdvice: 'Item matched with database records. Storage timestamp refreshed via DS3231 RTC.',
      };
      return {
        telemetry: {
          ...t,
          lastUpdated: new Date().toLocaleTimeString(),
        },
        items,
        hardware: {
          ...h,
          rfidRc522: {
            ...h.rfidRc522,
            lastCardUid: '7D-2E-99-4A',
            lastCardTime: new Date().toLocaleTimeString(),
          },
          lcd1602: {
            ...h.lcd1602,
            line1: 'RFID: 7D-2E-99-4A',
            line2: 'ITEM VERIFIED OK',
          },
        },
        newAlert: alert,
      };
    },
  },
];
