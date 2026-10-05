'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Monitor,
  Lightbulb,
  BatteryCharging,
  Power,
  Check,
} from 'lucide-react';

import {
  HardwareStatus,
  SensorTelemetry,
  FreshnessState,
} from '@/lib/types';

interface LcdLedMirrorProps {
  hardware: HardwareStatus;
  telemetry: SensorTelemetry;
  overallStatus: FreshnessState;

  // Number of food items currently tracked/in storage.
  // If your parent already has this value, pass it here.
  itemCount: number;
}

interface LcdScreen {
  name: string;
  line1: string;
  line2: string;
}

export const LcdLedMirror: React.FC<LcdLedMirrorProps> = ({
  hardware,
  telemetry,
  overallStatus,
  itemCount,
}) => {
  // ============================================================
  // LCD CONFIGURATION
  // ============================================================

  // Must match config.LCD_CYCLE_SECONDS on Raspberry Pi.
  // Python LCD currently needs to cycle every 1 second.
  const LCD_CYCLE_INTERVAL = 2500;

  const [currentScreen, setCurrentScreen] = useState(0);

  // ============================================================
  // FORMAT EXACTLY 16 CHARACTERS
  // ============================================================

  const format16 = (text: string) => {
    return text.padEnd(16, ' ').slice(0, 16);
  };

  // ============================================================
  // VALUES MATCHING lcd_display.py
  // ============================================================

  const temperature = telemetry.temperature;
  const humidity = telemetry.humidity;
  const gasVoltage = telemetry.gasVoltage;
  const doorOpen = telemetry.doorOpen;
  const wifiConnected = hardware.rpi3b.wifiSignalDbm !== undefined;

  // ------------------------------------------------------------
  // Sensor fault states
  //
  // Python:
  // dht_fault
  // gas_fault
  // door_fault
  //
  // Frontend equivalent:
  // dht11Healthy
  // mq135Healthy / ads1115Healthy
  // reedSwitchHealthy
  // ------------------------------------------------------------

  const dhtFault = !telemetry.dht11Healthy;

  const gasFault =
    !telemetry.mq135Healthy ||
    !telemetry.ads1115Healthy;

  const doorFault = !telemetry.reedSwitchHealthy;

  // ============================================================
  // GAS ABNORMAL
  //
  // Matches:
  //
  // gas_voltage >
  // config.GAS_BASELINE_VOLTAGE + config.GAS_ABNORMAL_DELTA
  //
  // IMPORTANT:
  // Replace these two constants with the exact values from
  // your Python config.py if they are different.
  // ============================================================

  const GAS_BASELINE_VOLTAGE = 0.0;
  const GAS_ABNORMAL_DELTA = 0.0;

  const gasAbnormal =
    gasVoltage !== null &&
    gasVoltage !== undefined &&
    gasVoltage >
      GAS_BASELINE_VOLTAGE + GAS_ABNORMAL_DELTA;

  // ============================================================
  // PYTHON STATUS EQUIVALENT
  // ============================================================

  const statusText = (() => {
    switch (overallStatus) {
      case 'FRESH':
        return 'Fresh';

      case 'USE_SOON':
        return 'Use Soon';

      case 'CHECK_FOOD':
        return 'Check Food';

      case 'SENSOR_FAULT':
        return 'Sensor Fault/Data Unavailable';

      default:
        return 'Sensor Fault/Data Unavailable';
    }
  })();

  // ============================================================
  // BUILD EXACT SAME SCREENS AS lcd_display.py
  // ============================================================

  const lcdScreens = useMemo<LcdScreen[]>(() => {
    const screens: LcdScreen[] = [
      // --------------------------------------------------------
      // 1. Temperature
      // Python:
      //
      // ("Temperature",
      //  "SENSOR FAULT" if (dht_fault or temp is None)
      //  else f"{temp:.1f} C")
      // --------------------------------------------------------

      {
        name: 'Temperature',
        line1: 'Temperature',
        line2: dhtFault
          ? 'SENSOR FAULT'
          : `${temperature.toFixed(1)} C`,
      },

      // --------------------------------------------------------
      // 2. Humidity
      // Python:
      //
      // ("Humidity",
      //  "SENSOR FAULT" if (dht_fault or humidity is None)
      //  else f"{humidity:.0f} %")
      // --------------------------------------------------------

      {
        name: 'Humidity',
        line1: 'Humidity',
        line2: dhtFault
          ? 'SENSOR FAULT'
          : `${humidity.toFixed(0)} %`,
      },

      // --------------------------------------------------------
      // 3. Gas Quality
      // Python:
      //
      // ("Gas Quality",
      //  "SENSOR FAULT" if (gas_fault or gas_voltage is None)
      //  else
      //    f"{gas_voltage:.2f}V ABNORMAL"
      //    if gas_abnormal
      //    else f"{gas_voltage:.2f}V Normal")
      // --------------------------------------------------------

      {
        name: 'Gas Quality',
        line1: 'Gas Quality',
        line2: gasFault
          ? 'SENSOR FAULT'
          : gasAbnormal
            ? `${gasVoltage.toFixed(2)}V ABNORMAL`
            : `${gasVoltage.toFixed(2)}V Normal`,
      },

      // --------------------------------------------------------
      // 4. Door
      // --------------------------------------------------------

      {
        name: 'Door',
        line1: 'Door',
        line2: doorFault
          ? 'SENSOR FAULT'
          : doorOpen
            ? 'OPEN!'
            : 'Closed',
      },

      // --------------------------------------------------------
      // 5. WiFi
      // --------------------------------------------------------

      {
        name: 'WiFi',
        line1: 'WiFi',
        line2: wifiConnected
          ? 'Connected'
          : 'Disconnected',
      },

      // --------------------------------------------------------
      // 6. Items Tracked
      // Python:
      //
      // ("Items Tracked", f"{item_count} item(s)")
      // --------------------------------------------------------

      {
        name: 'Items Tracked',
        line1: 'Items Tracked',
        line2: `${itemCount} item(s)`,
      },

      // --------------------------------------------------------
      // 7. Pi IP Address
      // --------------------------------------------------------

      {
        name: 'Pi IP Address',
        line1: 'Pi IP Address',
        line2: hardware.rpi3b.ipAddress || '0.0.0.0',
      },

      // --------------------------------------------------------
      // 8. Status
      // --------------------------------------------------------

      {
        name: 'Status',
        line1: 'Status',
        line2: statusText,
      },
    ];

    // ==========================================================
    // EXACT SAME "NEEDS ATTENTION" BEHAVIOR AS PYTHON
    //
    // Python:
    //
    // needs_attention = (
    //     status in ("Check Food", "Sensor Fault/Data Unavailable")
    //     or dht_fault
    //     or gas_fault
    //     or door_fault
    // )
    //
    // If true:
    //     status screen moves to position 0.
    // ==========================================================

    const needsAttention =
      statusText === 'Check Food' ||
      statusText === 'Sensor Fault/Data Unavailable' ||
      dhtFault ||
      gasFault ||
      doorFault;

    if (needsAttention) {
      const statusScreen = screens.pop();

      if (statusScreen) {
        screens.unshift(statusScreen);
      }
    }

    return screens;
  }, [
    temperature,
    humidity,
    gasVoltage,
    doorOpen,
    dhtFault,
    gasFault,
    doorFault,
    gasAbnormal,
    wifiConnected,
    itemCount,
    hardware.rpi3b.ipAddress,
    statusText,
  ]);

  // ============================================================
  // CYCLE LCD EVERY 1 SECOND
  // ============================================================

  useEffect(() => {
    // Make sure current index remains valid if the screen list
    // changes because of a sensor fault / status change.
    setCurrentScreen((previous) => {
      if (previous >= lcdScreens.length) {
        return 0;
      }

      return previous;
    });
  }, [lcdScreens.length]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentScreen((previousScreen) => {
        return (previousScreen + 1) % lcdScreens.length;
      });
    }, LCD_CYCLE_INTERVAL);

    return () => {
      window.clearInterval(interval);
    };
  }, [lcdScreens.length]);

  // ============================================================
  // CURRENT SCREEN
  // ============================================================

  const activeScreen = lcdScreens[currentScreen];

  const line1 = format16(activeScreen.line1);
  const line2 = format16(activeScreen.line2);

  // ============================================================
  // LCD BACKLIGHT
  // ============================================================

  const backlightTheme = 'emerald';

  const getLcdBacklightClass = () => {
  return 'bg-[#0a2514] text-[#4ade80] border-[#144724] shadow-[0_0_20px_rgba(74,222,128,0.25)]';
};

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

      {/* ======================================================
          1. LCD 1602A DIGITAL TWIN
          ====================================================== */}

      <div className="lg:col-span-2 glass-panel rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">

        <div>

          {/* HEADER */}

          <div className="flex items-center justify-between mb-3">

            <div className="flex items-center gap-2">

              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Monitor className="w-5 h-5" />
              </div>

              <div>

                <h3 className="text-sm font-bold text-white tracking-wide">
                  Display Status
                </h3>

                <p className="text-[10px] text-slate-500 font-mono">
                  1602A DIGITAL TWIN
                </p>

              </div>

            </div>

            {/* SCREEN INDICATOR */}

            <div className="flex flex-col items-end gap-1">

              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-white/5">
                SCREEN {currentScreen + 1}/{lcdScreens.length}
              </span>

              <span className="text-[9px] font-mono text-slate-600">
                {activeScreen.name}
              </span>

            </div>

          </div>


          {/* LCD BEZEL */}

          <div className="mt-3 p-4 bg-[#0a0f1d] rounded-xl border-2 border-slate-700/60 shadow-inner">

            {/* ACTUAL SCREEN GLASS */}

            <div
              className={`
                p-4
                rounded-lg
                font-mono
                text-lg
                sm:text-2xl
                font-bold
                tracking-[0.25em]
                border-2
                select-none
                transition-all
                duration-300
                ${getLcdBacklightClass()}
              `}
              style={{
                textShadow: '0 0 10px rgba(74,222,128,0.7)',
              }}
            >

              {/* LINE 1 */}

              <div className="flex items-center whitespace-pre font-mono tracking-widest border-b border-black/20 pb-1 overflow-hidden">
                <span>{line1}</span>
              </div>

              {/* LINE 2 */}

              <div className="flex items-center whitespace-pre font-mono tracking-widest pt-1 overflow-hidden">
                <span>{line2}</span>
              </div>

            </div>

          </div>

        </div>


        {/* FOOTER */}

        <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">

          <div className="flex items-center gap-2">

            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />

            <span className="font-mono text-slate-300">
              LCD: Sync Active
            </span>

          </div>

          <span className="font-mono text-slate-500">
            Cycle: 2.5s
          </span>

        </div>

      </div>


      {/* ======================================================
          2. PHYSICAL STATUS LEDs & DS3231
          ====================================================== */}

      <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between">

        <div>

          {/* HEADER */}

          <div className="flex items-center justify-between mb-3">

            <div className="flex items-center gap-2">

              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Lightbulb className="w-5 h-5" />
              </div>

              <div>

                <h3 className="text-sm font-bold text-white tracking-wide">
                  Physical Status LEDs
                </h3>

              </div>

            </div>

            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-white/5">
              {overallStatus}
            </span>

          </div>


          {/* TRI-COLOR LEDs */}

          <div className="mt-3 p-3 bg-slate-900/80 rounded-xl border border-white/5">

            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-2">
              Tri-Color LEDs
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">

              {/* GREEN */}

              <div className="flex flex-col items-center gap-1.5 p-2 rounded-lg bg-black/40 border border-white/5">

                <div
                  className={`
                    w-7 h-7
                    rounded-full
                    border-2
                    border-emerald-400/80
                    transition-all
                    duration-300
                    ${
                      hardware.leds.activeLed === 'GREEN'
                        ? 'led-glow-green scale-110'
                        : 'led-off'
                    }
                  `}
                />

                <span className="text-[11px] font-bold text-emerald-400">
                  GREEN
                </span>

                <span className="text-[9px] text-slate-500 font-mono">
                  FRESH/OK
                </span>

              </div>


              {/* YELLOW */}

              <div className="flex flex-col items-center gap-1.5 p-2 rounded-lg bg-black/40 border border-white/5">

                <div
                  className={`
                    w-7 h-7
                    rounded-full
                    border-2
                    border-amber-400/80
                    transition-all
                    duration-300
                    ${
                      hardware.leds.activeLed === 'YELLOW'
                        ? 'led-glow-yellow scale-110'
                        : 'led-off'
                    }
                  `}
                />

                <span className="text-[11px] font-bold text-amber-400">
                  YELLOW
                </span>

                <span className="text-[9px] text-slate-500 font-mono">
                  USE SOON
                </span>

              </div>


              {/* RED */}

              <div className="flex flex-col items-center gap-1.5 p-2 rounded-lg bg-black/40 border border-white/5">

                <div
                  className={`
                    w-7 h-7
                    rounded-full
                    border-2
                    border-rose-400/80
                    transition-all
                    duration-300
                    ${
                      hardware.leds.activeLed === 'RED'
                        ? 'led-glow-red scale-110'
                        : 'led-off'
                    }
                  `}
                />

                <span className="text-[11px] font-bold text-rose-400">
                  RED
                </span>

                <span className="text-[9px] text-slate-500 font-mono">
                  CHECK FOOD
                </span>

              </div>

            </div>

          </div>


          {/* DS3231 / PSU */}

          <div className="mt-3 space-y-2">

            {/* RTC */}

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-white/5 text-xs font-mono">

              <div className="flex items-center gap-2 text-slate-300">

                <BatteryCharging className="w-4 h-4 text-cyan-400" />

                <span>
                  DS3231 RTC Backup:
                </span>

              </div>

              <span
                className={`font-semibold flex items-center gap-1 ${
                  telemetry.ds3231Healthy
                    ? 'text-emerald-400'
                    : 'text-rose-400'
                }`}
              >

                <Check className="w-3 h-3" />

                {hardware.ds3231.batteryVoltage}V

              </span>

            </div>


            {/* PSU */}

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-white/5 text-xs font-mono">

              <div className="flex items-center gap-2 text-slate-300">

                <Power className="w-4 h-4 text-emerald-400" />

                <span>
                  Power Supply (PSU):
                </span>

              </div>

              <span className="text-cyan-300 font-semibold">
                {telemetry.psuVoltage.toFixed(2)}V
              </span>

            </div>

          </div>

        </div>


        {/* FOOTER */}

        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">

          <span>
            RTC Time Drift: +{hardware.ds3231.timeDriftSec}s
          </span>

          <span className="text-emerald-400">
            Continuous Mains Supply
          </span>

        </div>

      </div>

    </div>
  );
};