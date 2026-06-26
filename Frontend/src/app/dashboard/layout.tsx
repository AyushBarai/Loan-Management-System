'use client'
export const dynamic = 'force-dynamic';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { UserRole } from '@/types';

const ROLE_MODULES: Record<UserRole, string[]> = {
  admin:        ['sales', 'sanction', 'disbursement', 'collection'],
  sales:        ['sales'],
  sanction:     ['sanction'],
  disbursement: ['disbursement'],
  collection:   ['collection'],
  borrower:     [],
};

const MODULE_META = {
  sales:        { label: 'Sales',        desc: 'Leads & registrations', icon: '👥', path: '/dashboard/sales' },
  sanction:     { label: 'Sanction',     desc: 'Review applications',   icon: '✅', path: '/dashboard/sanction' },
  disbursement: { label: 'Disbursement', desc: 'Release funds',         icon: '💸', path: '/dashboard/disbursement' },
  collection:   { label: 'Collection',   desc: 'Record payments',       icon: '💰', path: '/dashboard/collection' },
};

// Map path → required module key
const PATH_MODULE: Record<string, string> = {
  '/dashboard/sales':        'sales',
  '/dashboard/sanction':     'sanction',
  '/dashboard/disbursement': 'disbursement',
  '/dashboard/collection':   'collection',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    // Not logged in → login
    if (!user) { router.push('/login'); return; }

    // Borrower → borrower portal
    if (user.role === 'borrower') { router.push('/borrower'); return; }

    // RBAC: check if current path is allowed for this role
    const currentModule = PATH_MODULE[pathname];
    const allowedModules = ROLE_MODULES[user.role] || [];

    if (currentModule && !allowedModules.includes(currentModule)) {
      // Redirect to their own allowed module instead of showing 403
      const firstAllowed = allowedModules[0];
      if (firstAllowed) {
        router.replace(`/dashboard/${firstAllowed}`);
      } else {
        router.replace('/login');
      }
    }
  }, [user, isLoading, router, pathname]);

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Borrower has no dashboard access — show access denied
  if (user.role === 'borrower') return null;

  const allowedModules = ROLE_MODULES[user.role] || [];

  // Check if current page is unauthorized for this role — show 403
  const currentModule = PATH_MODULE[pathname];
  const isUnauthorized = currentModule && !allowedModules.includes(currentModule);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
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

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {allowedModules.map((mod) => {
            const meta = MODULE_META[mod as keyof typeof MODULE_META];
            const active = pathname === meta.path;
            return (
              <Link key={mod} href={meta.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}>
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
          <p className="text-xs font-medium text-gray-700 truncate">{user.name}</p>
          <p className="text-xs text-gray-400 truncate mb-3">{user.email}</p>
          <button onClick={logout} className="text-xs text-red-600 hover:underline">Sign out</button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {isUnauthorized ? (
          // 403 Forbidden page — shown briefly before useEffect redirects
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-6xl font-bold text-gray-200 mb-4">403</p>
              <p className="text-gray-700 font-semibold text-lg mb-2">Access Denied</p>
              <p className="text-gray-500 text-sm mb-6">
                Your role <span className="font-medium capitalize text-gray-700">({user.role})</span> does not have access to this module.
              </p>
              <Link href={`/dashboard/${allowedModules[0]}`}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                Go to your module →
              </Link>
            </div>
          </div>
        ) : children}
      </main>
    </div>
  );
}