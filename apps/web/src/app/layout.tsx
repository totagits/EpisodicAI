import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';

export const metadata: Metadata = {
  title: 'EpisodicAI | Autonomous AI Series Studio & Operating System',
  description: 'Create a show once. Let the story live on. Preserve canon, character identities, timeline consistency, and production budgets automatically.',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
    shortcut: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-brand-bg text-gray-100 min-h-screen antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
