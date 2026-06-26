'use client'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { Loan } from '@/types'
import { formatCurrency } from '@/lib/bre'

export default function DisbursementPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState<string | null>(null)

  const fetchLoans = () => {
    api.get('/executive/loans?status=sanctioned')
      .then(res => setLoans(res.data.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!user) return
    if (!['admin', 'disbursement'].includes(user.role)) { router.push('/dashboard'); return }
    fetchLoans()
  }, [user, router])

  const disburse = async (loanId: string) => {
    if (!confirm('Confirm disbursement? This will release funds to the borrower.')) return
    setSubmitting(loanId)
    try {
      await api.patch(`/executive/loans/${loanId}/disburse`)
      fetchLoans()
    } catch (err: unknown) {
      alert((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Disbursal failed')
    } finally {
      setSubmitting(null)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Disbursement — Release Funds</h1>
        <p className="text-gray-500 mt-1">Sanctioned loans awaiting fund release</p>
      </div>

      {loading ? (
        <div className="card text-center text-gray-400 py-12">Loading...</div>
      ) : loans.length === 0 ? (
        <div className="card text-center text-gray-400 py-12">
          <p className="text-4xl mb-3">💸</p>
          <p className="font-medium">No sanctioned loans pending disbursement</p>
        </div>
      ) : (
        <div className="space-y-4">
          {loans.map(loan => {
            const app = loan.applicationId as { fullName?: string; pan?: string }
            const borrower = loan.userId as { name?: string; email?: string }
            return (
              <div key={loan._id} className="card flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{app?.fullName || borrower?.name}</h3>
                    <span className="badge bg-yellow-100 text-yellow-700">Sanctioned</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">{borrower?.email} · PAN: {app?.pan}</p>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">Principal</p>
                      <p className="font-bold text-blue-700">{formatCurrency(loan.principal)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">Tenure</p>
                      <p className="font-semibold">{loan.tenureDays} days</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">Total Repayment</p>
                      <p className="font-bold text-gray-900">{formatCurrency(loan.totalRepayment)}</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => disburse(loan._id)}
                  disabled={submitting === loan._id}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors whitespace-nowrap">
                  {submitting === loan._id ? 'Processing...' : '💸 Disburse'}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}