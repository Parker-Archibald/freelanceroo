"use client"

import { useState } from 'react';
import { Navbar } from '@/components/navbar';
import { SideNav } from '@/components/side-nav';
import { Breadcrumb } from '@/components/breadcrumb';
import { useSession } from 'next-auth/react';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <div className="relative min-h-screen">
      <Navbar onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      <SideNav isOpen={isSidebarOpen} onOpenChange={setIsSidebarOpen} />
      <main className="transition-all duration-300 ease-in-out md:pl-[var(--sidebar-width)] pt-16">
        {session && (
          <div className="container px-4 py-2">
            <Breadcrumb />
          </div>
        )}
        {children}
      </main>
    </div>
  );
}