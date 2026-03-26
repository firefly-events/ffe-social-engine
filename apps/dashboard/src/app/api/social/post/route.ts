import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { zernio } from '../../../../lib/zernio';
import { fetchQuery } from 'convex/nextjs';
import { api } from '../../../../../convex/_generated/api';

export async function POST(req: Request) {
  try {
    const { userId, has } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!has({ feature: 'direct_posting' })) {
      return NextResponse.json({ error: 'Upgrade to Pro to use direct posting' }, { status: 402 });
    }

    const body = await req.json();
    const { content, platforms } = body;

    if (!content || !platforms || platforms.length === 0) {
      return NextResponse.json({ error: 'Missing content or platforms' }, { status: 400 });
    }

    // Get the user from Convex to get their Zernio Profile ID
    const user = await fetchQuery(api.users.getUser, { clerkId: userId });

    if (!user || !user.zernioProfileId) {
      return NextResponse.json({ error: 'Zernio profile not connected' }, { status: 400 });
    }

    const response = await zernio.createPost(user.zernioProfileId, content, platforms);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Zernio Post Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
