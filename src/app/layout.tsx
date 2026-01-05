import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster"
import './globals.css';
import BottomNav from '@/components/layout/bottom-nav';
import { Lato } from 'next/font/google';
import { FirebaseClientProvider } from '@/firebase/client-provider';

const lato = Lato({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--font-lato',
});

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
      <body className={`${lato.variable} font-body antialiased bg-background`}>
        <FirebaseClientProvider>
          <div className="pb-24 md:pb-0">
            {children}
          </div>
          <Toaster />
          <BottomNav />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
