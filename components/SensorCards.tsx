'use client';

import React, { useState } from 'react';
import {
  Thermometer,
  Droplets,
  Wind,
  DoorClosed,
  DoorOpen,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { SensorTelemetry } from '@/lib/types';

interface SensorCardsProps {
  telemetry: SensorTelemetry;
}

export const SensorCards: React.FC<SensorCardsProps> = ({ telemetry }) => {
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');

  const displayTemp = tempUnit === 'C'
    ? telemetry.temperature.toFixed(1)
    : ((telemetry.temperature * 9) / 5 + 32).toFixed(1);

  // Temperature status
  const isTempColdSafe = telemetry.temperature >= 0.5 && telemetry.temperature <= 4.5;
  const isTempWarmWarning = telemetry.temperature > 4.5 && telemetry.temperature <= 8.0;

  // Humidity status
  const isHumidityOptimal = telemetry.humidity >= 60 && telemetry.humidity <= 75;
  const isHumidityHigh = telemetry.humidity > 75;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {/* 1. DHT-11 Temperature Card */}
      <div className="glass-panel glass-panel-hover rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
        
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Thermometer className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Chamber Temp</span>
                <p className="text-[10px] text-slate-500 font-mono"></p>
              </div>
            </div>

            {/* C/F Unit Toggle */}
            <button
              onClick={() => setTempUnit(tempUnit === 'C' ? 'F' : 'C')}
              className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-cyan-400 border border-white/5 transition-colors cursor-pointer"
            >
              °{tempUnit}
            </button>
          </div>

          {/* Main Reading */}
          <div className="mt-2 flex items-baseline gap-2">
            {!telemetry.dht11Healthy ? (
              <div className="py-2">
                <span className="text-xl font-bold text-orange-400">DATA UNAVAILABLE</span>
                <p className="text-xs text-orange-300/80">Sensor Fault (§1.6.vii)</p>
              </div>
            ) : (
              <>
                <span className="text-4xl font-extrabold tracking-tight font-mono text-white">
                  {displayTemp}
                </span>
                <span className="text-xl font-bold text-slate-400">°{tempUnit}</span>
              </>
            )}
          </div>

          {/* Temperature Range Gauge */}
          {telemetry.dht11Healthy && (
            <div className="mt-4 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Safe Cold Band (1.0° - 4.5°C)</span>
                <span className={isTempColdSafe ? 'text-emerald-400 font-medium' : isTempWarmWarning ? 'text-amber-400 font-medium' : 'text-rose-400 font-medium'}>
                  {isTempColdSafe ? 'Optimal' : isTempWarmWarning ? 'Elevated Warm' : 'Critical Warning'}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
                <div
                  className={`h-full transition-all duration-500 ${
                    isTempColdSafe
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      : isTempWarmWarning
                      ? 'bg-gradient-to-r from-amber-500 to-orange-400'
                      : 'bg-gradient-to-r from-rose-500 to-red-600'
                  }`}
                  style={{ width: `${Math.min(Math.max((telemetry.temperature / 12) * 100, 10), 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
          <span>Min/Max Today:</span>
          <span className="font-mono text-slate-300">2.9°C / 4.6°C</span>
        </div>
      </div>

      {/* 2. DHT-11 Humidity Card */}
      <div className="glass-panel glass-panel-hover rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Chamber Humidity</span>
                
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-blue-300 border border-blue-500/20">
              % RH
            </span>
          </div>

          {/* Main Reading */}
          <div className="mt-2 flex items-baseline gap-2">
            {!telemetry.dht11Healthy ? (
              <div className="py-2">
                <span className="text-xl font-bold text-orange-400">DATA UNAVAILABLE</span>
                <p className="text-xs text-orange-300/80">Sensor Fault (§1.6.vii)</p>
              </div>
            ) : (
              <>
                <span className="text-4xl font-extrabold tracking-tight font-mono text-white">
                  {telemetry.humidity.toFixed(1)}
                </span>
                <span className="text-xl font-bold text-slate-400">%</span>
              </>
            )}
          </div>

          {/* Humidity Bar */}
          {telemetry.dht11Healthy && (
            <div className="mt-4 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Target Range (60% - 75%)</span>
                <span className={isHumidityOptimal ? 'text-emerald-400 font-medium' : 'text-blue-400 font-medium'}>
                  {isHumidityOptimal ? 'Ideal Moisture' : isHumidityHigh ? 'Condensation Risk' : 'Low Moisture'}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-400 transition-all duration-500"
                  style={{ width: `${Math.min(Math.max(telemetry.humidity, 5), 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
          <span>Condensation Guard:</span>
          <span className="font-mono text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Dew point safe
          </span>
        </div>
      </div>

      {/* 3. MQ-135 Gas Sensor + ADS1115 ADC Card */}
      <div className="glass-panel glass-panel-hover rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Wind className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Gas & Air Quality</span>
                
              </div>
            </div>

            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                telemetry.gasStatus === 'CLEAN' || telemetry.gasStatus === 'NORMAL'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'
              }`}
            >
              {telemetry.gasStatus}
            </span>
          </div>

          {/* Main Reading */}
          <div className="mt-2 flex items-baseline gap-2">
            {!telemetry.ads1115Healthy || !telemetry.mq135Healthy ? (
              <div className="py-2">
                <span className="text-xl font-bold text-orange-400">ADC FAULT</span>
                <p className="text-xs text-orange-300/80">I2C 0x48 Offline</p>
              </div>
            ) : (
              <>
                <span className="text-4xl font-extrabold tracking-tight font-mono text-white">
                  {telemetry.gasRaw.toLocaleString()}
                </span>
                <span className="text-xs font-mono text-slate-400">ADC counts</span>
              </>
            )}
          </div>

          {/* ADS1115 16-bit Voltage & Ratio */}
          <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] font-mono bg-slate-900/60 p-2 rounded-lg border border-white/5">
            <div>
              <span className="text-slate-500 block text-[10px]">Voltage (A0):</span>
              <span className="text-cyan-300 font-semibold">{telemetry.gasVoltage.toFixed(3)} V</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Rs / Ro Ratio:</span>
              <span className="text-emerald-300 font-semibold">{telemetry.gasRatio.toFixed(2)}x</span>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
          <span>Baseline: {telemetry.gasBaseline} counts</span>
          <span className="text-slate-500 italic">Zone air quality (§1.6.xi)</span>
        </div>
      </div>

      {/* 4. Reed Switch Door Card */}
      <div className="glass-panel glass-panel-hover rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
        <div
          className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none ${
            telemetry.doorOpen ? 'bg-rose-500/20' : 'bg-emerald-500/10'
          }`}
        />

        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div
                className={`p-2 rounded-xl border ${
                  telemetry.doorOpen
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }`}
              >
                {telemetry.doorOpen ? (
                  <DoorOpen className="w-5 h-5 animate-bounce" />
                ) : (
                  <DoorClosed className="w-5 h-5" />
                )}
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Door Monitor</span>
                
              </div>
            </div>

            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono border font-semibold ${
                telemetry.doorOpen
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              }`}
            >
              {telemetry.doorOpen ? 'OPEN' : 'CLOSED'}
            </span>
          </div>

          {/* Main Status Display */}
          <div className="mt-2">
            {telemetry.doorOpen ? (
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold font-mono text-rose-400">
                    {telemetry.doorOpenSeconds}s
                  </span>
                  <span className="text-xs text-rose-300 font-mono">elapsed</span>
                </div>
                {telemetry.doorOpenSeconds > 45 && (
                  <p className="text-[11px] text-rose-300 font-semibold mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
                    Timeout exceeded (§1.6.vi Buzzer Active)
                  </p>
                )}
              </div>
            ) : (
              <div>
                <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
                  LATCHED
                </span>
                <p className="text-xs text-slate-400 mt-1">Magnetic seal secure</p>
              </div>
            )}
          </div>

          {/* Debounce & Daily Cycles */}
          <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] font-mono bg-slate-900/60 p-2 rounded-lg border border-white/5">
            <div>
              <span className="text-slate-500 block text-[10px]">Opens Today:</span>
              <span className="text-white font-semibold">{telemetry.doorOpenCountToday} times</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Debounce:</span>
              <span className="text-emerald-400 font-semibold">50ms Active</span>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
          <span>Alarm Limit: &gt; 45 sec</span>
          <span className="text-emerald-400">Cold air preserved</span>
        </div>
      </div>
    </div>
  );
};
