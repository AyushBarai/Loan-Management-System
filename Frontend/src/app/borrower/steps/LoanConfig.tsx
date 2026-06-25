'use client';
import { useState } from 'react';
import api from '@/lib/api';
import { calculateLoanDetails, formatCurrency } from '@/lib/bre';

interface Props { onNext: () => void; }

export default function LoanConfigStep({ onNext }: Props) {
  const [principal, setPrincipal] = useState(100000);
  const [tenure, setTenure] = useState(90);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { simpleInterest, totalRepayment } = calculateLoanDetails(principal, tenure);

  const handleApply = async () => {
    setError('');
    setLoading(true);
    try {
      await api.post('/borrower/loans', { principal, tenureDays: tenure });
      onNext();
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Application failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Configure your loan</h2>
      <p className="text-sm text-gray-500 mb-6">Adjust the sliders — we&apos;ll calculate your repayment instantly.</p>

      {/* Principal slider */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label className="label mb-0">Loan amount</label>
          <span className="text-lg font-bold text-blue-600">{formatCurrency(principal)}</span>
        </div>
        <input
          type="range" min={50000} max={500000} step={5000}
          value={principal}
          onChange={(e) => setPrincipal(Number(e.target.value))}
          className="w-full accent-blue-600"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>₹50,000</span><span>₹5,00,000</span>
        </div>
      </div>

      {/* Tenure slider */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <label className="label mb-0">Tenure</label>
          <span className="text-lg font-bold text-blue-600">{tenure} days</span>
        </div>
        <input
          type="range" min={30} max={365} step={5}
          value={tenure}
          onChange={(e) => setTenure(Number(e.target.value))}
          className="w-full accent-blue-600"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>30 days</span><span>365 days</span>
        </div>
      </div>

      {/* Live calculation */}
      <div className="bg-blue-50 rounded-xl p-4 mb-6">
        <p className="text-sm font-medium text-blue-900 mb-3">Repayment summary</p>
        <div className="space-y-2">
          {[
            ['Principal', formatCurrency(principal)],
            ['Interest rate', '12% p.a. (fixed)'],
            ['Tenure', `${tenure} days`],
            ['Simple interest', formatCurrency(simpleInterest)],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between text-sm">
              <span className="text-blue-700">{label}</span>
              <span className="text-blue-900 font-medium">{value}</span>
            </div>
          ))}
          <div className="border-t border-blue-200 pt-2 mt-2 flex justify-between">
            <span className="font-semibold text-blue-900">Total repayment</span>
            <span className="font-bold text-blue-900 text-lg">{formatCurrency(totalRepayment)}</span>
          </div>
        </div>
        <p className="text-xs text-blue-600 mt-3">
          Formula: SI = (P × 12 × {tenure}) ÷ (365 × 100)
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <button onClick={handleApply} className="btn-primary w-full" disabled={loading}>
        {loading ? 'Submitting...' : 'Apply for loan'}
      </button>
    </div>
  );
}