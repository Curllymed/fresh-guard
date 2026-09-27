import { NextResponse } from 'next/server';

let lastScannedTag: { uid: string; timestamp: string } | null = null;

export async function GET() {
  return NextResponse.json({
    success: true,
    lastScannedTag,
  });
}

export async function POST(request: Request) {
  try {
    const { rfidUid } = await request.json();
    if (!rfidUid) {
      return NextResponse.json(
        { success: false, error: 'rfidUid is required' },
        { status: 400 }
      );
    }

    lastScannedTag = {
      uid: rfidUid,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: `RFID Tag ${rfidUid} recorded via SPI RC522.`,
      data: lastScannedTag,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Malformed request' },
      { status: 400 }
    );
  }
}
