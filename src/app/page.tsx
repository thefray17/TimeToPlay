'use client';

import type { FormValues } from '@/components/court-search-form';
import React, { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import Header from '@/components/layout/header';
import CourtSearchForm from '@/components/court-search-form';
import CourtList from '@/components/court-list';
import type { Court } from '@/lib/types';
import { courts as allCourts } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Zap, Sun, Dot } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function Home() {
  const [filteredCourts, setFilteredCourts] = useState<Court[]>([]);
  const [searchParams, setSearchParams] = useState({
    date: new Date(),
    time: '14:00',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading of courts
    setTimeout(() => {
      setFilteredCourts(allCourts);
      setIsLoading(false);
    }, 500);
  }, []);

  const handleSearch = (filters: FormValues) => {
    setIsLoading(true);
    setSearchParams({ date: filters.date, time: '14:00' }); // Simplified time for now

    // Simulate async search
    setTimeout(() => {
      let courts = allCourts;

      if (filters.sport && filters.sport !== 'all') {
        courts = courts.filter(court => court.sport.toLowerCase() === filters.sport);
      }
      
      const formattedDate = format(filters.date, 'yyyy-MM-dd');
      // courts = courts.filter(court => court.availability[formattedDate]);

      setFilteredCourts(courts);
      setIsLoading(false);
    }, 300);
  };
  
  const formattedDate = useMemo(() => format(searchParams.date, 'yyyy-MM-dd'), [searchParams.date]);

  return (
    <div className="flex flex-col min-h-screen bg-background dark:bg-card">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 md:py-8">
        <CourtSearchForm onSearch={handleSearch} isSearching={isLoading} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-green-800">FAST BOOKING</h3>
                  <p className="text-sm text-green-700">Instant confirmation for 6 spots</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-4">
               <div className="flex items-start gap-3">
                 <div className="bg-orange-100 p-2 rounded-full">
                  <Sun className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-orange-800">WEATHER</h3>
                  <p className="text-sm text-orange-700">Partly Cloudy, 68°F. Great for play!</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">NEARBY COURTS</h2>
          <div className="flex items-center text-sm font-semibold text-primary">
            <Dot className="h-6 w-6 text-primary animate-pulse" />
            LIVE AVAILABILITY
          </div>
        </div>

        <CourtList 
          courts={filteredCourts} 
          searchDate={formattedDate}
          isLoading={isLoading} 
        />
      </main>
      <footer className="py-4 text-center text-sm text-muted-foreground hidden md:block">
        © {new Date().getFullYear()} CourtFind. All rights reserved.
      </footer>
    </div>
  );
}
