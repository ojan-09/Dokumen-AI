import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Workspace',
  description: 'Modern AI document editor',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}