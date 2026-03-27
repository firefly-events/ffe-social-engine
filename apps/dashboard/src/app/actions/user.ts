'use server';

import { auth, clerkClient } from '@clerk/nextjs/server';
import { BrandVoice } from '@ffe/core/src/types';
import { revalidatePath } from 'next/cache';

export async function updateBrandVoice(brandVoice: BrandVoice) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  try {
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        brandVoice,
      },
    });

    revalidatePath('/dashboard');
    revalidatePath('/profile');
    return { success: true };
  } catch (error) {
    console.error('Error updating brand voice:', error);
    throw new Error('Failed to update brand voice');
  }
}

export async function completeOnboarding(onboardingStep: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  try {
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        onboardingCompleted: true,
        onboardingStep,
      },
    });

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error completing onboarding:', error);
    throw new Error('Failed to complete onboarding');
  }
}
