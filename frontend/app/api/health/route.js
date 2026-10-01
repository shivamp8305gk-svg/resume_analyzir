import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Resume Analyzir API is running',
    timestamp: new Date().toISOString(),
  });
}
