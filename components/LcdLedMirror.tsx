'use client';

import React, { useState } from 'react';
import {
  Monitor,
  Lightbulb,
  BatteryCharging,
  Power,
  Check
} from 'lucide-react';
import { HardwareStatus, FreshnessState } from '@/lib/types';

interface LcdLedMirrorProps {
  hardware: HardwareStatus;
  overallStatus: FreshnessState;
}

export const LcdLedMirror: React.FC<LcdLedMirrorProps> = ({
  hardware,
  overallStatus,
}) => {
  const [backlightTheme, setBacklightTheme] = useState<'emerald' | 'blue' | 'amber'>('emerald');

  // Format 16 characters exactly for LCD line 1 & 2
  const format16 = (text: string) => {
    return text.padEnd(16, ' ').slice(0, 16);
  };

  const line1 = format16(hardware.lcd1602.line1 || 'FRESHGUARD IoT');
  const line2 = format16(hardware.lcd1602.line2 || 'STATUS: NORMAL');

  const getLcdBacklightClass = () => {
    switch (backlightTheme) {
      case 'blue':
        return 'bg-[#0f2b46] text-[#38bdf8] border-[#1e4976] shadow-[0_0_20px_rgba(56,189,248,0.25)]';
      case 'amber':
        return 'bg-[#35250c] text-[#fbbf24] border-[#654316] shadow-[0_0_20px_rgba(251,191,36,0.25)]';
      case 'emerald':
      default:
        return 'bg-[#0a2514] text-[#4ade80] border-[#144724] shadow-[0_0_20px_rgba(74,222,128,0.25)]';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      {/* 1. LCD 1602A (PCF8574 I2C) Digital Twin */}
      <div className="lg:col-span-2 glass-panel rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Monitor className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Display Status
                </h3>
                
              </div>
            </div>

            
            
          </div>

          {/* Realistic 16x2 Bezel and Dot Matrix Panel */}
          <div className="mt-3 p-4 bg-[#0a0f1d] rounded-xl border-2 border-slate-700/60 shadow-inner">
            

            {/* The Actual Screen Glass */}
            <div
              className={`p-4 rounded-lg font-mono text-lg sm:text-2xl font-bold tracking-[0.25em] border-2 select-none transition-all duration-300 ${getLcdBacklightClass()}`}
              style={{
                textShadow:
                  backlightTheme === 'emerald'
                    ? '0 0 10px rgba(74,222,128,0.7)'
                    : backlightTheme === 'blue'
                    ? '0 0 10px rgba(56,189,248,0.7)'
                    : '0 0 10px rgba(251,191,36,0.7)',
              }}
            >
              {/* Line 1 */}
              <div className="flex justify-between items-center whitespace-pre font-mono tracking-widest border-b border-black/20 pb-1">
                <span>{line1}</span>
              </div>
              {/* Line 2 */}
              <div className="flex justify-between items-center whitespace-pre font-mono tracking-widest pt-1">
                <span>{line2}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-slate-300">LCD: Sync Active</span>
          </div>
          
        </div>
      </div>

      {/* 2. Physical 3-Status LEDs & DS3231 Module Mirror */}
      <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between">
        <div>
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

          {/* Tri-Color LEDs Panel */}
          <div className="mt-3 p-3 bg-slate-900/80 rounded-xl border border-white/5">
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-2">
              Tri-Color LEDs 
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              {/* Green LED */}
              <div className="flex flex-col items-center gap-1.5 p-2 rounded-lg bg-black/40 border border-white/5">
                <div
                  className={`w-7 h-7 rounded-full border-2 border-emerald-400/80 transition-all duration-300 ${
                    hardware.leds.activeLed === 'GREEN'
                      ? 'led-glow-green scale-110'
                      : 'led-off'
                  }`}
                />
                <span className="text-[11px] font-bold text-emerald-400">GREEN</span>
                <span className="text-[9px] text-slate-500 font-mono">FRESH/OK</span>
              </div>

              {/* Yellow LED */}
              <div className="flex flex-col items-center gap-1.5 p-2 rounded-lg bg-black/40 border border-white/5">
                <div
                  className={`w-7 h-7 rounded-full border-2 border-amber-400/80 transition-all duration-300 ${
                    hardware.leds.activeLed === 'YELLOW'
                      ? 'led-glow-yellow scale-110'
                      : 'led-off'
                  }`}
                />
                <span className="text-[11px] font-bold text-amber-400">YELLOW</span>
                <span className="text-[9px] text-slate-500 font-mono">USE SOON</span>
              </div>

              {/* Red LED */}
              <div className="flex flex-col items-center gap-1.5 p-2 rounded-lg bg-black/40 border border-white/5">
                <div
                  className={`w-7 h-7 rounded-full border-2 border-rose-400/80 transition-all duration-300 ${
                    hardware.leds.activeLed === 'RED'
                      ? 'led-glow-red scale-110'
                      : 'led-off'
                  }`}
                />
                <span className="text-[11px] font-bold text-rose-400">RED</span>
                <span className="text-[9px] text-slate-500 font-mono">CHECK FOOD</span>
              </div>
            </div>
          </div>

          {/* DS3231 RTC Module & Power Supply Status */}
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-white/5 text-xs font-mono">
              <div className="flex items-center gap-2 text-slate-300">
                <BatteryCharging className="w-4 h-4 text-cyan-400" />
                <span>DS3231 RTC Backup:</span>
              </div>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <Check className="w-3 h-3" />
                {hardware.ds3231.batteryVoltage}V 
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-white/5 text-xs font-mono">
              <div className="flex items-center gap-2 text-slate-300">
                <Power className="w-4 h-4 text-emerald-400" />
                <span>Power Supply (PSU):</span>
              </div>
              <span className="text-cyan-300 font-semibold">
                {hardware.psu.rail5v}V / {hardware.psu.currentAmps}A
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
          <span>RTC Time Drift: +{hardware.ds3231.timeDriftSec}s</span>
          <span className="text-emerald-400">Continuous Mains Supply</span>
        </div>
      </div>
    </div>
  );
};
