'use client';

import React from 'react';
import Header from '@/components/layout/header';
import { useSearchParams } from 'next/navigation';

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  
  return (
    <>
      <Header />
      <main className="container max-w-5xl mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Checkout</h1>
        <p className="text-muted-foreground">This is a placeholder for the checkout process.</p>
        {bookingId && <p className="mt-4">Booking ID: {bookingId}</p>}
        <p className="mt-2">Payment integration coming soon!</p>
      </main>
    </>
  );
}
