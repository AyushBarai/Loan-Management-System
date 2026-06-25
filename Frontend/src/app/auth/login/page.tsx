'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { UserRole } from '@/types';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      // Set cookie for middleware
      const user = JSON.parse(localStorage.getItem('lms_user') || '{}');
      document.cookie = `lms_token=${localStorage.getItem('lms_token')}; path=/`;
      // Route based on role
      const role: UserRole = user.role;
      if (role === 'borrower') router.push('/borrower');
      else router.push('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg">
            <span className="text-white text-2xl font-bold">₹</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Loan Management System</h1>
          <p className="text-gray-500 mt-1">Sign in to your account</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-blue-600 hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </div>

        {/* Quick login hints */}
        <div className="mt-4 card text-xs text-gray-500">
          <p className="font-medium text-gray-700 mb-2">Test credentials:</p>
          <div className="grid grid-cols-2 gap-1">
            {[
              ['Admin', 'admin@lms.com', 'Admin@123'],
              ['Sales', 'sales@lms.com', 'Sales@123'],
              ['Sanction', 'sanction@lms.com', 'Sanction@123'],
              ['Disburse', 'disburse@lms.com', 'Disburse@123'],
              ['Collection', 'collection@lms.com', 'Collection@123'],
              ['Borrower', 'borrower@lms.com', 'Borrower@123'],
            ].map(([role, email, pwd]) => (
              <button
                key={role}
                type="button"
                onClick={() => setForm({ email, password: pwd })}
                className="text-left hover:text-blue-600 transition-colors p-1 rounded"
              >
                <span className="font-medium">{role}:</span> {email}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}