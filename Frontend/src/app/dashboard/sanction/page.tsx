'use client'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { Loan } from '@/types'
import { formatCurrency } from '@/lib/bre'

export default function SanctionPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoan, setActionLoan] = useState<Loan | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchLoans = () => {
    api.get('/executive/loans?status=applied')
      .then(res => setLoans(res.data.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!user) return
    if (!['admin', 'sanction'].includes(user.role)) { router.push('/dashboard'); return }
    fetchLoans()
  }, [user, router])

  const handleAction = async (action: 'approve' | 'reject') => {
    if (!actionLoan) return
    if (action === 'reject' && !rejectionReason.trim()) {
      alert('Please enter a rejection reason'); return
    }
    setSubmitting(true)
    try {
      await api.patch(`/executive/loans/${actionLoan._id}/sanction`, { action, rejectionReason })
      setActionLoan(null)
      setRejectionReason('')
      fetchLoans()
    } catch (err: unknown) {
      alert((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Action failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sanction — Loan Review</h1>
        <p className="text-gray-500 mt-1">Review and approve or reject loan applications</p>
      </div>

      {loading ? (
        <div className="card text-center text-gray-400 py-12">Loading applications...</div>
      ) : loans.length === 0 ? (
        <div className="card text-center text-gray-400 py-12">
          <p className="text-4xl mb-3">✅</p>
          <p className="font-medium">No pending applications</p>
        </div>
      ) : (
        <div className="space-y-4">
          {loans.map(loan => {
            const app = loan.applicationId as { fullName?: string; pan?: string; monthlySalary?: number; employmentMode?: string }
            const borrower = loan.userId as { name?: string; email?: string }
            return (
              <div key={loan._id} className="card">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{app?.fullName || borrower?.name}</h3>
                    <p className="text-sm text-gray-500">{borrower?.email}</p>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-1 mt-3 text-sm">
                      <span className="text-gray-500">PAN: <span className="text-gray-900 font-medium">{app?.pan}</span></span>
                      <span className="text-gray-500">Salary: <span className="text-gray-900 font-medium">{formatCurrency(app?.monthlySalary || 0)}/mo</span></span>
                      <span className="text-gray-500">Employment: <span className="text-gray-900 font-medium capitalize">{app?.employmentMode}</span></span>
                      <span className="text-gray-500">Applied: <span className="text-gray-900 font-medium">{new Date(loan.createdAt).toLocaleDateString('en-IN')}</span></span>
                      <span className="text-gray-500">Principal: <span className="text-gray-900 font-bold text-blue-700">{formatCurrency(loan.principal)}</span></span>
                      <span className="text-gray-500">Tenure: <span className="text-gray-900 font-medium">{loan.tenureDays} days</span></span>
                      <span className="text-gray-500">Interest: <span className="text-gray-900 font-medium">{formatCurrency(loan.simpleInterest)}</span></span>
                      <span className="text-gray-500">Total Repayment: <span className="text-gray-900 font-bold">{formatCurrency(loan.totalRepayment)}</span></span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button onClick={() => setActionLoan({ ...loan, _id: loan._id })}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                      Review
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Action Modal */}
      {actionLoan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Review Loan</h3>
            <p className="text-sm text-gray-500 mb-4">
              {formatCurrency(actionLoan.principal)} for {actionLoan.tenureDays} days
            </p>
            <div className="mb-4">
              <label className="label">Rejection reason (required if rejecting)</label>
              <textarea className="input resize-none" rows={3}
                placeholder="Enter reason for rejection..."
                value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => handleAction('approve')} disabled={submitting}
                className="flex-1 bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-colors">
                ✓ Approve
              </button>
              <button onClick={() => handleAction('reject')} disabled={submitting}
                className="flex-1 bg-red-600 text-white py-2.5 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition-colors">
                ✗ Reject
              </button>
              <button onClick={() => { setActionLoan(null); setRejectionReason('') }}
                className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}