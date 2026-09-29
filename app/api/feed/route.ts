import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const redis = Redis.fromEnv();

const TELEMETRY_KEY = 'freshguard:telemetry';

interface RfidItemPayload {
  tag_uid: string;
  item_id: string;
  item_name: string;
  in_storage: boolean;
}

interface TelemetryPayload {
  event_id: string;
  timestamp: string;

  temperature: number;
  humidity: number;

  gas_voltage: number;
  gasRaw: number;
  gasBaseline: number;
  gasRatio: number;

  door_open: boolean;
  doorOpenSeconds: number;
  doorOpenCountToday: number;

  wifi_connected: boolean;

  ds3231Health: boolean;
  rc522Health: boolean;
  reedSwitchHealth: boolean;

  psuVoltage: number;
  piCpuTemperature: number;

  rfidItems: RfidItemPayload[];

  status: string;
  sensor_fault: boolean | string | null;
  item_count: number;
}

function isValidTelemetry(body: unknown): body is TelemetryPayload {
  if (!body || typeof body !== 'object') {
    return false;
  }

  const data = body as Record<string, unknown>;

  return (
    typeof data.event_id === 'string' &&
    typeof data.timestamp === 'string' &&
    typeof data.temperature === 'number' &&
    typeof data.humidity === 'number' &&
    typeof data.gas_voltage === 'number' &&
    typeof data.door_open === 'boolean' &&
    typeof data.wifi_connected === 'boolean' &&
    typeof data.status === 'string' &&
    (typeof data.sensor_fault === 'boolean' ||
      typeof data.sensor_fault === 'string' ||
      data.sensor_fault === null) &&
    typeof data.item_count === 'number'
  );
}

/**
 * GET /api/feed
 *
 * Dashboard -> Vercel -> Redis
 *
 * Returns the latest telemetry received from the Raspberry Pi.
 * added comment for deployment
 */
export async function GET() {
  try {
    const telemetry =
      await redis.get<TelemetryPayload>(TELEMETRY_KEY);

    return NextResponse.json({
      success: true,
      data: telemetry,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
  console.error('[Feed GET] Redis error:', error);

  return NextResponse.json(
    {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    },
    { status: 500 }
  );
}
}


/**
 * POST /api/feed
 *
 * Raspberry Pi -> Vercel -> Redis
 *
 * Receives the latest telemetry reading and stores it.
 */
export async function POST(request: Request) {
  try {
    const configuredApiKey = process.env.FRESHGUARD_API_KEY;
    const providedApiKey = request.headers.get('x-api-key');

    if (!configuredApiKey || providedApiKey !== configuredApiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized.',
        },
        { status: 401 }
      );
    }

    const body: unknown = await request.json();

    if (!isValidTelemetry(body)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid telemetry payload.',
        },
        { status: 400 }
      );
    }

    await redis.set(TELEMETRY_KEY, body);

    return NextResponse.json({
      success: true,
      message: 'Telemetry received successfully.',
      data: body,
      received_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Feed POST] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Unable to process telemetry.',
      },
      { status: 500 }
    );
  }
}
