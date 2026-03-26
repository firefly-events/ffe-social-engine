'use server';

import { auth } from '@clerk/nextjs/server';
import { zernio } from '../../lib/zernio';
import { fetchQuery } from 'convex/nextjs';
import { api } from '@convex/_generated/api';

export async function postToSocial(content: string, platforms: string[]) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await fetchQuery(api.users.getUser, { clerkId: userId });
  if (!user || !user.zernioProfileId) {
    throw new Error("Zernio profile not connected");
  }

  const response = await zernio.createPost(user.zernioProfileId, content, platforms);
  return response;
}

export async function getAnalytics(postId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const response = await zernio.getAnalytics(postId);
  return response;
}

export async function getUserAccounts() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await fetchQuery(api.users.getUser, { clerkId: userId });
  if (!user || !user.zernioProfileId) {
    return { accounts: [] };
  }

  const response = await zernio.getAccounts(user.zernioProfileId);
  return response;
}
