import React from 'react';
import ClientLayout from './ClientLayout';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <ClientLayout>{children}</ClientLayout>;
}
