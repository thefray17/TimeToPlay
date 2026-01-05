'use client';

import type { FormValues } from '@/components/court-search-form';
import React, { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import Header from '@/components/layout/header';
import CourtSearchForm from '@/components/court-search-form';
import CourtList from '@/components/court-list';
import type { Court } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Zap, Sun, Map } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

export default function Home() {
  const { toast } = useToast();
  const firestore = useFirestore();

  const courtsQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'courts'), where('isLiveAvailable', '==', true)) : null),
    [firestore]
  );
  
  const { data: allCourts, isLoading: isLoadingCourts } = useCollection<Court>(courtsQuery);
  
  const [filteredCourts, setFilteredCourts] = useState<Court[] | null>(null);
  const [searchParams, setSearchParams] = useState({ date: new Date() });
  const [isFiltering, setIsFiltering] = useState(false);

  useEffect(() => {
    if (allCourts) {
      setFilteredCourts(allCourts);
    }
  }, [allCourts]);

  const handleSearch = (filters: FormValues) => {
    setIsFiltering(true);
    setSearchParams({ date: filters.date });

    setTimeout(() => {
      if (!allCourts) {
        setIsFiltering(false);
        return;
      }
      
      let courts = allCourts;

      if (filters.sport && filters.sport !== 'all') {
        courts = courts.filter(court => court.sport.toLowerCase() === filters.sport);
      }

      if (filters.query) {
        courts = courts.filter(court => court.name.toLowerCase().includes(filters.query.toLowerCase()));
      }

      setFilteredCourts(courts);
      setIsFiltering(false);
    }, 300);
  };
  
  const formattedDate = useMemo(() => format(searchParams.date, 'yyyy-MM-dd'), [searchParams.date]);

  const handleDatePillClick = (filter: string) => {
    if (filter !== 'Today') {
      toast({
        title: 'Coming Soon!',
        description: `Filtering by "${filter}" is not yet available.`,
      });
    }
    // "Today" functionality is handled by default
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-6 md:py-8">
        <div className="space-y-4">
          <CourtSearchForm onSearch={handleSearch} isSearching={isFiltering} onDateFilterSelect={handleDatePillClick} />
          <Button variant="ghost" size="icon" className="bg-primary/10 text-primary hover:bg-primary/20 flex-shrink-0 absolute top-[100px] right-4">
            <Map className="h-5 w-5"/>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
          <Card className="bg-green-50 border-green-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-green-800 tracking-wide">FAST BOOKING</h3>
                  <p className="text-sm text-green-700">Instant confirmation for {allCourts?.length || 0} spots</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-orange-50 border-orange-200 shadow-sm">
            <CardContent className="p-4">
               <div className="flex items-start gap-3">
                 <div className="bg-orange-100 p-2 rounded-full">
                  <Sun className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-orange-800 tracking-wide">WEATHER</h3>
                  <p className="text-sm text-orange-700">Partly Cloudy, 68°F. Great for play!</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="w-full h-[1px] bg-gray-200 my-6"></div>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white tracking-wider">NEARBY COURTS</h2>
        </div>

        <CourtList 
          courts={filteredCourts || []} 
          isLoading={isLoadingCourts || isFiltering}
        />
      </main>
      <footer className="py-4 text-center text-sm text-muted-foreground hidden md:block">
        © {new Date().getFullYear()} CourtFind. All rights reserved.
      </footer>
    </div>
  );
}
