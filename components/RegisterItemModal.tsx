'use client';

import React, { useState } from 'react';
import {
  Radio,
  X,
  Plus,
  Tag
} from 'lucide-react';
import { FoodCategory, FoodItem, ThresholdMatrixEntry } from '@/lib/types';

interface RegisterItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  thresholds: ThresholdMatrixEntry[];
  onAddItem: (item: FoodItem) => void;
}

export const RegisterItemModal: React.FC<RegisterItemModalProps> = ({
  isOpen,
  onClose,
  thresholds,
  onAddItem,
}) => {
  const [rfidUid, setRfidUid] = useState('7E-44-12-BC');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<FoodCategory>('Dairy');
  const [quantity, setQuantity] = useState('1 Unit');
  const [storageZone, setStorageZone] = useState<
    'Shelf 1 (Chilled)' | 'Shelf 2 (Main)' | 'Crisper Drawer' | 'Door Rack'
  >('Shelf 1 (Chilled)');

  if (!isOpen) return null;

  const thresholdForCat = thresholds.find((t) => t.category === category) || thresholds[0];
  const maxDays = thresholdForCat?.maxDays || 5;

  const handleSimulateRfidTap = () => {
    // Generate realistic hex UID
    const hex = Array.from({ length: 4 }, () =>
      Math.floor(Math.random() * 256)
        .toString(16)
        .toUpperCase()
        .padStart(2, '0')
    ).join('-');
    setRfidUid(hex);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const now = new Date();
    const storedDateStr =
      now.toISOString().split('T')[0] +
      ' ' +
      now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const expiry = new Date(now.getTime() + maxDays * 24 * 60 * 60 * 1000);
    const expiryStr = expiry.toISOString().split('T')[0] + ' 23:59';

    const newItem: FoodItem = {
      id: `item-${Date.now()}`,
      rfidUid,
      name,
      category,
      quantity,
      storageZone,
      storedDate: storedDateStr,
      expiryDate: expiryStr,
      maxStorageDays: maxDays,
      daysRemaining: maxDays,
      status: 'FRESH',
      storageDurationHours: 0,
      lastInspectionNote: 'Initial registration via RFID-RC522 scanner.',
    };

    onAddItem(newItem);
    onClose();
    setName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-lg glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Radio className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide">
                Register Food Item via RFID-RC522
              </h2>
              <p className="text-xs text-slate-400">
               Food Container Tagging
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

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* RFID Tag UID Field with Scanner Button */}
          <div>
            <label className="text-slate-400 font-mono block mb-1 font-semibold flex items-center justify-between">
              <span>RFID Card UID :</span>
              <button
                type="button"
                onClick={handleSimulateRfidTap}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 underline font-sans cursor-pointer"
              >
                Simulate RC522 Card Tap
              </button>
            </label>
            <div className="relative">
              <Tag className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={rfidUid}
                onChange={(e) => setRfidUid(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-white/10 font-mono text-cyan-300 text-xs focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Food Name */}
          <div>
            <label className="text-slate-400 font-mono block mb-1 font-semibold">
              Food Item Name:
            </label>
            <input
              type="text"
              placeholder="e.g. Pasteurized Whole Milk, Greek Yogurt, Ribeye Steak..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-emerald-400 focus:outline-none"
            />
          </div>

          {/* Category & Quantity */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 font-mono block mb-1 font-semibold">
                Food Category:
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as FoodCategory)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-emerald-400 focus:outline-none cursor-pointer"
              >
                {thresholds.map((t) => (
                  <option key={t.category} value={t.category}>
                    {t.category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-400 font-mono block mb-1 font-semibold">
                Quantity / Container:
              </label>
              <input
                type="text"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 500ml, 250g, 1 Container"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-emerald-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Storage Zone */}
          <div>
            <label className="text-slate-400 font-mono block mb-1 font-semibold">
              Storage Zone:
            </label>
            <select
              value={storageZone}
              onChange={(e) =>
                setStorageZone(
                  e.target.value as
                    | 'Shelf 1 (Chilled)'
                    | 'Shelf 2 (Main)'
                    | 'Crisper Drawer'
                    | 'Door Rack'
                )
              }
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-emerald-400 focus:outline-none cursor-pointer"
            >
              <option value="Shelf 1 (Chilled)">Shelf 1 (Coldest / Dairy & Meat)</option>
              <option value="Shelf 2 (Main)">Shelf 2 (Main Compartment)</option>
              <option value="Crisper Drawer">Crisper Drawer (High Humidity Produce)</option>
              <option value="Door Rack">Door Rack (Beverages & Condiments)</option>
            </select>
          </div>

          {/* Threshold Matrix Preview */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-1 text-[11px] text-slate-400 font-mono">
            <div className="flex justify-between">
              <span>Threshold Shelf Life:</span>
              <span className="text-emerald-400 font-bold">{maxDays} Days</span>
            </div>
            <div className="flex justify-between">
              <span>Temp Tolerance:</span>
              <span className="text-cyan-400">
                {thresholdForCat.tempMin}°C - {thresholdForCat.tempMax}°C
              </span>
            </div>
            <div className="flex justify-between">
              <span>DS3231 Timestamp Anchor:</span>
              <span className="text-slate-300">Synchronized</span>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs hover:bg-slate-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Register to Food Guardian
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
