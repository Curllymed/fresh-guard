import { NextResponse } from 'next/server';
import { INITIAL_THRESHOLDS } from '@/lib/data';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: INITIAL_THRESHOLDS,
  });
}
