'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'

const TEST_CREDS = [
  { role: 'Admin', email: 'admin@lms.com', password: 'Admin@123' },
  { role: 'Sales', email: 'sales@lms.com', password: 'Sales@123' },
  { role: 'Sanction', email: 'sanction@lms.com', password: 'Sanction@123' },
  { role: 'Disburse', email: 'disburse@lms.com', password: 'Disburse@123' },
  { role: 'Collection', email: 'collection@lms.com', password: 'Collection@123' },
  { role: 'Borrower', email: 'borrower@lms.com', password: 'Borrower@123' },
]

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
      const user = JSON.parse(localStorage.getItem('lms_user') || '{}')
      document.cookie = `lms_token=${localStorage.getItem('lms_token')}; path=/`
      router.push(user.role === 'borrower' ? '/borrower' : '/dashboard')
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg">
            <span className="text-white text-2xl font-bold">₹</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Loan Management System</h1>
          <p className="text-gray-500 mt-1">Sign in to your account</p>
        </div>
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" className="input" placeholder="••••••••"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
            {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">{error}</div>}
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            No account? <Link href="/auth/register" className="text-blue-600 hover:underline">Sign up</Link>
          </p>
        </div>
        <div className="card">
          <p className="text-xs font-semibold text-gray-600 mb-2">Quick login:</p>
          <div className="grid grid-cols-2 gap-1">
            {TEST_CREDS.map(({ role, email, password }) => (
              <button key={role} type="button"
                onClick={() => setForm({ email, password })}
                className="text-left text-xs p-1.5 rounded hover:bg-blue-50 hover:text-blue-700 transition-colors">
                <span className="font-medium">{role}:</span> {email}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}