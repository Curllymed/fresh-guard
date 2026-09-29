import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const redis = Redis.fromEnv();

const ITEMS_KEY = 'freshguard:items';
const PENDING_RFID_KEY = 'freshguard:pending-rfid';

type FoodCategory =
  | 'Dairy'
  | 'Meat & Poultry'
  | 'Seafood'
  | 'Fresh Produce'
  | 'Leftovers & Cooked'
  | 'Beverages'
  | 'Bakery & Sweets';

type FoodStatus =
  | 'FRESH'
  | 'USE_SOON'
  | 'CHECK_FOOD'
  | 'SENSOR_FAULT';

type StorageZone =
  | 'Shelf 1 (Chilled)'
  | 'Shelf 2 (Main)'
  | 'Crisper Drawer'
  | 'Door Rack';

interface FoodItem {
  id: string;
  rfidUid: string;
  name: string;
  category: FoodCategory;
  quantity: string;
  storageZone: StorageZone;
  storedDate: string;
  expiryDate: string;
  maxStorageDays: number;
  daysRemaining: number;
  status: FoodStatus;
  storageDurationHours: number;
  lastInspectionNote?: string;
  flaggedReason?: string;
}

/**
 * Format returned to the Raspberry Pi.
 *
 * We keep the dashboard fields as well as Python-compatible aliases.
 */
interface RemoteFoodItem {
  id: string;

  rfidUid: string;
  tag_uid: string;

  name: string;
  category: string;
  quantity: string;

  storageZone: string;
  storage_location: string;

  storedDate: string;
  storage_date: string;

  expiryDate: string;
  expiry_date: string | null;

  maxStorageDays: number;
  storage_duration_days: number;

  daysRemaining: number;
  status: string;

  storageDurationHours: number;
  lastInspectionNote?: string;
  flaggedReason?: string;

  manufacture_date: string;
  created_at: string;
}

interface PendingRfid {
  event_id: string;
  timestamp: string;
  tag_uid: string;
  status: 'UNREGISTERED';
}

function normalizeUid(value: string): string {
  return value
    .trim()
    .toUpperCase()
    .replace(/[^A-F0-9]/g, '');
}

function isValidFoodItem(item: unknown): item is FoodItem {
  if (!item || typeof item !== 'object') {
    return false;
  }

  const data = item as Record<string, unknown>;

  return (
    typeof data.id === 'string' &&
    typeof data.rfidUid === 'string' &&
    typeof data.name === 'string' &&
    typeof data.category === 'string' &&
    typeof data.quantity === 'string' &&
    typeof data.storageZone === 'string' &&
    typeof data.storedDate === 'string' &&
    typeof data.expiryDate === 'string' &&
    typeof data.maxStorageDays === 'number' &&
    typeof data.daysRemaining === 'number' &&
    typeof data.status === 'string' &&
    typeof data.storageDurationHours === 'number'
  );
}

function toRemoteItem(item: FoodItem): RemoteFoodItem {
  const normalizedUid = normalizeUid(item.rfidUid);

  return {
    /*
     * Dashboard identity.
     */
    id: item.id,

    /*
     * RFID identity.
     *
     * tag_uid is the field used by the Raspberry Pi.
     */
    rfidUid: normalizedUid,
    tag_uid: normalizedUid,

    name: item.name,
    category: item.category,
    quantity: item.quantity,

    storageZone: item.storageZone,
    storage_location: item.storageZone,

    storedDate: item.storedDate,
    storage_date: item.storedDate,

    expiryDate: item.expiryDate,
    expiry_date: item.expiryDate || null,

    maxStorageDays: item.maxStorageDays,
    storage_duration_days: item.maxStorageDays,

    daysRemaining: item.daysRemaining,
    status: item.status,

    storageDurationHours: item.storageDurationHours,

    lastInspectionNote: item.lastInspectionNote,
    flaggedReason: item.flaggedReason,

    /*
     * Raspberry Pi compatibility fields.
     */
    manufacture_date: item.storedDate,
    created_at: item.storedDate,
  };
}

export async function GET() {
  try {
    const stored = await redis.get<FoodItem[]>(ITEMS_KEY);

    const items = Array.isArray(stored)
      ? stored.filter(isValidFoodItem)
      : [];

    /*
     * Return a superset containing both:
     *
     * - Next.js/dashboard fields
     * - Raspberry Pi fields
     */
    const remoteItems = items.map(toRemoteItem);

    return NextResponse.json(remoteItems, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    console.error('[Items GET] Redis error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Unable to retrieve registered food items.',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();

    if (!isValidFoodItem(body)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid food item payload.',
        },
        { status: 400 }
      );
    }

    const item = body as FoodItem;

    const normalizedUid = normalizeUid(item.rfidUid);

    if (!normalizedUid) {
      return NextResponse.json(
        {
          success: false,
          error: 'RFID UID is required.',
        },
        { status: 400 }
      );
    }

    if (!item.name.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Food item name is required.',
        },
        { status: 400 }
      );
    }

    const existing = (await redis.get<FoodItem[]>(ITEMS_KEY)) ?? [];

    if (!Array.isArray(existing)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid stored item registry.',
        },
        { status: 500 }
      );
    }

    /*
     * RFID UID is the physical identity of the food tag.
     *
     * Two different dashboard item IDs cannot use the same RFID tag.
     */
    const duplicate = existing.find(
      (existingItem) =>
        normalizeUid(existingItem.rfidUid) === normalizedUid &&
        existingItem.id !== item.id
    );

    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          error: `RFID UID ${normalizedUid} is already registered to "${duplicate.name}".`,
        },
        { status: 409 }
      );
    }

    const normalizedItem: FoodItem = {
      ...item,
      rfidUid: normalizedUid,
      name: item.name.trim(),
    };

    /*
     * Update existing item or create a new item.
     */
    const index = existing.findIndex(
      (existingItem) =>
        existingItem.id === normalizedItem.id
    );

    if (index >= 0) {
      existing[index] = normalizedItem;
    } else {
      existing.push(normalizedItem);
    }

    /*
     * Save the registered food item.
     */
    await redis.set(ITEMS_KEY, existing);

    /*
     * The RFID tag is now registered.
     *
     * Remove it from the temporary pending registry.
     */
    await redis.hdel(
      PENDING_RFID_KEY,
      normalizedUid
    );

    const remoteItem = toRemoteItem(normalizedItem);

    return NextResponse.json(
      {
        success: true,
        data: normalizedItem,
        remote: remoteItem,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Items POST] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Unable to register food item.',
      },
      { status: 500 }
    );
  }
}