import { NextResponse } from 'next/server';

export async function GET() {
  const configuredKeys = {
    stripe: !!process.env.STRIPE_SECRET_KEY,
    google: !!process.env.GOOGLE_API_KEY,
    zernio: !!process.env.ZERNIO_API_KEY,
  };

  return NextResponse.json(configuredKeys);
}
