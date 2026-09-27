'use client';

import React, { useState } from 'react';
import {
  Sliders,
  X,
  Save,
  ShieldCheck,
  Thermometer
} from 'lucide-react';
import { ThresholdMatrixEntry } from '@/lib/types';

interface ThresholdMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  thresholds: ThresholdMatrixEntry[];
  onSaveThresholds: (updated: ThresholdMatrixEntry[]) => void;
}

export const ThresholdMatrixModal: React.FC<ThresholdMatrixModalProps> = ({
  isOpen,
  onClose,
  thresholds,
  onSaveThresholds,
}) => {
  const [data, setData] = useState<ThresholdMatrixEntry[]>(thresholds);
  const [activeCategory, setActiveCategory] = useState<string>(thresholds[0]?.category || 'Dairy');

  if (!isOpen) return null;

  const current = data.find((d) => d.category === activeCategory) || data[0];

  const handleUpdate = (field: keyof ThresholdMatrixEntry, value: number | string) => {
    setData((prev) =>
      prev.map((item) =>
        item.category === activeCategory ? { ...item, [field]: value } : item
      )
    );
  };

  const handleSave = () => {
    onSaveThresholds(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="w-full max-w-4xl glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide">
                Food Threshold Matrix Configuration
              </h2>
              <p className="text-xs text-slate-400">
                SRS §1.6.xi • Predefined safe limits for Multi-Factor Freshness Engine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Selector Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 border-b border-white/5">
          {data.map((t) => (
            <button
              key={t.category}
              onClick={() => setActiveCategory(t.category)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === t.category
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-white/5'
              }`}
            >
              {t.category}
            </button>
          ))}
        </div>

        {/* Category Details & Config Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950/40 p-5 rounded-2xl border border-white/5">
          {/* Left Column: Numeric Thresholds */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
              <Thermometer className="w-4 h-4" /> Environmental Tolerances
            </h3>

            {/* Temperature Min & Max */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 font-mono block mb-1">
                  Min Safe Temp (°C)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={current.tempMin}
                  onChange={(e) => handleUpdate('tempMin', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-white font-mono text-xs focus:border-cyan-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 font-mono block mb-1">
                  Max Safe Temp (°C)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={current.tempMax}
                  onChange={(e) => handleUpdate('tempMax', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-white font-mono text-xs focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Humidity Min & Max */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 font-mono block mb-1">
                  Min Humidity (%)
                </label>
                <input
                  type="number"
                  value={current.humidityMin}
                  onChange={(e) => handleUpdate('humidityMin', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-white font-mono text-xs focus:border-cyan-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 font-mono block mb-1">
                  Max Humidity (%)
                </label>
                <input
                  type="number"
                  value={current.humidityMax}
                  onChange={(e) => handleUpdate('humidityMax', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-white font-mono text-xs focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Storage Duration & Gas Multiplier */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 font-mono block mb-1">
                  Max Storage (Days)
                </label>
                <input
                  type="number"
                  value={current.maxDays}
                  onChange={(e) => handleUpdate('maxDays', parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-white font-mono text-xs focus:border-cyan-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 font-mono block mb-1">
                  Gas Alert (Ratio Rs/Ro)
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={current.gasThresholdMultiplier}
                  onChange={(e) => handleUpdate('gasThresholdMultiplier', parseFloat(e.target.value) || 1.1)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-white font-mono text-xs focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Biological Spoilage Guidance & Best Practices */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Spoilage Signs & Food Safety Notes
            </h3>

            <div>
              <label className="text-[11px] text-slate-400 font-mono block mb-1">
                Visual & Chemical Spoilage Indicators:
              </label>
              <textarea
                rows={3}
                value={current.spoilageSigns}
                onChange={(e) => handleUpdate('spoilageSigns', e.target.value)}
                className="w-full p-2.5 rounded-lg bg-slate-900 border border-white/10 text-white text-xs focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 font-mono block mb-1">
                Recommended Chamber Storage Protocol:
              </label>
              <textarea
                rows={3}
                value={current.storageGuideline}
                onChange={(e) => handleUpdate('storageGuideline', e.target.value)}
                className="w-full p-2.5 rounded-lg bg-slate-900 border border-white/10 text-white text-xs focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-white/10 pt-4">
          <p className="text-[11px] text-slate-500 italic">
            * Threshold values are calibrated prototype demo baselines (§1.6.xi).
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Save Threshold Matrix
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
