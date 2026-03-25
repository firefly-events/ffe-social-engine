
import { NextRequest, NextResponse } from 'next/server';

const DIRECTOR_CONTROL_URL = process.env.DIRECTOR_CONTROL_URL || 'http://localhost:8080';

export async function POST(request: NextRequest) {
  const { command, payload } = await request.json();

  if (!command) {
    return NextResponse.json({ error: 'Command is required' }, { status: 400 });
  }

  try {
    const response = await fetch(`${DIRECTOR_CONTROL_URL}/control`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ command, payload }),
    });

    if (!response.ok) {
      throw new Error(`Director control API responded with status ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error sending control command to Director:', error);
    return NextResponse.json({ error: error.message || 'Failed to send command to Director' }, { status: 500 });
  }
}
