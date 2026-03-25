import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { zernio } from '../../../../lib/zernio';
import { fetchQuery } from 'convex/nextjs';
import { api } from '../../../../../../convex/_generated/api';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { content, platforms } = body;

    if (!content || !platforms || platforms.length === 0) {
      return new NextResponse("Missing content or platforms", { status: 400 });
    }

    // Get the user from Convex to get their Zernio Profile ID
    const user = await fetchQuery(api.users.getUser, { clerkId: userId });
    
    if (!user || !user.zernioProfileId) {
      return new NextResponse("Zernio profile not connected", { status: 400 });
    }

    const response = await zernio.createPost(user.zernioProfileId, content, platforms);

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Zernio Post Error:', error);
    return new NextResponse(error.message || 'Internal Server Error', { status: 500 });
  }
}
