'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, Calendar, Plus, Wallet, BarChart, ChevronRight, Loader2 } from 'lucide-react';
import Header from '@/components/layout/header';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Court } from '@/lib/types';

type Booking = {
  id: string;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  totalPrice: number;
};

const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
  isLoading,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  color: string;
  isLoading?: boolean;
}) => (
  <Card className="rounded-2xl">
    <CardContent className="p-4 text-center">
      <div
        className={`inline-flex p-2 rounded-full mb-2`}
        style={{ backgroundColor: `${color}1A` }}
      >
        <Icon className="h-5 w-5" style={{ color: color }} />
      </div>
      {isLoading ? (
        <Loader2 className="h-6 w-6 mx-auto animate-spin text-muted-foreground" />
      ) : (
        <p className="text-2xl font-bold">{value}</p>
      )}
      <p className="text-xs text-muted-foreground font-semibold tracking-wider">{title}</p>
    </CardContent>
  </Card>
);

const QuickActionCard = ({
  title,
  subtitle,
  icon: Icon,
  iconBg,
  onClick,
}: {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  iconBg: string;
  onClick: () => void;
}) => (
  <Card
    className="rounded-2xl hover:bg-secondary/50 transition-colors cursor-pointer"
    onClick={onClick}
  >
    <CardContent className="p-4 flex items-center gap-4">
      <div className={`p-3 rounded-xl`} style={{ backgroundColor: iconBg }}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div className="flex-1">
        <p className="font-bold">{title}</p>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <ChevronRight className="h-5 w-5 text-muted-foreground" />
    </CardContent>
  </Card>
);

export default function OwnerDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const courtsQuery = useMemoFirebase(
    () => (user && firestore ? query(collection(firestore, 'courts'), where('ownerId', '==', user.uid)) : null),
    [user, firestore]
  );
  const { data: courts, isLoading: isLoadingCourts } = useCollection<Court>(courtsQuery);

  const bookingsQuery = useMemoFirebase(
    () => (user && firestore ? query(collection(firestore, `users/${user.uid}/owner_bookings`)) : null),
    [user, firestore]
  );
  const { data: bookings, isLoading: isLoadingBookings } = useCollection<Booking>(bookingsQuery);

  const stats = useMemo(() => {
    const pendingRequests = bookings?.filter(b => b.status === 'pending').length || 0;
    const monthlyRevenue =
      bookings
        ?.filter(b => b.status === 'accepted') // In a real app, you'd filter by date
        .reduce((sum, b) => sum + b.totalPrice, 0) || 0;
    return {
      courtCount: courts?.length ?? 0,
      pendingRequests,
      monthlyRevenue,
    };
  }, [courts, bookings]);

  const handleActionClick = (path: string, featureName: string) => {
    if (path) {
      router.push(path);
    } else {
      toast({
        title: 'Coming Soon!',
        description: `${featureName} is under development.`,
      });
    }
  };
  
  const isLoading = isLoadingCourts || isLoadingBookings;

  return (
    <>
      <Header showLocation={false} />
      <main className="container max-w-3xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Owner Dashboard</h1>
          <p className="text-muted-foreground tracking-wide mt-1">
            MANAGE COURTS AND BOOKING REQUESTS
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard
            title="MY COURTS"
            value={String(stats.courtCount)}
            icon={Home}
            color="#2ecc71"
            isLoading={isLoadingCourts}
          />
          <StatCard
            title="PENDING REQUESTS"
            value={String(stats.pendingRequests)}
            icon={Calendar}
            color="#e67e22"
            isLoading={isLoadingBookings}
          />
          <StatCard
            title="THIS MONTH"
            value={`₱${(stats.monthlyRevenue / 1000).toFixed(1)}k`}
            icon={Wallet}
            color="#3498db"
            isLoading={isLoadingBookings}
          />
        </div>

        <div className="space-y-4">
          <p className="text-sm font-semibold text-muted-foreground tracking-[0.2em] text-center">
            QUICK ACTIONS
          </p>
          <QuickActionCard
            title="Add New Court"
            subtitle="List a new court for players to book"
            icon={Plus}
            iconBg="#27ae60"
            onClick={() => handleActionClick('/owner/courts/new', 'Add New Court')}
          />
          <QuickActionCard
            title="Manage Courts"
            subtitle="Edit pricing, availability, and details"
            icon={Home}
            iconBg="#2c3e50"
            onClick={() => handleActionClick('/owner/courts', 'Manage Courts')}
          />
          <QuickActionCard
            title="Booking Requests"
            subtitle="Accept or decline incoming bookings"
            icon={Calendar}
            iconBg="#e67e22"
            onClick={() => handleActionClick('/owner/bookings', 'Booking Requests')}
          />
        </div>

        <Card className="mt-8 rounded-2xl bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800/50">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
              <BarChart className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm text-green-900 dark:text-green-200">
                Weekly Performance
              </p>
              <p className="text-sm text-green-700 dark:text-green-300/80">
                Your bookings are up 12% compared to last week. Great job!
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
