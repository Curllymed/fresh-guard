import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const redis = Redis.fromEnv();

const PENDING_RFID_KEY = 'freshguard:pending-rfid';

const API_KEY = process.env.FRESHGUARD_API_KEY ?? '';

interface PendingRfid {
  event_id: string;
  timestamp: string;
  tag_uid: string;
  status: 'UNREGISTERED';
}

function isAuthorized(request: NextRequest): boolean {
  if (!API_KEY) {
    return false;
  }

  return request.headers.get('x-api-key') === API_KEY;
}

function normalizeUid(value: unknown): string {
  return String(value ?? '').trim();
}

function isValidPendingRfid(value: unknown): value is PendingRfid {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const item = value as Record<string, unknown>;

  return (
    typeof item.event_id === 'string' &&
    typeof item.timestamp === 'string' &&
    typeof item.tag_uid === 'string' &&
    item.tag_uid.trim().length > 0 &&
    item.status === 'UNREGISTERED'
  );
}

/**
 * GET /api/rfid/pending
 *
 * Returns all RFID tags that have been detected by the Raspberry Pi
 * but have not yet been registered as food items.
 *
 * Dashboard uses this endpoint.
 */
export async function GET() {
  try {
    const pending = await redis.hgetall<Record<string, PendingRfid>>(
      PENDING_RFID_KEY,
    );

    const items = Object.values(pending ?? {});

    items.sort((a, b) => {
      return (
        new Date(b.timestamp).getTime() -
        new Date(a.timestamp).getTime()
      );
    });

    return NextResponse.json(
      {
        success: true,
        data: items,
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      },
    );
  } catch (error) {
    console.error('[RFID pending GET]', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Unable to retrieve pending RFID tags.',
      },
      {
        status: 500,
      },
    );
  }
}

/**
 * POST /api/rfid/pending
 *
 * Raspberry Pi uses this endpoint when it detects an RFID tag
 * that is not registered in the local food-item database.
 */
export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      {
        success: false,
        error: 'Unauthorized.',
      },
      {
        status: 401,
      },
    );
  }

  try {
    const body = await request.json();

    if (!isValidPendingRfid(body)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid pending RFID payload.',
        },
        {
          status: 400,
        },
      );
    }

    const tagUid = normalizeUid(body.tag_uid);

    /*
     * Use the RFID UID as the Redis hash field.
     *
     * This automatically deduplicates repeated scans of the same
     * unregistered tag.
     */
    const pendingRfid: PendingRfid = {
      event_id: body.event_id,
      timestamp: body.timestamp,
      tag_uid: tagUid,
      status: 'UNREGISTERED',
    };

    await redis.hset(PENDING_RFID_KEY, {
      [tagUid]: pendingRfid,
    });

    return NextResponse.json({
      success: true,
      data: pendingRfid,
    });
  } catch (error) {
    console.error('[RFID pending POST]', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Unable to store pending RFID tag.',
      },
      {
        status: 500,
      },
    );
  }
}

/**
 * DELETE /api/rfid/pending?tag_uid=845404047127
 *
 * Removes an RFID UID from the pending list after registration.
 */
export async function DELETE(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      {
        success: false,
        error: 'Unauthorized.',
      },
      {
        status: 401,
      },
    );
  }

  try {
    const tagUid = normalizeUid(
      request.nextUrl.searchParams.get('tag_uid'),
    );

    if (!tagUid) {
      return NextResponse.json(
        {
          success: false,
          error: 'tag_uid is required.',
        },
        {
          status: 400,
        },
      );
    }

    await redis.hdel(PENDING_RFID_KEY, tagUid);

    return NextResponse.json({
      success: true,
      tag_uid: tagUid,
    });
  } catch (error) {
    console.error('[RFID pending DELETE]', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Unable to remove pending RFID tag.',
      },
      {
        status: 500,
      },
    );
  }
}