import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster"
import './globals.css';
import BottomNav from '@/components/layout/bottom-nav';

export const metadata: Metadata = {
  title: 'CourtFind',
  description: 'Find and reserve nearby sports courts',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <div className="pb-20 md:pb-0">
          {children}
        </div>
        <Toaster />
        <BottomNav />
      </body>
    </html>
  );
}
