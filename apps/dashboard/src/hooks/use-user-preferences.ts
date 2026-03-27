'use client';

import { useUser } from '@clerk/nextjs';
import { UserUnsafeMetadata } from '@ffe/core/src/types';

export function useUserPreferences() {
  const { user, isLoaded, isSignedIn } = useUser();

  const preferences = (user?.unsafeMetadata || {}) as UserUnsafeMetadata;

  const updatePreferences = async (newPreferences: Partial<UserUnsafeMetadata>) => {
    if (!user) return;

    try {
      await user.update({
        unsafeMetadata: {
          ...preferences,
          ...newPreferences,
        },
      });
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  };

  return {
    preferences,
    updatePreferences,
    isLoaded,
    isSignedIn,
  };
}
