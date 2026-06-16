import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EpisodicAI | Autonomous AI Series Studio & Operating System',
  description: 'Create a show once. Let the story live on. Preserve canon, character identities, timeline consistency, and production budgets automatically.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-brand-bg text-gray-100 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
