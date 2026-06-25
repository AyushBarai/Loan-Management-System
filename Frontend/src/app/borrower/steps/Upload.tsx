'use client';
import { useState, useRef } from 'react';
import api from '@/lib/api';

interface Props { onNext: () => void; }

export default function UploadStep({ onNext }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const ALLOWED = ['application/pdf', 'image/jpeg', 'image/png'];
  const MAX_SIZE = 5 * 1024 * 1024;

  const validateAndSet = (f: File) => {
    setError('');
    if (!ALLOWED.includes(f.type)) {
      setError('Only PDF, JPG, PNG files are accepted');
      return;
    }
    if (f.size > MAX_SIZE) {
      setError('File must be under 5MB');
      return;
    }
    setFile(f);
    if (f.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(f));
    } else {
      setPreview('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { setError('Please select a file'); return; }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('salarySlip', file);
      await api.post('/borrower/application/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onNext();
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Upload salary slip</h2>
      <p className="text-sm text-gray-500 mb-6">PDF, JPG, or PNG — max 5MB</p>

      <form onSubmit={handleSubmit}>
        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) validateAndSet(f); }}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }`}
        >
          <input ref={inputRef} type="file" className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) validateAndSet(f); }} />

          {file ? (
            <div>
              {preview && <img src={preview} alt="Preview" className="max-h-32 mx-auto mb-3 rounded object-contain" />}
              <p className="font-medium text-gray-900">{file.name}</p>
              <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
              <p className="text-xs text-blue-600 mt-2">Click to change file</p>
            </div>
          ) : (
            <div>
              <div className="text-4xl mb-3">📄</div>
              <p className="text-gray-700 font-medium">Drop your salary slip here</p>
              <p className="text-sm text-gray-500 mt-1">or click to browse</p>
            </div>
          )}
        </div>

        {error && <p className="error-text mt-2">{error}</p>}

        <button type="submit" className="btn-primary w-full mt-6" disabled={loading || !file}>
          {loading ? 'Uploading...' : 'Upload & continue'}
        </button>
      </form>
    </div>
  );
}