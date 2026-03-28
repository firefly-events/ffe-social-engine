import Link from 'next/link';
import { ReactNode } from 'react';
import { Home, Settings, Users } from 'lucide-react';
import ImpersonationBanner from '@/components/admin/ImpersonationBanner';

interface SuperAdminLayoutProps {
  children: ReactNode;
}

export default function SuperAdminLayout({ children }: SuperAdminLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <nav className="w-64 bg-gray-800 text-white p-4 space-y-4">
        <h2 className="text-2xl font-bold mb-6">Super Admin</h2>
        <ul>
          <li>
            <Link href="/super-admin" className="flex items-center space-x-2 py-2 px-3 rounded-md hover:bg-gray-700">
              <Home size={20} />
              <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link href="/super-admin/tiers" className="flex items-center space-x-2 py-2 px-3 rounded-md hover:bg-gray-700">
              <Settings size={20} />
              <span>Tiers</span>
            </Link>
          </li>
          <li>
            <Link href="/super-admin/users" className="flex items-center space-x-2 py-2 px-3 rounded-md hover:bg-gray-700">
              <Users size={20} />
              <span>Users</span>
            </Link>
          </li>
        </ul>
      </nav>
      <div className="flex-1 p-8">
        {children}
      </div>
    </div>
  );
}
