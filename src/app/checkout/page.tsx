'use client';

import React from 'react';
import Header from '@/components/layout/header';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  
  return (
    <>
      <Header showLocation={false}/>
      <main className="container max-w-lg mx-auto px-4 py-8 text-center flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <CheckCircle className="h-24 w-24 text-primary mb-6" />
        <h1 className="text-3xl font-bold mb-4">Booking Pending!</h1>
        <p className="text-muted-foreground max-w-md">
          Your court time is pending confirmation. For this demo, payment is mocked. Your booking has been created.
        </p>
        {bookingId && 
          <div className="mt-6 text-sm bg-secondary text-secondary-foreground rounded-lg px-4 py-2">
            Booking ID: <span className="font-mono">{bookingId}</span>
          </div>
        }
        <div className="flex gap-4 mt-8">
            <Link href="/bookings" passHref>
                <Button size="lg">View My Bookings</Button>
            </Link>
            <Link href="/" passHref>
                 <Button size="lg" variant="outline">Explore More Courts</Button>
            </Link>
        </div>
      </main>
    </>
  );
}
