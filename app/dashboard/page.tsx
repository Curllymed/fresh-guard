'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from '@/components/Navbar';
import { SensorCards } from '@/components/SensorCards';
import { LcdLedMirror } from '@/components/LcdLedMirror';
import { FreshnessMatrix } from '@/components/FreshnessMatrix';
import { TelemetryCharts } from '@/components/TelemetryCharts';
import { ThresholdMatrixModal } from '@/components/ThresholdMatrixModal';
import { IoTTestMatrixModal } from '@/components/IoTTestMatrixModal';
import { RegisterItemModal } from '@/components/RegisterItemModal';
import { HardwareDiagnostics } from '@/components/HardwareDiagnostics';
import { AlertsView } from '@/components/AlertsView';
import {
  INITIAL_ITEMS,
  INITIAL_TELEMETRY,
  INITIAL_THRESHOLDS,
  INITIAL_HARDWARE_STATUS,
  INITIAL_ALERTS,
  IoTTestScenario,
} from '@/lib/data';
import {
  Alert,
  FoodItem,
  FreshnessState,
  HardwareStatus,
  SensorTelemetry,
  ThresholdMatrixEntry,
} from '@/lib/types';
import { XCircle } from 'lucide-react';

export default function DashboardPage() {
  const [telemetry, setTelemetry] = useState<SensorTelemetry>(INITIAL_TELEMETRY);
  const [items, setItems] = useState<FoodItem[]>(INITIAL_ITEMS);
  const [hardware, setHardware] = useState<HardwareStatus>(INITIAL_HARDWARE_STATUS);
  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS);
  const [thresholds, setThresholds] = useState<ThresholdMatrixEntry[]>(INITIAL_THRESHOLDS);

  const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'diagnostics' | 'alerts'>('overview');
  const [isTestMatrixOpen, setIsTestMatrixOpen] = useState(false);
  const [isThresholdsOpen, setIsThresholdsOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  // Compute Overall Chamber Freshness State (§1.6.vii & §1.6.xi)
  const overallStatus: FreshnessState = useMemo(() => {
    // 1. Mandatory SRS rule: Never show Fresh if sensor is offline (§1.6.vii)
    if (!telemetry.dht11Healthy || !telemetry.ads1115Healthy || !telemetry.mq135Healthy) {
      return 'SENSOR_FAULT';
    }

    // 2. Critical alarm conditions
    if (
      telemetry.gasStatus === 'SPOILAGE_WARNING' ||
      telemetry.temperature > 8.0 ||
      items.some((i) => i.status === 'CHECK_FOOD')
    ) {
      return 'CHECK_FOOD';
    }

    // 3. Approaching expiration or warm warning
    if (
      telemetry.temperature > 4.5 ||
      items.some((i) => i.status === 'USE_SOON')
    ) {
      return 'USE_SOON';
    }

    return 'FRESH';
  }, [telemetry, items]);

  // Derived hardware state for LCD and Physical LEDs without cascading effect setState
  const displayHardware: HardwareStatus = useMemo(() => {
    let activeLed: 'GREEN' | 'YELLOW' | 'RED' = 'GREEN';
    let lcdLine2 = 'STATUS: FRESH-OK';

    if (overallStatus === 'SENSOR_FAULT') {
      activeLed = 'YELLOW';
      lcdLine2 = 'SENSOR FAULT §1.7';
    } else if (overallStatus === 'CHECK_FOOD') {
      activeLed = 'RED';
      lcdLine2 = 'ALARM: CHECK FOOD';
    } else if (overallStatus === 'USE_SOON') {
      activeLed = 'YELLOW';
      lcdLine2 = 'STATE: USE SOON';
    }

    const tempStr = telemetry.dht11Healthy ? `${telemetry.temperature.toFixed(1)}C` : 'ERR';
    const humStr = telemetry.dht11Healthy ? `${Math.round(telemetry.humidity)}%` : 'ERR';
    const gasStr = telemetry.gasStatus === 'SPOILAGE_WARNING' ? 'ALRM' : 'OK';
    const lcdLine1 = `T:${tempStr} H:${humStr} G:${gasStr}`;

    return {
      ...hardware,
      leds: {
        ...hardware.leds,
        activeLed,
      },
      lcd1602: {
        ...hardware.lcd1602,
        line1: lcdLine1,
        line2: lcdLine2,
      },
    };
  }, [hardware, overallStatus, telemetry]);

  // Subtle real-time heartbeat simulation for live telemetry
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry((prev) => {
        if (!prev.dht11Healthy) return prev;

        const tempFluctuation = (Math.random() - 0.5) * 0.08;
        const newTemp = Math.max(1.5, Math.min(6.5, prev.temperature + tempFluctuation));
        const humFluctuation = (Math.random() - 0.5) * 0.2;
        const newHum = Math.max(55, Math.min(85, prev.humidity + humFluctuation));

        return {
          ...prev,
          temperature: Number(newTemp.toFixed(2)),
          humidity: Number(newHum.toFixed(1)),
          lastUpdated: new Date().toLocaleTimeString(),
        };
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Handler: Consume item
  const handleConsumeItem = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    setItems((prev) => prev.filter((i) => i.id !== id));
    setAlerts((prev) => [
      {
        id: `alt-${Date.now()}`,
        level: 'INFO',
        title: 'Item Consumed & De-registered',
        message: `${item.name} (RFID: ${item.rfidUid}) checked out. Food waste successfully avoided!`,
        timestamp: new Date().toLocaleTimeString(),
        source: 'RFID',
        resolved: true,
        actionAdvice: 'Container freed for next registration.',
      },
      ...prev,
    ]);
  };

  // Handler: Inspect item notes
  const handleInspectItem = (id: string, note: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id
          ? {
              ...i,
              lastInspectionNote: note,
              status: note.toLowerCase().includes('spoil') || note.toLowerCase().includes('rot')
                ? 'CHECK_FOOD'
                : i.status,
            }
          : i
      )
    );
  };

  // Handler: Add new item
  const handleAddItem = (newItem: FoodItem) => {
    setItems((prev) => [newItem, ...prev]);
    setAlerts((prev) => [
      {
        id: `alt-${Date.now()}`,
        level: 'INFO',
        title: 'New Food Container Registered',
        message: `${newItem.name} registered under ${newItem.category} in ${newItem.storageZone}.`,
        timestamp: new Date().toLocaleTimeString(),
        source: 'RFID',
        resolved: true,
        actionAdvice: 'Shelf-life tracking initialized with DS3231 hardware clock.',
      },
      ...prev,
    ]);
  };

  // Handler: Run scenario from IoT Test Matrix
  const handleRunScenario = (sc: IoTTestScenario) => {
    const mutation = sc.applyMutation(telemetry, items, hardware);
    setTelemetry(mutation.telemetry);
    setItems(mutation.items);
    setHardware(mutation.hardware);
    if (mutation.newAlert) {
      setAlerts((prev) => [mutation.newAlert!, ...prev]);
    }
  };

  // Handler: Reset to Normal
  const handleResetNormal = () => {
    setTelemetry(INITIAL_TELEMETRY);
    setItems(INITIAL_ITEMS);
    setHardware(INITIAL_HARDWARE_STATUS);
  };

  // Handler: Resolve alert
  const handleResolveAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, resolved: true } : a))
    );
  };

  const handleClearAlerts = () => {
    setAlerts([]);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans pb-16">
      {/* Top Navbar Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        alerts={alerts}
        overallStatus={overallStatus}
        onOpenTestMatrix={() => setIsTestMatrixOpen(true)}
        onOpenThresholds={() => setIsThresholdsOpen(true)}
        onOpenRegisterItem={() => setIsRegisterOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Active Emergency Banner if Sensor Fault or Critical Alert */}
        {overallStatus === 'SENSOR_FAULT' && (
          <div className="p-4 rounded-2xl bg-orange-950/40 border border-orange-500/40 text-orange-200 flex items-center justify-between gap-4 shadow-lg shadow-orange-950/30">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400">
                <XCircle className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h4 className="font-bold text-sm tracking-wide">
                  SRS MANDATE §1.6.vii ENGAGED: SENSOR FAULT DETECTED
                </h4>
                <p className="text-xs text-orange-300/90 mt-0.5">
                  One or more sensors disconnected. FreshGuard is strictly prohibited from displaying a misleading &apos;Fresh/Normal&apos; status. Check hardware diagnostics.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('diagnostics')}
              className="px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold text-xs shrink-0 cursor-pointer transition-all"
            >
              Inspect Wiring
            </button>
          </div>
        )}

        {/* Tab 1: Live Chamber & Sensors Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* 1. Sensor Telemetry Cards (DHT-11, MQ-135, ADS1115, Reed Door) */}
            <SensorCards telemetry={telemetry} />

            {/* 2. LCD 1602A Digital Twin & Physical LEDs Mirror */}
            <LcdLedMirror hardware={displayHardware} overallStatus={overallStatus} />

            {/* 3. Real-Time Telemetry Trends & Freshness Distribution */}
            <TelemetryCharts
              items={items}
              currentTemp={telemetry.temperature}
              currentHumidity={telemetry.humidity}
              currentGas={telemetry.gasRaw}
            />

            {/* 4. Active RFID Inventory Overview */}
            <FreshnessMatrix
              items={items}
              onConsumeItem={handleConsumeItem}
              onInspectItem={handleInspectItem}
              onOpenRegisterModal={() => setIsRegisterOpen(true)}
            />
          </div>
        )}

        {/* Tab 2: Dedicated RFID Inventory */}
        {activeTab === 'inventory' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <FreshnessMatrix
              items={items}
              onConsumeItem={handleConsumeItem}
              onInspectItem={handleInspectItem}
              onOpenRegisterModal={() => setIsRegisterOpen(true)}
            />
          </div>
        )}

        {/* Tab 3: Hardware Diagnostics & Wiring Pinout */}
        {activeTab === 'diagnostics' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <HardwareDiagnostics hardware={displayHardware} />
          </div>
        )}

        {/* Tab 4: Alerts & Safety Recommendations */}
        {activeTab === 'alerts' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <AlertsView
              alerts={alerts}
              onResolveAlert={handleResolveAlert}
              onClearAll={handleClearAlerts}
            />
          </div>
        )}
      </main>

      {/* Modals */}
      <ThresholdMatrixModal
        isOpen={isThresholdsOpen}
        onClose={() => setIsThresholdsOpen(false)}
        thresholds={thresholds}
        onSaveThresholds={(updated) => setThresholds(updated)}
      />

      <IoTTestMatrixModal
        isOpen={isTestMatrixOpen}
        onClose={() => setIsTestMatrixOpen(false)}
        onRunScenario={handleRunScenario}
        onResetNormal={handleResetNormal}
      />

      <RegisterItemModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        thresholds={thresholds}
        onAddItem={handleAddItem}
      />
    </div>
  );
}