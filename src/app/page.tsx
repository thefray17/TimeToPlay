'use client';

import type { FormValues } from '@/components/court-search-form';
import React, { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import Header from '@/components/layout/header';
import CourtSearchForm from '@/components/court-search-form';
import CourtList from '@/components/court-list';
import type { Court } from '@/lib/types';
import { courts as allCourts } from '@/lib/data';

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
        courts = courts.filter(court => court.sport === filters.sport);
      }
      if (filters.distance) {
        courts = courts.filter(court => court.distance <= filters.distance);
      }
      if (filters.type && filters.type !== 'all') {
        courts = courts.filter(court => court.type === filters.type);
      }
      if (filters.cost && filters.cost !== 'all') {
        courts = courts.filter(court => court.cost === filters.cost);
      }
      
      const formattedDate = format(filters.date, 'yyyy-MM-dd');
      courts = courts.filter(court => court.availability[formattedDate]);

      setFilteredCourts(courts);
      setIsLoading(false);
    }, 300);
  };
  
  const formattedDate = useMemo(() => format(searchParams.date, 'yyyy-MM-dd'), [searchParams.date]);

  return (
    <div className="flex flex-col min-h-screen bg-secondary/30 dark:bg-card">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 md:py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-gray-800 dark:text-white tracking-tight">
            Find Your Court
          </h1>
          <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
            Book pickleball, basketball, tennis courts and more near you. Instantly.
          </p>
        </div>
        <CourtSearchForm onSearch={handleSearch} isSearching={isLoading} />
        <CourtList 
          courts={filteredCourts} 
          searchDate={formattedDate}
          isLoading={isLoading} 
        />
      </main>
      <footer className="py-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} CourtFind. All rights reserved.
      </footer>
    </div>
  );
}
