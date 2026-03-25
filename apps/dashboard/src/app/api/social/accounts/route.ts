import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { zernio } from '../../../../lib/zernio';
import { fetchQuery } from 'convex/nextjs';
import { api } from '../../../../../convex/_generated/api';

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await fetchQuery(api.users.getUser, { clerkId: userId });
    
    if (!user || !user.zernioProfileId) {
      return NextResponse.json({ accounts: [] });
    }

    const response = await zernio.getAccounts(user.zernioProfileId);

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Zernio Accounts Error:', error);
    return new NextResponse(error.message || 'Internal Server Error', { status: 500 });
  }
}
