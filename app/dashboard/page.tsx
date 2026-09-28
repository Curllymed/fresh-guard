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

import { XCircle, Wifi, WifiOff, RefreshCw } from 'lucide-react';

/*
|--------------------------------------------------------------------------
| API telemetry shape
|--------------------------------------------------------------------------
| This matches the payload currently being sent by Raspberry Pi to:
| /api/feed
|
| IMPORTANT:
| The Raspberry Pi currently does not send all fields required by
| SensorTelemetry, so unsupported fields are preserved from the previous
| dashboard state.Need to test.
|--------------------------------------------------------------------------
*/

interface FeedTelemetry {
  event_id: string;
  timestamp: string;
  temperature: number;
  humidity: number;
  gas_voltage: number;
  door_open: boolean;
  wifi_connected: boolean;
  status: string;
  sensor_fault: boolean | string | null;
  item_count: number;
}

interface FeedResponse {
  success: boolean;
  data?: FeedTelemetry | null;
  timestamp?: string;
  error?: string;
}

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function isSensorFault(value: boolean | string | null): boolean {
  if (value === true) {
    return true;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();

    return [
      'true',
      'fault',
      'sensor_fault',
      'sensor fault',
      'error',
      'failed',
        'offline',
    ].includes(normalized);
  }

  return false;
}

function parseFreshnessStatus(
  status: string,
  sensorFault: boolean
): FreshnessState | null {
  if (sensorFault) {
    return 'SENSOR_FAULT';
  }

  const normalized = status.trim().toLowerCase();

  if (
    normalized.includes('sensor fault') ||
    normalized.includes('sensor_fault') ||
    normalized.includes('fault')
  ) {
    return 'SENSOR_FAULT';
  }

  if (
    normalized.includes('check food') ||
    normalized.includes('spoilage') ||
    normalized.includes('alarm') ||
    normalized.includes('critical')
  ) {
    return 'CHECK_FOOD';
  }

  if (
    normalized.includes('use soon') ||
    normalized.includes('warning') ||
    normalized.includes('elevated')
  ) {
    return 'USE_SOON';
  }

  if (
    normalized.includes('fresh') ||
    normalized.includes('normal') ||
    normalized.includes('clean')
  ) {
    return 'FRESH';
  }

  return null;
}

