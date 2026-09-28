'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  PieChart as PieChartIcon,
  CheckCircle2,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { FoodItem } from '@/lib/types';

interface TelemetryChartsProps {
  items: FoodItem[];
  currentTemp: number;
  currentHumidity: number;
  currentGas: number;
}

export const TelemetryCharts: React.FC<TelemetryChartsProps> = ({
  items,
  currentTemp,
  currentHumidity,
  currentGas,
}) => {
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d'>('24h');
  const [activeMetric, setActiveMetric] = useState<'all' | 'temp' | 'humidity' | 'gas'>('all');

  // Freshness inventory distribution
  const freshCount = items.filter((i) => i.status === 'FRESH').length;
  const useSoonCount = items.filter((i) => i.status === 'USE_SOON').length;
  const checkFoodCount = items.filter((i) => i.status === 'CHECK_FOOD').length;
  const totalCount = items.length || 1;

  const freshPercent = Math.round((freshCount / totalCount) * 100);
  const useSoonPercent = Math.round((useSoonCount / totalCount) * 100);
  const checkFoodPercent = Math.round((checkFoodCount / totalCount) * 100);

  // Generate smooth historical points depending on selected timeRange
  const generateTelemetryPoints = () => {
    const labels =
      timeRange === '1h'
        ? ['-55m', '-50m', '-45m', '-40m', '-35m', '-30m', '-25m', '-20m', '-15m', '-10m', '-5m', 'Now']
        : timeRange === '24h'
        ? ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', 'Now']
        : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Today'];

    // Simulated data series
    const temps = [3.2, 3.4, 3.1, 3.6, 4.2, 3.9, 3.5, 3.7, 4.0, 3.6, 3.4, currentTemp];
    const hums = [66, 68, 65, 71, 74, 69, 67, 70, 72, 68, 67, currentHumidity];
    const gases = [1120, 1150, 1090, 1180, 1340, 1260, 1210, 1290, 1420, 1310, 1220, currentGas];

    return labels.map((label, idx) => ({
      label,
      temp: temps[idx],
      humidity: hums[idx],
      gas: gases[idx],
    }));
  };

  const data = generateTelemetryPoints();

  // SVG Coordinates calculation
  const svgWidth = 600;
  const svgHeight = 180;
  const padding = 20;

  // Temp min/max scaling (0°C to 10°C)
  const getTempY = (v: number) =>
    svgHeight - padding - ((v - 0) / 10) * (svgHeight - padding * 2);

  // Humidity min/max scaling (40% to 100%)
  const getHumY = (v: number) =>
    svgHeight - padding - ((v - 40) / 60) * (svgHeight - padding * 2);

  // Gas min/max scaling (800 to 4000)
  const getGasY = (v: number) =>
    svgHeight - padding - ((v - 800) / 3200) * (svgHeight - padding * 2);

  const getX = (idx: number) =>
    padding + (idx / (data.length - 1)) * (svgWidth - padding * 2);

  // Construct SVG Path strings
  const tempPath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getTempY(d.temp)}`)
    .join(' ');

  const humPath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getHumY(d.humidity)}`)
    .join(' ');

  const gasPath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getGasY(d.gas)}`)
    .join(' ');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Multi-Stream Real-Time Telemetry Curve */}
      <div className="lg:col-span-2 glass-panel rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Environmental Telemetry & Spoilage Trends
                </h3>
                
              </div>
            </div>

            {/* Timeframe Selector */}
            <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-white/5 self-start sm:self-auto">
              {(['1h', '24h', '7d'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all cursor-pointer ${
                    timeRange === r
                      ? 'bg-purple-600 text-white font-bold shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {r.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Metric Filter Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <button
              onClick={() => setActiveMetric('all')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-all ${
                activeMetric === 'all'
                  ? 'bg-white/10 text-white border border-white/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Signals
            </button>
            <button
              onClick={() => setActiveMetric('temp')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-all ${
                activeMetric === 'temp'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-cyan-400'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              Temp (°C)
            </button>
            <button
              onClick={() => setActiveMetric('humidity')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-all ${
                activeMetric === 'humidity'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                  : 'text-slate-400 hover:text-blue-400'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              Humidity (% RH)
            </button>
            <button
              onClick={() => setActiveMetric('gas')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-all ${
                activeMetric === 'gas'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-emerald-400'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              MQ-135 Gas (ADS1115)
            </button>
          </div>

          {/* SVG Vector Chart */}
          <div className="w-full overflow-hidden bg-slate-950/60 rounded-xl p-3 border border-white/5">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-44 sm:h-52 overflow-visible"
            >
              <defs>
                <linearGradient id="tempGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="gasGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line
                x1={padding}
                y1={padding}
                x2={svgWidth - padding}
                y2={padding}
                stroke="#1e293b"
                strokeDasharray="4 4"
              />
              <line
                x1={padding}
                y1={svgHeight / 2}
                x2={svgWidth - padding}
                y2={svgHeight / 2}
                stroke="#1e293b"
                strokeDasharray="4 4"
              />
              <line
                x1={padding}
                y1={svgHeight - padding}
                x2={svgWidth - padding}
                y2={svgHeight - padding}
                stroke="#1e293b"
              />

              {/* Temperature Curve */}
              {(activeMetric === 'all' || activeMetric === 'temp') && (
                <path
                  d={tempPath}
                  fill="none"
                  stroke="#22d3ee"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
              )}

              {/* Humidity Curve */}
              {(activeMetric === 'all' || activeMetric === 'humidity') && (
                <path
                  d={humPath}
                  fill="none"
                  stroke="#60a5fa"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray="2 2"
                  className="transition-all duration-300"
                />
              )}

              {/* Gas Reading Curve */}
              {(activeMetric === 'all' || activeMetric === 'gas') && (
                <path
                  d={gasPath}
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
              )}

              {/* Data points for current state */}
              <circle
                cx={getX(data.length - 1)}
                cy={getTempY(currentTemp)}
                r="4"
                fill="#22d3ee"
                className="animate-ping"
              />
              <circle
                cx={getX(data.length - 1)}
                cy={getTempY(currentTemp)}
                r="4"
                fill="#22d3ee"
              />
            </svg>

            {/* X-Axis labels */}
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1 px-1">
              <span>{data[0]?.label}</span>
              <span>{data[Math.floor(data.length / 2)]?.label}</span>
              <span className="text-cyan-400 font-bold">{data[data.length - 1]?.label}</span>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-cyan-400 font-mono">
              <span className="w-2.5 h-0.5 bg-cyan-400" /> Temperature (°C)
            </span>
            <span className="flex items-center gap-1.5 text-blue-400 font-mono">
              <span className="w-2.5 h-0.5 bg-blue-400 border-b border-dashed" /> Humidity (%)
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-mono">
              <span className="w-2.5 h-0.5 bg-emerald-400" /> Gas ADS1115
            </span>
          </div>
          
        </div>
      </div>

      {/* 2. Inventory Freshness Distribution & Waste Prevention */}
      <div className="glass-panel rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <PieChartIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Freshness Health & Zero Waste
              </h3>
              <p className="text-xs text-slate-400">
               
              </p>
            </div>
          </div>

          {/* Visual Donut / Stacked Bar */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-xs text-slate-300">Inventory Condition Split</span>
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  {totalCount} Total Items Registered
                </span>
              </div>

              {/* Progress split bar */}
              <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden flex p-0.5 gap-0.5 border border-white/5">
                <div
                  className="bg-emerald-400 rounded-l-full transition-all duration-500"
                  style={{ width: `${freshPercent}%` }}
                  title={`Fresh: ${freshCount} items (${freshPercent}%)`}
                />
                <div
                  className="bg-amber-400 transition-all duration-500"
                  style={{ width: `${useSoonPercent}%` }}
                  title={`Use Soon: ${useSoonCount} items (${useSoonPercent}%)`}
                />
                <div
                  className="bg-rose-500 rounded-r-full transition-all duration-500"
                  style={{ width: `${checkFoodPercent}%` }}
                  title={`Check Food: ${checkFoodCount} items (${checkFoodPercent}%)`}
                />
              </div>
            </div>

            {/* Condition Stats */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs">
                <div className="flex items-center gap-2 text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Fresh / Normal:</span>
                </div>
                <span className="font-mono font-bold text-emerald-400">
                  {freshCount} ({freshPercent}%)
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs">
                <div className="flex items-center gap-2 text-amber-300">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Use Soon (Expiring):</span>
                </div>
                <span className="font-mono font-bold text-amber-400">
                  {useSoonCount} ({useSoonPercent}%)
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs">
                <div className="flex items-center gap-2 text-rose-300">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Check Food (Inspect):</span>
                </div>
                <span className="font-mono font-bold text-rose-400">
                  {checkFoodCount} ({checkFoodPercent}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
          <span>Waste Reduction Index:</span>
          <span className="font-mono text-emerald-400 font-bold text-sm">
            94.2% Saved
          </span>
        </div>
      </div>
    </div>
  );
};
