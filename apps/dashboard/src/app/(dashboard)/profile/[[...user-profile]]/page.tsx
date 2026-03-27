'use client';

import { UserProfile } from '@clerk/nextjs';
import { Mic, Settings, BarChart3 } from 'lucide-react';
import BrandVoicePage from '@/components/profile/BrandVoicePage';
import PreferencesPage from '@/components/profile/PreferencesPage';
import UsagePage from '@/components/profile/UsagePage';

export default function ProfilePage() {
  return (
    <div className="flex items-center justify-center -m-8 min-h-[calc(100vh-64px)] bg-gray-50/50 dark:bg-gray-950/20">
      <UserProfile 
        path="/profile" 
        routing="path"
        appearance={{
          elements: {
            rootBox: "w-full shadow-none",
            card: "w-full shadow-lg border border-gray-100 dark:border-gray-800",
            navbar: "border-r border-gray-100 dark:border-gray-800",
            pageScrollBox: "p-0 h-auto",
            scrollBox: "rounded-none"
          }
        }}
      >
        <UserProfile.Page 
          label="Brand Voice" 
          url="brand-voice" 
          labelIcon={<Mic className="w-4 h-4" />}
        >
          <div className="p-8">
            <BrandVoicePage />
          </div>
        </UserProfile.Page>

        <UserProfile.Page 
          label="Preferences" 
          url="preferences" 
          labelIcon={<Settings className="w-4 h-4" />}
        >
          <div className="p-8">
            <PreferencesPage />
          </div>
        </UserProfile.Page>

        <UserProfile.Page 
          label="Usage" 
          url="usage" 
          labelIcon={<BarChart3 className="w-4 h-4" />}
        >
          <div className="p-8">
            <UsagePage />
          </div>
        </UserProfile.Page>
      </UserProfile>
    </div>
  );
}
