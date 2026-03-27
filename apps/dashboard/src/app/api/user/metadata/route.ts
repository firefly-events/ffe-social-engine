import { auth, clerkClient } from '@clerk/nextjs/server';
import { UserPublicMetadata } from '@ffe/core/types';

export async function PATCH(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const { publicMetadata } = await req.json() as { publicMetadata: UserPublicMetadata };

    if (!publicMetadata) {
      return new Response('Missing publicMetadata', { status: 400 });
    }

    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata,
    });

    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Error updating user metadata:', error);
    return new Response('Error updating user metadata', { status: 500 });
  }
}
