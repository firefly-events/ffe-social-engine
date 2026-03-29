import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const configuredKeys = {
    stripe: !!process.env.STRIPE_SECRET_KEY,
    google: !!process.env.GOOGLE_API_KEY,
    zernio: !!process.env.ZERNIO_API_KEY,
  };

  return NextResponse.json(configuredKeys);
}
