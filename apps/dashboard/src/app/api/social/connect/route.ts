import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { zernio } from '../../../../lib/zernio';
import { fetchMutation, fetchQuery } from 'convex/nextjs';
import { api } from '../../../../../convex/_generated/api';
import { getPostHogServer } from '../../../../lib/posthog-server';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Call Zernio to connect account and get profile ID
    const response = await zernio.connectAccount(userId);
    const zernioProfileId = response.profileId; // Assuming it returns { profileId: '...' }

    // Save Zernio profile ID to Convex user record
    if (zernioProfileId) {
      await fetchMutation(api.users.updateZernioProfileId, {
        clerkId: userId,
        zernioProfileId,
      });
    }

    const ph = getPostHogServer()
    ph.capture({ distinctId: userId, event: 'social_connected', properties: { platform: 'zernio' } })

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Zernio Connect Error:', error);
    return new NextResponse(error.message || 'Internal Server Error', { status: 500 });
  }
}
