'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

const ROLE_DEFAULT: Record<string, string> = {
  admin: '/dashboard/sales',
  sales: '/dashboard/sales',
  sanction: '/dashboard/sanction',
  disbursement: '/dashboard/disbursement',
  collection: '/dashboard/collection',
};

export default function DashboardIndex() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace(ROLE_DEFAULT[user.role] || '/auth/login');
    }
  }, [user, router]);

  return null;
}