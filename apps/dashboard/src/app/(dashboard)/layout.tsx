
import { PropsWithChildren } from 'react';
import { UserButton } from '@clerk/nextjs';
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-end bg-white px-6 py-3 shadow-sm">
          <UserButton />
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
