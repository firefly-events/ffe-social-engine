import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { revokeToken } from '@ffe/db';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { userId } = await auth();
  const { platform } = await params;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await revokeToken(userId, platform);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Failed to disconnect ${platform}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
