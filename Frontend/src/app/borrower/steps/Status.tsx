'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Loan, LoanStatus } from '@/types';
import { formatCurrency } from '@/lib/bre';

const STATUS_STEPS: LoanStatus[] = ['applied', 'sanctioned', 'disbursed', 'closed'];

const STATUS_INFO: Record<LoanStatus, { label: string; color: string; desc: string }> = {
  applied: { label: 'Applied', color: 'bg-blue-100 text-blue-800', desc: 'Under review by sanction team' },
  sanctioned: { label: 'Sanctioned', color: 'bg-yellow-100 text-yellow-800', desc: 'Approved! Awaiting disbursement' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800', desc: 'Application was not approved' },
  disbursed: { label: 'Disbursed', color: 'bg-green-100 text-green-800', desc: 'Funds released to your account' },
  closed: { label: 'Closed', color: 'bg-gray-100 text-gray-800', desc: 'Loan fully repaid. Congratulations!' },
};

export default function StatusStep() {
  const [loan, setLoan] = useState<Loan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/borrower/loans/my').then((res) => {
      const loans = res.data.data;
      if (loans?.length > 0) setLoan(loans[0]);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="card text-center text-gray-500">Loading your application...</div>;
  if (!loan) return <div className="card text-center text-gray-500">No loan application found.</div>;

  const info = STATUS_INFO[loan.status];
  const stepIdx = STATUS_STEPS.indexOf(loan.status as LoanStatus);

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Your loan</h2>
          <span className={`badge ${info.color}`}>{info.label}</span>
        </div>
        <p className="text-sm text-gray-500 mb-6">{info.desc}</p>

        {loan.status !== 'rejected' && (
          <div className="flex items-center mb-6">
            {STATUS_STEPS.map((s, i) => (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                  i <= stepIdx ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-300 text-gray-400'
                }`}>
                  {i < stepIdx ? '✓' : i + 1}
                </div>
                {i < STATUS_STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 ${i < stepIdx ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        )}

        {loan.status === 'rejected' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-800 text-sm font-medium">Reason: {loan.rejectionReason}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {[
            ['Principal', formatCurrency(loan.principal)],
            ['Tenure', `${loan.tenureDays} days`],
            ['Interest (12% p.a.)', formatCurrency(loan.simpleInterest)],
            ['Total repayment', formatCurrency(loan.totalRepayment)],
            ['Amount paid', formatCurrency(loan.totalPaid)],
            ['Outstanding', formatCurrency(loan.outstandingBalance)],
          ].map(([label, value]) => (
            <div key={label} className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">{label}</p>
              <p className="font-semibold text-gray-900">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {loan.status === 'disbursed' && (
        <div className="card">
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Repayment progress</span>
              <span className="font-medium">{Math.round((loan.totalPaid / loan.totalRepayment) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${(loan.totalPaid / loan.totalRepayment) * 100}%` }}
              />
            </div>
          </div>
          <p className="text-sm text-gray-500">
            {formatCurrency(loan.outstandingBalance)} remaining to close your loan.
          </p>
        </div>
      )}
    </div>
  );
}