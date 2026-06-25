'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import PersonalDetailsStep from './steps/PersonalDetails';
import UploadStep from './steps/Upload';
import LoanConfigStep from './steps/LoanConfig';
import StatusStep from './steps/Status';
import api from '@/lib/api';

const STEPS = [
  { id: 1, label: 'Personal details' },
  { id: 2, label: 'Salary slip' },
  { id: 3, label: 'Loan amount' },
  { id: 4, label: 'Application status' },
];

export default function BorrowerPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [applicationData, setApplicationData] = useState<{ completedSteps?: number } | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.role !== 'borrower') {
      router.push('/dashboard');
      return;
    }
    // Fetch existing application to resume progress
    api.get('/borrower/application').then((res) => {
      if (res.data.data) {
        const app = res.data.data;
        setApplicationData(app);
        const step = Math.min((app.completedSteps || 0) + 1, 4);
        setCurrentStep(step);
      }
    }).catch(() => {});
  }, [user, router]);

  const goNext = () => setCurrentStep((s) => Math.min(s + 1, 4));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">₹</span>
          </div>
          <span className="font-semibold text-gray-900">LMS Borrower Portal</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">Welcome, {user?.name}</span>
          <button onClick={logout} className="text-sm text-red-600 hover:underline">Sign out</button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Step indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 -z-0" />
            <div
              className="absolute top-4 left-0 h-0.5 bg-blue-500 transition-all -z-0"
              style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
            />
            {STEPS.map((step) => (
              <div key={step.id} className="flex flex-col items-center z-10">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-colors ${
                    currentStep > step.id
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : currentStep === step.id
                      ? 'bg-white border-blue-600 text-blue-600'
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}
                >
                  {currentStep > step.id ? '✓' : step.id}
                </div>
                <span className={`mt-2 text-xs font-medium ${currentStep >= step.id ? 'text-blue-600' : 'text-gray-400'}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Step content */}
        {currentStep === 1 && <PersonalDetailsStep onNext={goNext} />}
        {currentStep === 2 && <UploadStep onNext={goNext} />}
        {currentStep === 3 && <LoanConfigStep onNext={goNext} />}
        {currentStep === 4 && <StatusStep />}
      </div>
    </div>
  );
}