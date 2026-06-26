'use client'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { Loan, Payment } from '@/types'
import { formatCurrency } from '@/lib/bre'

interface PaymentForm {
  utrNumber: string
  amount: string
  paymentDate: string
}

export default function CollectionPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [paymentForm, setPaymentForm] = useState<PaymentForm>({ utrNumber: '', amount: '', paymentDate: new Date().toISOString().split('T')[0] })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const fetchLoans = () => {
    api.get('/executive/loans?status=disbursed')
      .then(res => setLoans(res.data.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!user) return
    if (!['admin', 'collection'].includes(user.role)) { router.push('/dashboard'); return }
    fetchLoans()
  }, [user, router])

  const openLoan = async (loan: Loan) => {
    setSelectedLoan(loan)
    setError('')
    setPaymentForm({ utrNumber: '', amount: '', paymentDate: new Date().toISOString().split('T')[0] })
    const res = await api.get(`/executive/loans/${loan._id}/payments`)
    setPayments(res.data.data)
  }

  const submitPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedLoan) return
    setError('')
    setSubmitting(true)
    try {
      const res = await api.post(`/executive/loans/${selectedLoan._id}/payment`, {
        utrNumber: paymentForm.utrNumber,
        amount: Number(paymentForm.amount),
        paymentDate: paymentForm.paymentDate,
      })
      // Refresh loan data
      const updatedLoan = res.data.data.loan
      setSelectedLoan(updatedLoan)
      setPayments(prev => [res.data.data.payment, ...prev])
      setPaymentForm({ utrNumber: '', amount: '', paymentDate: new Date().toISOString().split('T')[0] })
      if (updatedLoan.status === 'closed') {
        alert('🎉 Loan fully repaid and closed!')
        setSelectedLoan(null)
        fetchLoans()
      }
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Payment failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Collection — Record Payments</h1>
        <p className="text-gray-500 mt-1">Record borrower repayments for active loans</p>
      </div>

      {loading ? (
        <div className="card text-center text-gray-400 py-12">Loading...</div>
      ) : loans.length === 0 ? (
        <div className="card text-center text-gray-400 py-12">
          <p className="text-4xl mb-3">💰</p>
          <p className="font-medium">No active loans for collection</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Loan list */}
          <div className="space-y-3">
            <h2 className="font-semibold text-gray-700">Active Loans ({loans.length})</h2>
            {loans.map(loan => {
              const app = loan.applicationId as { fullName?: string }
              const borrower = loan.userId as { name?: string; email?: string }
              const progress = (loan.totalPaid / loan.totalRepayment) * 100
              return (
                <div key={loan._id}
                  onClick={() => openLoan(loan)}
                  className={`card cursor-pointer transition-all hover:shadow-md ${selectedLoan?._id === loan._id ? 'border-blue-500 ring-1 ring-blue-500' : ''}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{app?.fullName || borrower?.name}</p>
                      <p className="text-xs text-gray-500">{borrower?.email}</p>
                    </div>
                    <span className="badge bg-green-100 text-green-700">Active</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">Outstanding</span>
                    <span className="font-bold text-red-600">{formatCurrency(loan.outstandingBalance)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{Math.round(progress)}% repaid</p>
                </div>
              )
            })}
          </div>

          {/* Payment panel */}
          {selectedLoan && (
            <div className="space-y-4">
              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-3">Record Payment</h3>
                <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                  <div className="bg-blue-50 rounded-lg p-2">
                    <p className="text-xs text-blue-600">Total Repayment</p>
                    <p className="font-bold text-blue-800">{formatCurrency(selectedLoan.totalRepayment)}</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-2">
                    <p className="text-xs text-red-600">Outstanding</p>
                    <p className="font-bold text-red-700">{formatCurrency(selectedLoan.outstandingBalance)}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2">
                    <p className="text-xs text-green-600">Total Paid</p>
                    <p className="font-bold text-green-700">{formatCurrency(selectedLoan.totalPaid)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-xs text-gray-500">Principal</p>
                    <p className="font-bold text-gray-800">{formatCurrency(selectedLoan.principal)}</p>
                  </div>
                </div>

                <form onSubmit={submitPayment} className="space-y-3">
                  <div>
                    <label className="label">UTR Number <span className="text-red-500">*</span></label>
                    <input className="input uppercase" placeholder="UNIQUE TRANSACTION REF"
                      value={paymentForm.utrNumber}
                      onChange={e => setPaymentForm(f => ({ ...f, utrNumber: e.target.value.toUpperCase() }))} required />
                    <p className="text-xs text-gray-400 mt-1">Must be unique across all payments</p>
                  </div>
                  <div>
                    <label className="label">Amount (₹) <span className="text-red-500">*</span></label>
                    <input type="number" className="input" placeholder="Enter amount"
                      min={1} max={selectedLoan.outstandingBalance}
                      value={paymentForm.amount}
                      onChange={e => setPaymentForm(f => ({ ...f, amount: e.target.value }))} required />
                    <p className="text-xs text-gray-400 mt-1">Max: {formatCurrency(selectedLoan.outstandingBalance)}</p>
                  </div>
                  <div>
                    <label className="label">Payment Date <span className="text-red-500">*</span></label>
                    <input type="date" className="input"
                      value={paymentForm.paymentDate}
                      onChange={e => setPaymentForm(f => ({ ...f, paymentDate: e.target.value }))} required />
                  </div>
                  {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">{error}</div>}
                  <button type="submit" className="btn-primary w-full" disabled={submitting}>
                    {submitting ? 'Recording...' : 'Record Payment'}
                  </button>
                </form>
              </div>

              {/* Payment history */}
              {payments.length > 0 && (
                <div className="card">
                  <h3 className="font-semibold text-gray-900 mb-3">Payment History</h3>
                  <div className="space-y-2">
                    {payments.map(p => (
                      <div key={p._id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 text-sm">
                        <div>
                          <p className="font-mono text-xs text-gray-500">{p.utrNumber}</p>
                          <p className="text-xs text-gray-400">{new Date(p.paymentDate).toLocaleDateString('en-IN')}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">{formatCurrency(p.amount)}</p>
                          <p className="text-xs text-gray-400">Balance: {formatCurrency(p.balanceAfter)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}