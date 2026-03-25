
import { NextRequest, NextResponse } from 'next/server';

const LOKI_URL = process.env.DIRECTOR_LOKI_URL || 'http://localhost:3100';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.toString(); // Pass all query params to Loki

  if (!query) {
    return NextResponse.json({ error: 'Query parameters are required' }, { status: 400 });
  }

  try {
    // Loki's query endpoint is typically /loki/api/v1/query_range or /loki/api/v1/query
    // For simplicity, let's assume query_range for now, and adapt as needed.
    const response = await fetch(`${LOKI_URL}/loki/api/v1/query_range?${query}`);
    if (!response.ok) {
      throw new Error(`Loki API responded with status ${response.status}`);
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error proxying Loki request:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch from Loki' }, { status: 500 });
  }
}
