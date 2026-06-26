// Avoid importing next types here to prevent TS errors in environments
// where 'next' type declarations are not available.
// TypeScript may complain about missing type declarations for CSS imports in some setups.
// Suppress the error for this side-effect import.
// @ts-ignore
import './globals.css';
import { AuthProvider } from '@/lib/auth';

export const metadata = {
  title: 'LMS — Loan Management System',
  description: 'A full-stack lending platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}