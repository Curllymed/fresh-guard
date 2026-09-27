'use client';

import React, { useState } from 'react';
import {
  Bell,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  Trash2,
  Check,
  ArrowRight
} from 'lucide-react';
import { Alert } from '@/lib/types';

interface AlertsViewProps {
  alerts: Alert[];
  onResolveAlert: (id: string) => void;
  onClearAll: () => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  alerts,
  onResolveAlert,
  onClearAll,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'UNRESOLVED' | 'CRITICAL'>('ALL');

  const filtered = alerts.filter((a) => {
    if (filter === 'UNRESOLVED') return !a.resolved;
    if (filter === 'CRITICAL') return a.level === 'CRITICAL';
    return true;
  });

  const getAlertIcon = (level: Alert['level']) => {
    switch (level) {
      case 'CRITICAL':
        return <AlertTriangle className="w-5 h-5 text-rose-400" />;
      case 'WARNING':
        return <AlertCircle className="w-5 h-5 text-amber-400" />;
      case 'RECOMMENDATION':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case 'INFO':
      default:
        return <Info className="w-5 h-5 text-cyan-400" />;
    }
  };

  const getAlertBorder = (level: Alert['level']) => {
    switch (level) {
      case 'CRITICAL':
        return 'border-rose-500/40 bg-rose-500/5 hover:border-rose-500/60';
      case 'WARNING':
        return 'border-amber-500/40 bg-amber-500/5 hover:border-amber-500/60';
      case 'RECOMMENDATION':
        return 'border-emerald-500/40 bg-emerald-500/5 hover:border-emerald-500/60';
      case 'INFO':
      default:
        return 'border-cyan-500/30 bg-cyan-500/5 hover:border-cyan-500/50';
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-wide">
              Threshold Alerts & Smart Recommendations Center
            </h2>
            <p className="text-xs text-slate-400">
              SRS §1.6.xii & §1.6.xviii • Local & Remote Proactive Notification Log
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter options */}
          <div className="flex items-center bg-slate-900/80 p-1 rounded-lg border border-white/5 text-xs font-medium">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-2.5 py-1 rounded cursor-pointer ${
                filter === 'ALL' ? 'bg-slate-700 text-white' : 'text-slate-400'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('UNRESOLVED')}
              className={`px-2.5 py-1 rounded cursor-pointer ${
                filter === 'UNRESOLVED' ? 'bg-rose-600 text-white' : 'text-slate-400'
              }`}
            >
              Unresolved
            </button>
            <button
              onClick={() => setFilter('CRITICAL')}
              className={`px-2.5 py-1 rounded cursor-pointer ${
                filter === 'CRITICAL' ? 'bg-red-600 text-white' : 'text-slate-400'
              }`}
            >
              Critical Only
            </button>
          </div>

          <button
            onClick={onClearAll}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 border border-white/5 transition-colors cursor-pointer"
            title="Clear all alerts"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Alerts list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            No active threshold alerts. Storage chamber is functioning normally.
          </div>
        ) : (
          filtered.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border transition-all ${getAlertBorder(
                alert.level
              )} ${alert.resolved ? 'opacity-50' : ''}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-slate-900/80 border border-white/5 mt-0.5">
                    {getAlertIcon(alert.level)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">
                        {alert.title}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-white/5">
                        {alert.source}
                      </span>
                      {alert.resolved && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          RESOLVED
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300">{alert.message}</p>
                    
                    {/* Action Advice per SRS §1.6.xviii */}
                    <div className="pt-2 text-xs flex items-center gap-1.5 text-emerald-400 font-medium">
                      <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                      <span>{alert.actionAdvice}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="text-[10px] font-mono text-slate-500">
                    {alert.timestamp}
                  </span>
                  {!alert.resolved && (
                    <button
                      onClick={() => onResolveAlert(alert.id)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      Acknowledge
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
