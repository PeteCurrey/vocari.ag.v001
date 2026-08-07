import { NextResponse } from 'next/server';
import { publishOccupation } from '../../../../lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { occupationId } = body;

    if (!occupationId) {
      return NextResponse.json({ success: false, error: 'occupationId is required' }, { status: 400 });
    }

    const result = publishOccupation(occupationId);
    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    const isGateViolation = error.message?.includes('TIER_A_PUBLISH_GATE_VIOLATION');
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        isGateViolation,
      },
      { status: isGateViolation ? 422 : 500 }
    );
  }
}
