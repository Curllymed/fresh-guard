import { NextResponse } from 'next/server';
import { INITIAL_TELEMETRY } from '@/lib/data';
import { SensorTelemetry } from '@/lib/types';

// In-memory telemetry cache for Raspberry Pi sensor sync
let latestTelemetry: SensorTelemetry = { ...INITIAL_TELEMETRY };

export async function GET() {
  return NextResponse.json({
    success: true,
    data: latestTelemetry,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    latestTelemetry = {
      ...latestTelemetry,
      ...body,
      lastUpdated: new Date().toLocaleTimeString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Telemetry updated successfully from Raspberry Pi 3B gateway.',
      data: latestTelemetry,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid JSON payload from sensor daemon.',
      },
      { status: 400 }
    );
  }
}
