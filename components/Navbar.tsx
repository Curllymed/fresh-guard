'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Clock,
  Cpu,
  Bell,
  Sliders,
  FlaskConical,
  PlusCircle,
  Radio,
  AlertTriangle,
  XCircle,
  Activity
} from 'lucide-react';
import { Alert, FreshnessState } from '@/lib/types';

interface NavbarProps {
  activeTab: 'overview' | 'inventory' | 'diagnostics' | 'alerts';
  setActiveTab: (tab: 'overview' | 'inventory' | 'diagnostics' | 'alerts') => void;
  alerts: Alert[];
  overallStatus: FreshnessState;
  onOpenTestMatrix: () => void;
  onOpenThresholds: () => void;
  onOpenRegisterItem: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  alerts,
  overallStatus,
  onOpenTestMatrix,
  onOpenThresholds,
  onOpenRegisterItem,
}) => {
  const [rtcTime, setRtcTime] = useState<string>('');
  const unresolvedAlerts = alerts.filter((a) => !a.resolved);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setRtcTime(
        now.toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
        }) +
          ' • ' +
          now.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = () => {
    switch (overallStatus) {
      case 'FRESH':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            CHAMBER: FRESH / NORMAL
          </span>
        );
      case 'USE_SOON':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            CHAMBER: USE SOON
          </span>
        );
      case 'CHECK_FOOD':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5" />
            ACTION: CHECK FOOD
          </span>
        );
      case 'SENSOR_FAULT':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/15 text-orange-400 border border-orange-500/40">
            <XCircle className="w-3.5 h-3.5" />
            SENSOR FAULT 
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#090d16]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-3.5">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 shadow-lg shadow-emerald-500/20 border border-emerald-400/30">
              <ShieldCheck className="w-6 h-6 text-white" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full border-2 border-[#090d16]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  FreshGuard<span className="text-emerald-400">.IoT</span>
                </span>
                
              </div>
              
            </div>
          </div>

          {/* Center Chamber Status & RTC Timestamp */}
          <div className="hidden lg:flex items-center gap-4">
            {getStatusBadge()}

            {/* DS3231 Real-Time Clock Bar */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-900/80 border border-white/10 text-xs font-mono text-slate-300">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-400 text-[11px]">Time:</span>
              <span className="text-cyan-300 font-semibold">{rtcTime || 'Syncing...'}</span>
            </div>

            {/* Pi 3B Online Pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/20 text-xs text-emerald-300 font-mono">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span>Raspberry Pi 3</span>
            </div>
          </div>

          {/* Right Action Utilities */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Register Item */}
            <button
              onClick={onOpenRegisterItem}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold transition-all shadow-md shadow-emerald-500/25 active:scale-95 cursor-pointer"
              title="Register new food item with RFID-RC522"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden md:inline">Scan RFID Item</span>
            </button>

            {/* Threshold Matrix Modal */}
            <button
              onClick={onOpenThresholds}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-white/10 transition-colors cursor-pointer"
              title="Configure Food Threshold Matrix (§1.6.xi)"
            >
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span className="hidden xl:inline">Thresholds</span>
            </button>

            {/* IoT Test Matrix Suite */}
            {/* <button
              onClick={onOpenTestMatrix}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 border border-purple-500/30 transition-all cursor-pointer"
              title="IoT Test Matrix Evaluation Suite "
            >
              <FlaskConical className="w-4 h-4 text-purple-400" />
              <span className="hidden xl:inline">Test Matrix </span>
            </button> */}

            {/* Alert Notifications Button */}
            <button
              onClick={() => setActiveTab('alerts')}
              className="relative p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-white/10 transition-colors cursor-pointer"
              title="System Alerts & Recommendations"
            >
              <Bell className="w-4 h-4" />
              {unresolvedAlerts.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-lg">
                  {unresolvedAlerts.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center space-x-1 sm:space-x-4 border-t border-white/5 py-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Live Chamber & Sensors
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'inventory'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            RFID Inventory & Freshness 
          </button>

          <button
            onClick={() => setActiveTab('diagnostics')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'diagnostics'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            Hardware Diagnostics & Pinout 
          </button>

          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'alerts'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            Alerts & Actions ({unresolvedAlerts.length})
          </button>
        </div>
      </div>
    </header>
  );
};
