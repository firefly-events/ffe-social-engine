
import { NextRequest, NextResponse } from 'next/server';

const PROMETHEUS_URL = process.env.DIRECTOR_PROMETHEUS_URL || 'http://localhost:9090';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    const response = await fetch(`${PROMETHEUS_URL}/api/v1/query?query=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error(`Prometheus API responded with status ${response.status}`);
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error proxying Prometheus request:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch from Prometheus' }, { status: 500 });
  }
}