export default function DashboardPage() {
  /*
  |--------------------------------------------------------------------------
  | Main dashboard state
  |--------------------------------------------------------------------------
  */

  const [telemetry, setTelemetry] =
    useState<SensorTelemetry>(INITIAL_TELEMETRY);

  const [items, setItems] =
    useState<FoodItem[]>(INITIAL_ITEMS);

  const [hardware, setHardware] =
    useState<HardwareStatus>(INITIAL_HARDWARE_STATUS);

  const [alerts, setAlerts] =
    useState<Alert[]>(INITIAL_ALERTS);

  const [thresholds, setThresholds] =
    useState<ThresholdMatrixEntry[]>(INITIAL_THRESHOLDS);

  /*
  |--------------------------------------------------------------------------
  | Navigation / modal state
  |--------------------------------------------------------------------------
  */

  const [activeTab, setActiveTab] = useState<
    'overview' | 'inventory' | 'diagnostics' | 'alerts'
  >('overview');

  const [isTestMatrixOpen, setIsTestMatrixOpen] =
    useState(false);

  const [isThresholdsOpen, setIsThresholdsOpen] =
    useState(false);

  const [isRegisterOpen, setIsRegisterOpen] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | Live API state
  |--------------------------------------------------------------------------
  */

  const [liveStatus, setLiveStatus] =
    useState<FreshnessState | null>(null);

  const [feedOnline, setFeedOnline] =
    useState(false);

  const [feedLoading, setFeedLoading] =
    useState(true);

  const [feedError, setFeedError] =
    useState<string | null>(null);

  const [lastReceivedAt, setLastReceivedAt] =
    useState<string | null>(null);

  const [liveItemCount, setLiveItemCount] =
    useState<number | null>(null);

  const [liveEventId, setLiveEventId] =
    useState<string | null>(null);

  /*
  |--------------------------------------------------------------------------
  | Live telemetry polling
  |--------------------------------------------------------------------------
  |
  | The dashboard calls /api/feed every 3 seconds.
  |
  | We use a relative URL because the dashboard and API are deployed
  | together on the same Next.js/Vercel application.
  |
  | The IoT test matrix temporarily pauses polling while it is open so
  | that local test scenarios are not immediately overwritten by live data.
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let cancelled = false;

    const fetchLiveTelemetry = async () => {
      try {
        const response = await fetch('/api/feed', {
          method: 'GET',
          cache: 'no-store',
          headers: {
            Accept: 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(
            `Feed API returned HTTP ${response.status}`
          );
        }

        const result =
          (await response.json()) as FeedResponse;
        console.log(result);

        if (!result.success || !result.data) {
          throw new Error(
            result.error || 'No telemetry data received.'
          );
        }

        const data = result.data;

        if (cancelled) {
          return;
        }

        const sensorFault = isSensorFault(
          data.sensor_fault
        );

        const parsedStatus = parseFreshnessStatus(
          data.status,
          sensorFault
        );

        /*
        |--------------------------------------------------------------------------
        | Update only fields that actually come from Raspberry Pi.
        |--------------------------------------------------------------------------
        |
        | gasRaw, gasBaseline, gasRatio, gasStatus and several hardware
        | diagnostics are NOT currently included in /api/feed.
        |
        | Therefore we deliberately preserve their previous values instead
        | of inventing live values.
        |--------------------------------------------------------------------------
        */

        setTelemetry((previous) => ({
          ...previous,

          temperature: data.temperature,
          humidity: data.humidity,

          gasVoltage: data.gas_voltage,

          doorOpen: data.door_open,

          /*
           * We do not receive door-open duration from the current API.
           * Reset it to zero when closed, otherwise preserve the previous
           * value.
           */
          doorOpenSeconds: data.door_open
            ? previous.doorOpenSeconds
            : 0,

          /*
           * The current API exposes one aggregate sensor_fault field,
           * rather than individual health flags.
           *
           * When there is a fault, we conservatively mark these sensor
           * channels as unhealthy.
           *
           * When there is no fault, they are considered healthy.
           */
          dht11Healthy: !sensorFault,
          ads1115Healthy: !sensorFault,
          mq135Healthy: !sensorFault,

          /*
           * These sensors are not individually reported by the API.
           * Preserve their existing dashboard values.
           */
          ds3231Healthy: previous.ds3231Healthy,
          rc522Healthy: previous.rc522Healthy,
          reedSwitchHealthy: previous.reedSwitchHealthy,

          /*
           * The current API does not report PSU voltage.
           */
          psuVoltage: previous.psuVoltage,

          /*
           * Keep unsupported gas fields unchanged.
           */
          gasRaw: previous.gasRaw,
          gasBaseline: previous.gasBaseline,
          gasRatio: previous.gasRatio,
          gasStatus: previous.gasStatus,

          lastUpdated: data.timestamp,
        }));

        setLiveStatus(parsedStatus);

        setFeedOnline(true);
        setFeedLoading(false);
        setFeedError(null);

        setLastReceivedAt(
          new Date().toLocaleTimeString()
        );

        setLiveItemCount(data.item_count);
        setLiveEventId(data.event_id);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          '[Dashboard] Unable to fetch FreshGuard telemetry:',
          error
        );

        /*
         * Do not continue showing Fresh/Normal when the live feed
         * itself has stopped working.
         */
        setFeedOnline(false);
        setFeedLoading(false);
        setLiveStatus('SENSOR_FAULT');

        setFeedError(
          error instanceof Error
            ? error.message
            : 'Unable to retrieve telemetry.'
        );
      }
    };

    /*
     * Fetch immediately when dashboard loads.
     */
    fetchLiveTelemetry();
    console.log('Dashboard loaded')

    /*
     * When the IoT Test Matrix is open, stop polling temporarily.
     * This allows local test scenarios to work without being overwritten
     * every 3 seconds.
     */
    if (isTestMatrixOpen) {
      return () => {
        cancelled = true;
      };
    }

    /*
     * Continue polling every 3 seconds.
     */
    const interval = window.setInterval(
      fetchLiveTelemetry,
      3000
    );

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [isTestMatrixOpen]);

  /*
  |--------------------------------------------------------------------------
  | Overall FreshGuard status
  |--------------------------------------------------------------------------
  */

  const overallStatus: FreshnessState = useMemo(() => {
    /*
     * If the API connection has failed after initial loading,
     * do not display a misleading Fresh status.
     */
    if (!feedLoading && !feedOnline) {
      return 'SENSOR_FAULT';
    }

    /*
     * Hardware/sensor fault takes priority.
     */
    if (
      !telemetry.dht11Healthy ||
      !telemetry.ads1115Healthy ||
      !telemetry.mq135Healthy
    ) {
      return 'SENSOR_FAULT';
    }

    /*
     * Temperature safety override.
     */
    if (telemetry.temperature > 8.0) {
      return 'CHECK_FOOD';
    }

    /*
     * During normal live operation, the status calculated by the
     * Raspberry Pi is authoritative.
     */
    if (liveStatus) {
      return liveStatus;
    }

    /*
     * Fallback for local IoT test scenarios.
     */
    if (
      telemetry.gasStatus === 'SPOILAGE_WARNING' ||
      items.some((item) => item.status === 'CHECK_FOOD')
    ) {
      return 'CHECK_FOOD';
    }

    if (
      telemetry.temperature > 4.5 ||
      items.some((item) => item.status === 'USE_SOON')
    ) {
      return 'USE_SOON';
    }

    return 'FRESH';
  }, [
    telemetry,
    items,
    liveStatus,
    feedOnline,
    feedLoading,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Hardware LCD / LED mirror
  |--------------------------------------------------------------------------
  */

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

    const tempStr = telemetry.dht11Healthy
      ? `${telemetry.temperature.toFixed(1)}C`
      : 'ERR';

    const humStr = telemetry.dht11Healthy
      ? `${Math.round(telemetry.humidity)}%`
      : 'ERR';

    const gasStr =
      telemetry.gasStatus === 'SPOILAGE_WARNING'
        ? 'ALRM'
        : 'OK';

    const lcdLine1 =
      `T:${tempStr} H:${humStr} G:${gasStr}`;

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
  }, [
    hardware,
    overallStatus,
    telemetry,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Consume food item
  |--------------------------------------------------------------------------
  */

  const handleConsumeItem = (id: string) => {
    const item = items.find(
      (currentItem) => currentItem.id === id
    );

    if (!item) {
      return;
    }

    setItems((previous) =>
      previous.filter(
        (currentItem) => currentItem.id !== id
      )
    );

    setAlerts((previous) => [
      {
        id: `alt-${Date.now()}`,
        level: 'INFO',
        title: 'Item Consumed & De-registered',
        message:
          `${item.name} (RFID: ${item.rfidUid}) checked out. ` +
          'Food waste successfully avoided!',
        timestamp:
          new Date().toLocaleTimeString(),
        source: 'RFID',
        resolved: true,
        actionAdvice:
          'Container freed for next registration.',
      },
      ...previous,
    ]);
  };

  /*
  |--------------------------------------------------------------------------
  | Inspect food item
  |--------------------------------------------------------------------------
  */

  const handleInspectItem = (
    id: string,
    note: string
  ) => {
    setItems((previous) =>
      previous.map((item) =>
        item.id === id
          ? {
              ...item,
              lastInspectionNote: note,
              status:
                note
                  .toLowerCase()
                  .includes('spoil') ||
                note
                  .toLowerCase()
                  .includes('rot')
                  ? 'CHECK_FOOD'
                  : item.status,
            }
          : item
      )
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Register new food item
  |--------------------------------------------------------------------------
  */

  const handleAddItem = (newItem: FoodItem) => {
    setItems((previous) => [
      newItem,
      ...previous,
    ]);

    setAlerts((previous) => [
      {
        id: `alt-${Date.now()}`,
        level: 'INFO',
        title: 'New Food Container Registered',
        message:
          `${newItem.name} registered under ` +
          `${newItem.category} in ${newItem.storageZone}.`,
        timestamp:
          new Date().toLocaleTimeString(),
        source: 'RFID',
        resolved: true,
        actionAdvice:
          'Shelf-life tracking initialized with DS3231 hardware clock.',
      },
      ...previous,
    ]);
  };

  /*
  |--------------------------------------------------------------------------
  | IoT test scenario
  |--------------------------------------------------------------------------
  */

  const handleRunScenario = (
    scenario: IoTTestScenario
  ) => {
    /*
     * Disable server-status override while testing locally.
     */
    setLiveStatus(null);

    const mutation = scenario.applyMutation(
      telemetry,
      items,
      hardware
    );

    setTelemetry(mutation.telemetry);
    setItems(mutation.items);
    setHardware(mutation.hardware);

    if (mutation.newAlert) {
      setAlerts((previous) => [
        mutation.newAlert!,
        ...previous,
      ]);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Reset local test state
  |--------------------------------------------------------------------------
  */

  const handleResetNormal = () => {
    setLiveStatus(null);

    setTelemetry(INITIAL_TELEMETRY);
    setItems(INITIAL_ITEMS);
    setHardware(INITIAL_HARDWARE_STATUS);
  };

  /*
  |--------------------------------------------------------------------------
  | Resolve alert
  |--------------------------------------------------------------------------
  */

  const handleResolveAlert = (id: string) => {
    setAlerts((previous) =>
      previous.map((alert) =>
        alert.id === id
          ? {
              ...alert,
              resolved: true,
            }
          : alert
      )
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Clear alerts
  |--------------------------------------------------------------------------
  */

  const handleClearAlerts = () => {
    setAlerts([]);
  };

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans pb-16">

      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        alerts={alerts}
        overallStatus={overallStatus}
        onOpenTestMatrix={() =>
          setIsTestMatrixOpen(true)
        }
        onOpenThresholds={() =>
          setIsThresholdsOpen(true)
        }
        onOpenRegisterItem={() =>
          setIsRegisterOpen(true)
        }
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">

        {/*
        |--------------------------------------------------------------------------
        | Live connection status
        |--------------------------------------------------------------------------
        */}

        <div
          className={`rounded-2xl border px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
            feedOnline
              ? 'bg-emerald-950/30 border-emerald-500/30'
              : feedLoading
                ? 'bg-slate-900 border-slate-700'
                : 'bg-red-950/30 border-red-500/30'
          }`}
        >

          <div className="flex items-center gap-3">

            <div
              className={`p-2 rounded-xl ${
                feedOnline
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : feedLoading
                    ? 'bg-slate-700 text-slate-300'
                    : 'bg-red-500/15 text-red-400'
              }`}
            >
              {feedOnline ? (
                <Wifi className="w-5 h-5" />
              ) : feedLoading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <WifiOff className="w-5 h-5" />
              )}
            </div>

            <div>
              <div className="font-semibold text-sm">
                {feedOnline
                  ? 'FreshGuard Live Feed Connected'
                  : feedLoading
                    ? 'Connecting to FreshGuard...'
                    : 'FreshGuard Live Feed Offline'}
              </div>

              <div className="text-xs text-slate-400 mt-0.5">
                {feedOnline
                  ? `Raspberry Pi telemetry • ${
                      liveItemCount ?? 0
                    } item(s) reported`
                  : feedError ||
                    'Waiting for telemetry from /api/feed'}
              </div>
            </div>

          </div>

          <div className="text-xs text-slate-400 sm:text-right">

            {lastReceivedAt && (
              <div>
                Received: {lastReceivedAt}
              </div>
            )}

            {liveEventId && (
              <div className="font-mono opacity-70 mt-0.5">
                Event: {liveEventId}
              </div>
            )}

          </div>

        </div>

        {/*
        |--------------------------------------------------------------------------
        | Sensor fault banner
        |--------------------------------------------------------------------------
        */}

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
                  Live telemetry is unavailable or one or more
                  reported sensors are in a fault state. FreshGuard
                  will not display a misleading &apos;Fresh/Normal&apos;
                  status.
                </p>

              </div>

            </div>

            <button
              onClick={() =>
                setActiveTab('diagnostics')
              }
              className="px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold text-xs shrink-0 cursor-pointer transition-all"
            >
              Inspect Wiring
            </button>

          </div>
        )}

        {/*
        |--------------------------------------------------------------------------
        | Overview
        |--------------------------------------------------------------------------
        */}

        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-300">

            <SensorCards
              telemetry={telemetry}
            />

            <LcdLedMirror
              hardware={displayHardware}
              overallStatus={overallStatus}
            />

            <TelemetryCharts
              items={items}
              currentTemp={telemetry.temperature}
              currentHumidity={telemetry.humidity}
              currentGas={telemetry.gasRaw}
            />

            <FreshnessMatrix
              items={items}
              onConsumeItem={handleConsumeItem}
              onInspectItem={handleInspectItem}
              onOpenRegisterModal={() =>
                setIsRegisterOpen(true)
              }
            />

          </div>
        )}

        {/*
        |--------------------------------------------------------------------------
        | Inventory
        |--------------------------------------------------------------------------
        */}

        {activeTab === 'inventory' && (
          <div className="space-y-6 animate-in fade-in duration-300">

            <FreshnessMatrix
              items={items}
              onConsumeItem={handleConsumeItem}
              onInspectItem={handleInspectItem}
              onOpenRegisterModal={() =>
                setIsRegisterOpen(true)
              }
            />

          </div>
        )}

        {/*
        |--------------------------------------------------------------------------
        | Diagnostics
        |--------------------------------------------------------------------------
        */}

        {activeTab === 'diagnostics' && (
          <div className="space-y-6 animate-in fade-in duration-300">

            <HardwareDiagnostics
              hardware={displayHardware}
            />

          </div>
        )}

        {/*
        |--------------------------------------------------------------------------
        | Alerts
        |--------------------------------------------------------------------------
        */}

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

      {/*
      |--------------------------------------------------------------------------
      | Threshold modal
      |--------------------------------------------------------------------------
      */}

      <ThresholdMatrixModal
        isOpen={isThresholdsOpen}
        onClose={() =>
          setIsThresholdsOpen(false)
        }
        thresholds={thresholds}
        onSaveThresholds={(updated) =>
          setThresholds(updated)
        }
      />

      {/*
      |--------------------------------------------------------------------------
      | IoT test matrix
      |--------------------------------------------------------------------------
      */}

      <IoTTestMatrixModal
        isOpen={isTestMatrixOpen}
        onClose={() =>
          setIsTestMatrixOpen(false)
        }
        onRunScenario={handleRunScenario}
        onResetNormal={handleResetNormal}
      />

      {/*
      |--------------------------------------------------------------------------
      | Register item modal
      |--------------------------------------------------------------------------
      */}

      <RegisterItemModal
        isOpen={isRegisterOpen}
        onClose={() =>
          setIsRegisterOpen(false)
        }
        thresholds={thresholds}
        onAddItem={handleAddItem}
      />

    </div>
  );
}