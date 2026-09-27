'use client';

import React, { useState } from 'react';
import {
  Radio,
  Search,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  Check,
  Tag,
  MapPin,
  XCircle,
  Plus
} from 'lucide-react';
import { FoodItem, FreshnessState, FoodCategory } from '@/lib/types';

interface FreshnessMatrixProps {
  items: FoodItem[];
  onConsumeItem: (id: string) => void;
  onInspectItem: (id: string, note: string) => void;
  onOpenRegisterModal: () => void;
}

export const FreshnessMatrix: React.FC<FreshnessMatrixProps> = ({
  items,
  onConsumeItem,
  onInspectItem,
  onOpenRegisterModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [inspectingItem, setInspectingItem] = useState<FoodItem | null>(null);
  const [inspectionNote, setInspectionNote] = useState('');

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.rfidUid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.storageZone.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'ALL' || item.category === selectedCategory;

    const matchesStatus =
      statusFilter === 'ALL' || item.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadge = (status: FreshnessState) => {
    switch (status) {
      case 'FRESH':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            FRESH / NORMAL
          </span>
        );
      case 'USE_SOON':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Clock className="w-3.5 h-3.5" />
            USE SOON
          </span>
        );
      case 'CHECK_FOOD':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5" />
            CHECK FOOD
          </span>
        );
      case 'SENSOR_FAULT':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-500/15 text-orange-400 border border-orange-500/30">
            <XCircle className="w-3.5 h-3.5" />
            SENSOR FAULT (§1.6.vii)
          </span>
        );
    }
  };

  const getCategoryColor = (category: FoodCategory) => {
    switch (category) {
      case 'Dairy':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'Meat & Poultry':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'Seafood':
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
      case 'Fresh Produce':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'Leftovers & Cooked':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      default:
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    }
  };

  const handleSaveInspection = () => {
    if (inspectingItem && inspectionNote.trim()) {
      onInspectItem(inspectingItem.id, inspectionNote);
      setInspectingItem(null);
      setInspectionNote('');
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-5 sm:p-6 space-y-6">
      {/* Top Header & Search / Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                RFID-RC522 Food Inventory & Freshness Decision Matrix
              </h2>
              <p className="text-xs text-slate-400">
                SRS §1.6.viii, §1.6.x & §1.6.xi • Multi-Factor Freshness Engine
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search Bar */}
          <div className="relative min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search item, RFID UID, zone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Category Dropdown Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900/80 border border-white/10 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            <option value="Dairy">Dairy</option>
            <option value="Meat & Poultry">Meat & Poultry</option>
            <option value="Seafood">Seafood</option>
            <option value="Fresh Produce">Fresh Produce</option>
            <option value="Leftovers & Cooked">Leftovers & Cooked</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900/80 border border-white/10 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="FRESH">Fresh / Normal</option>
            <option value="USE_SOON">Use Soon</option>
            <option value="CHECK_FOOD">Check Food</option>
            <option value="SENSOR_FAULT">Sensor Fault</option>
          </select>

          {/* Register Button */}
          <button
            onClick={onOpenRegisterModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all cursor-pointer shadow-md shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            Register Item
          </button>
        </div>
      </div>

      {/* Food Items Table */}
      <div className="overflow-x-auto rounded-xl border border-white/10 bg-slate-950/40">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-white/10 bg-slate-900/80 text-slate-400 uppercase font-mono text-[10px] tracking-wider">
              <th className="py-3 px-4">RFID UID (RC522)</th>
              <th className="py-3 px-4">Food Item & Storage Zone</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Stored Date (DS3231)</th>
              <th className="py-3 px-4">Shelf-Life Days</th>
              <th className="py-3 px-4">Freshness State (§1.6.xi)</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-sans">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  No food items matching your search criteria.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => {
                const daysPercent = Math.max(
                  0,
                  Math.min(100, (item.daysRemaining / item.maxStorageDays) * 100)
                );

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* RFID Tag */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-mono text-cyan-400">
                        <Tag className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                        <span className="font-semibold">{item.rfidUid}</span>
                      </div>
                    </td>

                    {/* Food Name & Storage Location */}
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-semibold text-white group-hover:text-emerald-400 transition-colors">
                          {item.name}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          <span>{item.storageZone}</span>
                          <span className="text-slate-600">•</span>
                          <span>{item.quantity}</span>
                        </div>
                        {item.flaggedReason && (
                          <div className="text-[10px] text-amber-400/90 font-mono mt-1">
                            ⚠ {item.flaggedReason}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getCategoryColor(
                          item.category
                        )}`}
                      >
                        {item.category}
                      </span>
                    </td>

                    {/* Storage Date */}
                    <td className="py-3 px-4 font-mono text-slate-300">
                      <div>{item.storedDate}</div>
                      <div className="text-[10px] text-slate-500">
                        Dur: {item.storageDurationHours}h
                      </div>
                    </td>

                    {/* Shelf-Life Progress */}
                    <td className="py-3 px-4 min-w-[130px]">
                      <div className="flex items-center justify-between text-[11px] mb-1 font-mono">
                        <span
                          className={
                            item.daysRemaining <= 1
                              ? 'text-rose-400 font-bold'
                              : item.daysRemaining <= 2
                              ? 'text-amber-400'
                              : 'text-slate-300'
                          }
                        >
                          {item.daysRemaining} days left
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {item.maxStorageDays}d max
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            item.daysRemaining <= 1
                              ? 'bg-rose-500'
                              : item.daysRemaining <= 2
                              ? 'bg-amber-400'
                              : 'bg-emerald-400'
                          }`}
                          style={{ width: `${daysPercent}%` }}
                        />
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4">{getStatusBadge(item.status)}</td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setInspectingItem(item);
                            setInspectionNote(item.lastInspectionNote || '');
                          }}
                          className="p-1.5 rounded-md hover:bg-slate-700/80 text-slate-400 hover:text-white transition-colors cursor-pointer"
                          title="Inspect Food Item / Add Observation Notes"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onConsumeItem(item.id)}
                          className="px-2 py-1 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/40 text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1"
                          title="Consume / Check-out Item"
                        >
                          <Check className="w-3 h-3" />
                          Consume
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Inspection Modal */}
      {inspectingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-cyan-400" />
                Physical Inspection: {inspectingItem.name}
              </h3>
              <button
                onClick={() => setInspectingItem(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="text-xs space-y-2 text-slate-300">
              <p>
                <strong className="text-slate-400">RFID Tag:</strong>{' '}
                <span className="font-mono text-cyan-400">{inspectingItem.rfidUid}</span>
              </p>
              <p>
                <strong className="text-slate-400">Storage Zone:</strong>{' '}
                {inspectingItem.storageZone}
              </p>
              <p>
                <strong className="text-slate-400">Current Freshness:</strong>{' '}
                {getStatusBadge(inspectingItem.status)}
              </p>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  Inspector Notes / Sensory Check (§1.6.xviii):
                </label>
                <textarea
                  value={inspectionNote}
                  onChange={(e) => setInspectionNote(e.target.value)}
                  placeholder="Record smell, color, package seal integrity or disposal recommendation..."
                  rows={3}
                  className="w-full p-2.5 rounded-lg bg-slate-900 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setInspectingItem(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveInspection}
                className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
              >
                Save Inspection Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
