'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Loan, LoanStatus } from '@/types';
import { formatCurrency } from '@/lib/bre';

const STATUS_STEPS: LoanStatus[] = ['applied', 'sanctioned', 'disbursed', 'closed'];

const STATUS_INFO: Record<LoanStatus, { label: string; color: string; desc: string }> = {
  applied:    { label: 'Applied',    color: 'bg-blue-100 text-blue-800',    desc: 'Your application is under review by our sanction team.' },
  sanctioned: { label: 'Sanctioned', color: 'bg-yellow-100 text-yellow-800', desc: 'Congratulations! Your loan is approved and awaiting disbursement.' },
  rejected:   { label: 'Rejected',   color: 'bg-red-100 text-red-800',      desc: 'Unfortunately your application was not approved.' },
  disbursed:  { label: 'Disbursed',  color: 'bg-green-100 text-green-800',  desc: 'Funds have been released to your account. Please repay on time.' },
  closed:     { label: 'Closed',     color: 'bg-gray-100 text-gray-800',    desc: 'Loan fully repaid. Thank you!' },
};

const STEP_LABELS = ['Applied', 'Sanctioned', 'Disbursed', 'Closed'];

export default function StatusStep() {
  const [loan, setLoan] = useState<Loan | null>(null);
  const [application, setApplication] = useState<{ breApproved?: boolean; breFailedRules?: string[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch loan status
    api.get('/borrower/loans/my').then((res) => {
      const loans = res.data.data;
      if (loans?.length > 0) setLoan(loans[0]);
    }).catch(() => {});

    // Fetch application (to show BRE errors if failed)
    api.get('/borrower/application').then((res) => {
      if (res.data.data) setApplication(res.data.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="card text-center py-12">
        <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-gray-500">Loading your application...</p>
      </div>
    );
  }

  // BRE failed — show clear error state
  if (application && !application.breApproved && application.breFailedRules?.length) {
    return (
      <div className="space-y-4">
        <div className="card border-red-200 bg-red-50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-xl">✗</div>
            <div>
              <h2 className="font-semibold text-red-900">Eligibility Check Failed</h2>
              <p className="text-sm text-red-600">Your application did not meet our lending criteria.</p>
            </div>
          </div>
          <div className="bg-white border border-red-200 rounded-lg p-4">
            <p className="text-sm font-medium text-red-800 mb-3">Reasons for rejection:</p>
            <ul className="space-y-2">
              {application.breFailedRules.map((rule, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-red-700">
                  <span className="mt-0.5 text-red-400 flex-shrink-0">•</span>
                  {rule}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="font-medium">What can you do?</span> You may re-apply once you meet the eligibility criteria:
              age 23–50, monthly salary ≥ ₹25,000, valid PAN, and salaried or self-employed status.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // No loan yet (shouldn't happen at step 4, but safety net)
  if (!loan) {
    return (
      <div className="card text-center py-12">
        <p className="text-4xl mb-3">📋</p>
        <p className="text-gray-600 font-medium">No loan application found.</p>
        <p className="text-sm text-gray-400 mt-1">Please complete the previous steps.</p>
      </div>
    );
  }

  const info = STATUS_INFO[loan.status];
  const stepIdx = STATUS_STEPS.indexOf(loan.status as LoanStatus);
  const isRejected = loan.status === 'rejected';
  const repaymentPct = loan.totalRepayment > 0
    ? Math.min(100, Math.round((loan.totalPaid / loan.totalRepayment) * 100))
    : 0;

  return (
    <div className="space-y-4">
      {/* Status header card */}
      <div className="card">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Your Loan Application</h2>
            <p className="text-sm text-gray-500 mt-0.5">{info.desc}</p>
          </div>
          <span className={`badge ${info.color} text-xs font-semibold px-3 py-1`}>{info.label}</span>
        </div>

        {/* Status timeline (only for non-rejected) */}
        {!isRejected && (
          <div className="relative flex items-center justify-between mb-6 px-2">
            <div className="absolute left-4 right-4 top-3.5 h-0.5 bg-gray-200 -z-0" />
            <div
              className="absolute left-4 top-3.5 h-0.5 bg-green-500 transition-all -z-0"
              style={{ width: stepIdx === 0 ? '0%' : `${(stepIdx / (STATUS_STEPS.length - 1)) * 100}%` }}
            />
            {STATUS_STEPS.map((s, i) => (
              <div key={s} className="flex flex-col items-center z-10">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                  i < stepIdx  ? 'bg-green-500 border-green-500 text-white' :
                  i === stepIdx ? 'bg-white border-blue-500 text-blue-600' :
                                  'bg-white border-gray-300 text-gray-400'
                }`}>
                  {i < stepIdx ? '✓' : i + 1}
                </div>
                <span className={`mt-1.5 text-xs font-medium ${i <= stepIdx ? 'text-blue-600' : 'text-gray-400'}`}>
                  {STEP_LABELS[i]}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Rejected reason */}
        {isRejected && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-sm font-semibold text-red-800 mb-1">Rejection Reason:</p>
            <p className="text-sm text-red-700">{loan.rejectionReason || 'No reason provided.'}</p>
          </div>
        )}

        {/* Loan details grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Principal',         value: formatCurrency(loan.principal),      highlight: false },
            { label: 'Tenure',            value: `${loan.tenureDays} days`,           highlight: false },
            { label: 'Interest (12% p.a.)', value: formatCurrency(loan.simpleInterest), highlight: false },
            { label: 'Total Repayment',   value: formatCurrency(loan.totalRepayment), highlight: true  },
            { label: 'Amount Paid',       value: formatCurrency(loan.totalPaid),       highlight: false },
            { label: 'Outstanding',       value: formatCurrency(loan.outstandingBalance), highlight: loan.outstandingBalance > 0 },
          ].map(({ label, value, highlight }) => (
            <div key={label} className={`rounded-lg p-3 ${highlight ? 'bg-blue-50' : 'bg-gray-50'}`}>
              <p className="text-xs text-gray-500 mb-0.5">{label}</p>
              <p className={`font-semibold ${highlight ? 'text-blue-700' : 'text-gray-900'}`}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Repayment progress (disbursed only) */}
      {loan.status === 'disbursed' && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3">Repayment Progress</h3>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-500">Paid so far</span>
            <span className="font-medium text-green-700">{repaymentPct}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
            <div
              className="bg-green-500 h-3 rounded-full transition-all"
              style={{ width: `${repaymentPct}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>{formatCurrency(loan.totalPaid)} paid</span>
            <span>{formatCurrency(loan.outstandingBalance)} remaining</span>
          </div>
        </div>
      )}

      {/* Closed celebration */}
      {loan.status === 'closed' && (
        <div className="card bg-green-50 border-green-200 text-center py-6">
          <p className="text-4xl mb-2">🎉</p>
          <p className="font-semibold text-green-800">Loan Fully Repaid!</p>
          <p className="text-sm text-green-600 mt-1">
            You have successfully repaid {formatCurrency(loan.totalRepayment)}. Your loan is now closed.
          </p>
        </div>
      )}
    </div>
  );
}