'use client';

import { useEffect, useMemo, useState } from 'react';
import type {
  FoodCategory,
  FoodItem,
} from '../lib/types';

interface ThresholdMatrixEntry {
  category: FoodCategory;
  tempMin: number;
  tempMax: number;
  humidityMin: number;
  humidityMax: number;
  maxDays: number;
}

interface PendingRfid {
  event_id: string;
  timestamp: string;
  tag_uid: string;
  status: 'UNREGISTERED';
}

interface RegisterItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  thresholds: ThresholdMatrixEntry[];
  pendingRfids: PendingRfid[];
  onAddItem: (item: FoodItem) => Promise<void> | void;
}

export default function RegisterItemModal({
  isOpen,
  onClose,
  thresholds,
  pendingRfids,
  onAddItem,
}: RegisterItemModalProps) {
  const [rfidUid, setRfidUid] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] =
    useState<FoodCategory>('Dairy');
  const [quantity, setQuantity] = useState('1 Unit');
  const [storageZone, setStorageZone] =
    useState<FoodItem['storageZone']>(
      'Shelf 1 (Chilled)'
    );

  const [isSubmitting, setIsSubmitting] =
    useState(false);
  const [error, setError] = useState('');

  /*
   * Select the first pending RFID automatically
   * whenever the modal opens and pending tags exist.
   */
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setError('');

    if (pendingRfids.length > 0) {
      const stillAvailable = pendingRfids.some(
        (item) => item.tag_uid === rfidUid
      );

      if (!stillAvailable) {
        setRfidUid(
          pendingRfids[0].tag_uid
        );
      }
    } else {
      setRfidUid('');
    }
  }, [
    isOpen,
    pendingRfids,
    rfidUid,
  ]);

  /*
   * Find the threshold configuration for the
   * currently selected food category.
   */
  const selectedThreshold = useMemo(() => {
    return thresholds.find(
      (threshold) =>
        threshold.category === category
    );
  }, [thresholds, category]);

  /*
   * Calculate storage/expiry information from
   * the selected category.
   */
  const maxDays =
    selectedThreshold?.maxDays ?? 7;

  const storedDate = useMemo(() => {
    return new Date();
  }, [isOpen]);

  const storedDateStr = useMemo(() => {
    const year = storedDate.getFullYear();
    const month = String(
      storedDate.getMonth() + 1
    ).padStart(2, '0');
    const day = String(
      storedDate.getDate()
    ).padStart(2, '0');
    const hours = String(
      storedDate.getHours()
    ).padStart(2, '0');
    const minutes = String(
      storedDate.getMinutes()
    ).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}`;
  }, [storedDate]);

  const expiryDate = useMemo(() => {
    const date = new Date(storedDate);
    date.setDate(
      date.getDate() + maxDays
    );

    return date;
  }, [storedDate, maxDays]);

  const expiryStr = useMemo(() => {
    const year = expiryDate.getFullYear();
    const month = String(
      expiryDate.getMonth() + 1
    ).padStart(2, '0');
    const day = String(
      expiryDate.getDate()
    ).padStart(2, '0');

    return `${year}-${month}-${day} 23:59`;
  }, [expiryDate]);

  /*
   * Do not render the modal when it is closed.
   */
  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError('');

    if (!rfidUid) {
      setError(
        'Please select a detected RFID tag.'
      );
      return;
    }

    if (!name.trim()) {
      setError(
        'Please enter the food item name.'
      );
      return;
    }

    if (!quantity.trim()) {
      setError(
        'Please enter the quantity.'
      );
      return;
    }

    try {
      setIsSubmitting(true);

      const normalizedUid = rfidUid
        .trim()
        .toUpperCase()
        .replace(/[^A-F0-9]/g, '');

      const newItem: FoodItem = {
        id: `item-${Date.now()}`,
        rfidUid: normalizedUid,
        name: name.trim(),
        category,
        quantity: quantity.trim(),
        storageZone,
        storedDate: storedDateStr,
        expiryDate: expiryStr,
        maxStorageDays: maxDays,
        daysRemaining: maxDays,
        status: 'FRESH',
        storageDurationHours: 0,
        lastInspectionNote:
          'Initial registration via RFID-RC522 scanner.',
      };

      await onAddItem(newItem);

      /*
       * Only reset and close after the dashboard
       * successfully registers the item.
       */
      setRfidUid('');
      setName('');
      setQuantity('1 Unit');
      setCategory('Dairy');
      setStorageZone(
        'Shelf 1 (Chilled)'
      );
      setError('');

      onClose();
    } catch (err) {
      console.error(
        '[RegisterItemModal] Registration failed:',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to register food item.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
  <div className="my-4 flex max-h-[calc(100vh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0d1117] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Register Food Item
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Register a detected RFID tag with
              food storage details.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto space-y-6 p-6"
        >
          {/* RFID */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              RFID Tag
            </label>

            {pendingRfids.length === 0 ? (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v4m0 4h.01M10.29 3.86l-8.18 14A2 2 0 003.84 21h16.32a2 2 0 001.73-3.14l-8.18-14a2 2 0 00-3.42 0z"
                      />
                    </svg>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-amber-300">
                      No unregistered RFID tags detected
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      Place a new RFID tag near the
                      RC522 reader. The detected UID
                      will appear here automatically.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <select
                  value={rfidUid}
                  onChange={(event) =>
                    setRfidUid(
                      event.target.value
                    )
                  }
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-white/10 bg-[#080b10] px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">
                    Select detected RFID tag
                  </option>

                  {pendingRfids.map(
                    (pending) => (
                      <option
                        key={pending.tag_uid}
                        value={pending.tag_uid}
                      >
                        {pending.tag_uid}
                      </option>
                    )
                  )}
                </select>

                <p className="mt-2 text-xs text-slate-500">
                  {pendingRfids.length}{' '}
                  unregistered tag
                  {pendingRfids.length === 1
                    ? ''
                    : 's'}{' '}
                  detected.
                </p>
              </>
            )}
          </div>

          {/* Food Name */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Food Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="e.g. Fresh Milk"
              disabled={isSubmitting}
              className="w-full rounded-xl border border-white/10 bg-[#080b10] px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Category + Quantity */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Category
              </label>

              <select
                value={category}
                onChange={(event) =>
                  setCategory(
                    event.target.value as FoodCategory
                  )
                }
                disabled={isSubmitting}
                className="w-full rounded-xl border border-white/10 bg-[#080b10] px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="Dairy">
                  Dairy
                </option>

                <option value="Meat & Poultry">
                  Meat & Poultry
                </option>

                <option value="Seafood">
                  Seafood
                </option>

                <option value="Fresh Produce">
                  Fresh Produce
                </option>

                <option value="Leftovers & Cooked">
                  Leftovers & Cooked
                </option>

                <option value="Beverages">
                  Beverages
                </option>

                <option value="Bakery & Sweets">
                  Bakery & Sweets
                </option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Quantity
              </label>

              <input
                type="text"
                value={quantity}
                onChange={(event) =>
                  setQuantity(
                    event.target.value
                  )
                }
                placeholder="e.g. 1 Bottle"
                disabled={isSubmitting}
                className="w-full rounded-xl border border-white/10 bg-[#080b10] px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          {/* Storage Zone */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Storage Zone
            </label>

            <select
              value={storageZone}
              onChange={(event) =>
                setStorageZone(
                  event.target.value as FoodItem['storageZone']
                )
              }
              disabled={isSubmitting}
              className="w-full rounded-xl border border-white/10 bg-[#080b10] px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="Shelf 1 (Chilled)">
                Shelf 1 (Chilled)
              </option>

              <option value="Shelf 2 (Main)">
                Shelf 2 (Main)
              </option>

              <option value="Crisper Drawer">
                Crisper Drawer
              </option>

              <option value="Door Rack">
                Door Rack
              </option>
            </select>
          </div>

          {/* Threshold Preview */}
          {selectedThreshold && (
            <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-medium text-emerald-300">
                  Storage Threshold
                </h3>

                <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                  {maxDays} days
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
                <div>
                  <p className="text-slate-500">
                    Temperature
                  </p>

                  <p className="mt-1 font-medium text-slate-200">
                    {selectedThreshold.tempMin}
                    °C – {selectedThreshold.tempMax}
                    °C
                  </p>
                </div>

                <div>
                  <p className="text-slate-500">
                    Humidity
                  </p>

                  <p className="mt-1 font-medium text-slate-200">
                    {selectedThreshold.humidityMin}
                    % – {selectedThreshold.humidityMax}
                    %
                  </p>
                </div>

                <div>
                  <p className="text-slate-500">
                    Stored
                  </p>

                  <p className="mt-1 font-medium text-slate-200">
                    {storedDateStr}
                  </p>
                </div>

                <div>
                  <p className="text-slate-500">
                    Expires
                  </p>

                  <p className="mt-1 font-medium text-slate-200">
                    {expiryStr}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
              <p className="text-sm text-red-300">
                {error}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                isSubmitting ||
                pendingRfids.length === 0 ||
                !rfidUid
              }
              className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isSubmitting
                ? 'Registering...'
                : 'Register Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}