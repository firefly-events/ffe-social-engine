import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { listConnections } from '@ffe/db';

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const connections = await listConnections(userId);
    return NextResponse.json(connections);
  } catch (error) {
    console.error('Failed to list connections:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
