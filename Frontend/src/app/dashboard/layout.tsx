'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { UserRole } from '@/types';

// Which modules each role can access
const ROLE_MODULES: Record<UserRole, string[]> = {
  admin: ['sales', 'sanction', 'disbursement', 'collection'],
  sales: ['sales'],
  sanction: ['sanction'],
  disbursement: ['disbursement'],
  collection: ['collection'],
  borrower: [],
};

const MODULE_META = {
  sales: { label: 'Sales', desc: 'Leads & registrations', icon: '👥', path: '/dashboard/sales' },
  sanction: { label: 'Sanction', desc: 'Review applications', icon: '✅', path: '/dashboard/sanction' },
  disbursement: { label: 'Disbursement', desc: 'Release funds', icon: '💸', path: '/dashboard/disbursement' },
  collection: { label: 'Collection', desc: 'Record payments', icon: '💰', path: '/dashboard/collection' },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;
    if (!user) { router.push('/auth/login'); return; }
    if (user.role === 'borrower') { router.push('/borrower'); return; }
  }, [user, isLoading, router]);

  if (isLoading || !user) return null;

  const allowedModules = ROLE_MODULES[user.role] || [];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">₹</span>
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-900">LMS Dashboard</p>
              <p className="text-xs text-gray-500 capitalize">{user.role}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {allowedModules.map((mod) => {
            const meta = MODULE_META[mod as keyof typeof MODULE_META];
            const active = pathname === meta.path;
            return (
              <Link
                key={mod}
                href={meta.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <span>{meta.icon}</span>
                <div>
                  <p className="font-medium">{meta.label}</p>
                  <p className="text-xs opacity-70">{meta.desc}</p>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-1">{user.name}</p>
          <p className="text-xs text-gray-400 mb-3">{user.email}</p>
          <button onClick={logout} className="text-xs text-red-600 hover:underline">Sign out</button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}