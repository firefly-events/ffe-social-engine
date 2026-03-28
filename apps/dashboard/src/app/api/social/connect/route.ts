import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { zernio } from '../../../../lib/zernio';
import { convexClient as convex } from '../../../../lib/convex-client';
import { api } from '@convex/_generated/api';

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // This is a conceptual flow. The actual Zernio client might need more details.
    // Assuming connectAccount creates a profile and returns an ID.
    const zernioResponse = await zernio.connectAccount(userId);
    const zernioProfileId = zernioResponse.profileId; // Assuming this is the shape of the response

    if (!zernioProfileId) {
      throw new Error('Failed to get Zernio profile ID from connection response.');
    }

    // Store the zernioProfileId in Convex
    await convex.mutation(api.users.updateZernioProfileId, {
      clerkId: userId,
      zernioProfileId: zernioProfileId,
    });

    // After connecting the main profile, we might need to fetch accounts
    // and store them in our `socialAccounts` table. This part of the flow
    // is not fully clear from the prompt, but it is a likely next step.
    const accounts = await zernio.getAccounts(zernioProfileId);

    // You would typically loop through these and upsert them into your DB
    // For now, just return them to the client.
    
    return NextResponse.json({ success: true, accounts });
  } catch (error) {
    console.error('Zernio Connect Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
