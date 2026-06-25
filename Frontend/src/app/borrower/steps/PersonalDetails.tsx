'use client';
import { useState } from 'react';
import api from '@/lib/api';
import { clientBRE } from '@/lib/bre';

interface Props { onNext: () => void; }

export default function PersonalDetailsStep({ onNext }: Props) {
  const [form, setForm] = useState({
    fullName: '',
    pan: '',
    dateOfBirth: '',
    monthlySalary: '',
    employmentMode: 'salaried',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [breErrors, setBreErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const update = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBreErrors([]);
    setServerError('');

    // Client-side BRE preview
    const bre = clientBRE({
      dateOfBirth: form.dateOfBirth,
      monthlySalary: Number(form.monthlySalary),
      pan: form.pan,
      employmentMode: form.employmentMode,
    });
    if (!bre.passed) {
      setErrors(bre.errors);
      return;
    }

    setLoading(true);
    try {
      await api.post('/borrower/application/personal', {
        ...form,
        monthlySalary: Number(form.monthlySalary),
      });
      onNext();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { breErrors?: string[]; message?: string } } };
      if (axiosErr.response?.data?.breErrors) {
        setBreErrors(axiosErr.response.data.breErrors);
      } else {
        setServerError(axiosErr.response?.data?.message || 'Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Personal details</h2>
      <p className="text-sm text-gray-500 mb-6">We&apos;ll check your eligibility based on these details.</p>

      {breErrors.length > 0 && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="font-medium text-red-800 text-sm mb-2">Eligibility check failed:</p>
          <ul className="list-disc list-inside space-y-1">
            {breErrors.map((e, i) => (
              <li key={i} className="text-red-700 text-sm">{e}</li>
            ))}
          </ul>
        </div>
      )}

      {serverError && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-700 text-sm">{serverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Full name</label>
          <input className="input" placeholder="As on PAN card" value={form.fullName}
            onChange={(e) => update('fullName', e.target.value)} required />
        </div>

        <div>
          <label className="label">PAN number</label>
          <input className="input uppercase" placeholder="ABCDE1234F" maxLength={10}
            value={form.pan} onChange={(e) => update('pan', e.target.value.toUpperCase())} required />
          {errors.pan && <p className="error-text">{errors.pan}</p>}
          <p className="text-xs text-gray-400 mt-1">Format: 5 letters + 4 digits + 1 letter</p>
        </div>

        <div>
          <label className="label">Date of birth</label>
          <input type="date" className="input" value={form.dateOfBirth}
            onChange={(e) => update('dateOfBirth', e.target.value)} required />
          {errors.dateOfBirth && <p className="error-text">{errors.dateOfBirth}</p>}
          <p className="text-xs text-gray-400 mt-1">Must be between 23 and 50 years old</p>
        </div>

        <div>
          <label className="label">Monthly salary (₹)</label>
          <input type="number" className="input" placeholder="30000" min={0}
            value={form.monthlySalary} onChange={(e) => update('monthlySalary', e.target.value)} required />
          {errors.monthlySalary && <p className="error-text">{errors.monthlySalary}</p>}
          <p className="text-xs text-gray-400 mt-1">Minimum ₹25,000 per month</p>
        </div>

        <div>
          <label className="label">Employment mode</label>
          <select className="input" value={form.employmentMode}
            onChange={(e) => update('employmentMode', e.target.value)} required>
            <option value="salaried">Salaried</option>
            <option value="self-employed">Self-employed</option>
            <option value="unemployed">Unemployed</option>
          </select>
          {errors.employmentMode && <p className="error-text">{errors.employmentMode}</p>}
        </div>

        <button type="submit" className="btn-primary w-full mt-6" disabled={loading}>
          {loading ? 'Checking eligibility...' : 'Check eligibility & continue'}
        </button>
      </form>
    </div>
  );
}