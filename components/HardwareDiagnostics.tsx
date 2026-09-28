'use client';

import React from 'react';
import {
  Cpu,
  Zap,
  Activity,
  CheckCircle2,
  AlertTriangle,
  HardDrive,
  Wifi,
  Layers
} from 'lucide-react';
import { HardwareStatus } from '@/lib/types';

interface HardwareDiagnosticsProps {
  hardware: HardwareStatus;
}

export const HardwareDiagnostics: React.FC<HardwareDiagnosticsProps> = ({
  hardware,
}) => {
  const pinMappings = [
    {
      component: 'ADS1115 (16-bit ADC)',
      signal: 'SDA / SCL',
      piPin: 'Pin 3 (GPIO 2) & Pin 5 (GPIO 3)',
      voltage: '3.3V',
      bus: 'I2C Bus 1 (Addr 0x48)',
      status: hardware.ads1115.status,
    },
    {
      component: 'MQ-135 Gas Sensor',
      signal: 'Analog AOUT',
      piPin: 'Connected to ADS1115 Channel A0',
      voltage: '5.0V (VCC) / AIN',
      bus: 'Analog via ADS1115',
      status: hardware.mq135.status,
    },
    {
      component: 'DHT-11 Temp & Humidity',
      signal: 'DATA (1-Wire)',
      piPin: 'Pin 7 (GPIO 4)',
      voltage: '3.3V',
      bus: '1-Wire Digital GPIO',
      status: hardware.dht11.status,
    },
    {
      component: 'DS3231 RTC Module',
      signal: 'SDA / SCL',
      piPin: 'Pin 3 (GPIO 2) & Pin 5 (GPIO 3)',
      voltage: '3.3V + CR2032',
      bus: 'I2C Bus 1 (Addr 0x68)',
      status: hardware.ds3231.status,
    },
    {
      component: 'LCD 1602A (PCF8574 Backpack)',
      signal: 'SDA / SCL',
      piPin: 'Pin 3 (GPIO 2) & Pin 5 (GPIO 3)',
      voltage: '5.0V',
      bus: 'I2C Bus 1 (Addr 0x27)',
      status: hardware.lcd1602.status,
    },
    {
      component: 'RFID-RC522 Reader',
      signal: 'SPI (MOSI, MISO, SCK, CE0, RST)',
      piPin: 'Pins 19, 21, 23, 24, 22 (GPIO 10, 9, 11, 8, 25)',
      voltage: '3.3V',
      bus: 'SPI Bus 0 (Device 0)',
      status: hardware.rfidRc522.status,
    },
    {
      component: 'Reed Switch & Magnet',
      signal: 'Door State',
      piPin: 'Pin 11 (GPIO 17)',
      voltage: 'Internal Pull-Up',
      bus: 'Digital Input (50ms Debounce)',
      status: hardware.reedSwitch.status,
    },
    {
      component: 'Tri-Color LEDs',
      signal: 'Green, Yellow, Red Anodes',
      piPin: 'Pins 13, 15, 16 (GPIO 27, 22, 23)',
      voltage: '3.3V via 330Ω',
      bus: 'Digital Output GPIOs',
      status: 'ONLINE',
    },
    {
      component: 'Power Supply Unit (PSU)',
      signal: '5V Regulated Rail',
      piPin: 'Pin 2 & Pin 4 (5V0) + GND Pins',
      voltage: '5.14V DC',
      bus: 'Continuous Mains DC Rail',
      status: 'ONLINE',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Raspberry Pi 3 Model B System Telemetry */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                Raspberry Pi 3 Model B v1.2 Gateway Telemetry
              </h2>
              <p className="text-xs text-slate-400">
                
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              SYSTEM HEALTHY
            </span>
          </div>
        </div>

        {/* 4 Stat Cards for Pi 3B */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>CPU Load:</span>
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-white">
              {hardware.rpi3b.cpuUsage}%
            </div>
            <p className="text-[10px] text-slate-500">4 Cores Active</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>CPU Core Temp:</span>
              <Zap className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-white">
              {hardware.rpi3b.cpuTemp}°C
            </div>
            <p className="text-[10px] text-emerald-400">Passive heatsink cool</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>RAM Allocation:</span>
              <HardDrive className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-white">
              {hardware.rpi3b.ramUsageMB} <span className="text-xs text-slate-400">/ 948 MB</span>
            </div>
            <p className="text-[10px] text-slate-500">30% buffer utilized</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Wi-Fi & Uptime:</span>
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-lg font-bold font-mono text-cyan-300">
              {hardware.rpi3b.wifiSignalDbm} dBm
            </div>
            <p className="text-[10px] text-slate-400">Uptime: {hardware.rpi3b.uptime}</p>
          </div>
        </div>
      </div>

      {/* 2. Full SRS Pin Mapping & Hardware Bus Interconnect Matrix */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                Hardware Pin-Mapping & Electrical Bus Table
              </h3>
              
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-white/10 bg-slate-950/60">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-slate-900/80 text-slate-400 uppercase font-mono text-[10px] tracking-wider">
                <th className="py-3 px-4">Hardware Component</th>
                <th className="py-3 px-4">Signal Line</th>
                <th className="py-3 px-4">RPi 3B Pin / Channel</th>
                <th className="py-3 px-4">Supply Level</th>
                <th className="py-3 px-4">Bus / Protocol</th>
                <th className="py-3 px-4 text-right">Heartbeat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {pinMappings.map((pin, i) => (
                <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 font-semibold text-white">
                    {pin.component}
                  </td>
                  <td className="py-3 px-4 font-mono text-cyan-300">
                    {pin.signal}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-300">
                    {pin.piPin}
                  </td>
                  <td className="py-3 px-4 font-mono text-amber-300 text-[11px]">
                    {pin.voltage}
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-xs">
                    {pin.bus}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {pin.status === 'ONLINE' || pin.status === 'SYNCED' || pin.status === 'READY' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        {pin.status}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        <AlertTriangle className="w-3 h-3" />
                        FAULT
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
