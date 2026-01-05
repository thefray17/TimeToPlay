'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';

const searchSchema = z.object({
  query: z.string(),
  sport: z.string(),
  date: z.date(),
});

export type FormValues = z.infer<typeof searchSchema>;

type CourtSearchFormProps = {
  onSearch: (values: FormValues) => void;
  isSearching: boolean;
};

const sports = ['All', 'Pickleball', 'Basketball', 'Tennis', 'Badminton', 'Volleyball', 'Futsal'];
const dateFilters = ['Today', 'Tomorrow', 'Weekend'];

export default function CourtSearchForm({ onSearch, isSearching }: CourtSearchFormProps) {
  const [activeSport, setActiveSport] = useState('All');
  const [activeDateFilter, setActiveDateFilter] = useState('Today');
  const [isCalendarOpen, setCalendarOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      query: '',
      sport: 'all',
      date: new Date(),
    },
  });

  const { watch, setValue, handleSubmit } = form;
  
  const watchedValues = watch();

  useEffect(() => {
    const subscription = watch((value) => {
      onSearch(value as FormValues);
    });
    return () => subscription.unsubscribe();
  }, [watch, onSearch]);

  const handleSportSelect = (sport: string) => {
    setActiveSport(sport);
    setValue('sport', sport.toLowerCase());
  };
  
  const handleDateFilterSelect = (filter: string) => {
    setActiveDateFilter(filter);
    const newDate = new Date();
    if (filter === 'Tomorrow') {
      newDate.setDate(newDate.getDate() + 1);
    }
    // 'Weekend' logic can be more complex, for now it will just be 'today'
    setValue('date', newDate);
    if(filter !== 'Calendar') {
       // submission is handled by useEffect
    }
  };

  const handleDateSelect = (date?: Date) => {
    if (date) {
      setValue('date', date);
      setActiveDateFilter(format(date, 'MMM d'));
      setCalendarOpen(false);
      // submission is handled by useEffect
    }
  }

  const handleFormSubmit = handleSubmit((values) => {
    onSearch(values);
  });

  return (
    <div className="w-full space-y-4">
      <div className="relative flex-grow">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input 
          {...form.register('query')}
          placeholder="Find a court..." 
          className="pl-10 h-12 text-base rounded-xl shadow-sm border-gray-200"
          onBlur={handleFormSubmit}
        />
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4">
        <div className="flex space-x-2">
          {sports.map(sport => (
            <Button
              key={sport}
              variant={activeSport === sport ? 'default' : 'outline'}
              className={`rounded-full whitespace-nowrap text-sm h-9 px-4 ${activeSport === sport ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground border-gray-300'}`}
              onClick={() => handleSportSelect(sport)}
            >
              {sport}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="flex space-x-2">
          {dateFilters.map(filter => (
             <Button
              key={filter}
              variant={activeDateFilter === filter ? 'outline' : 'ghost'}
              className={`rounded-full whitespace-nowrap text-sm h-9 px-4 ${activeDateFilter === filter ? 'border-primary text-primary font-semibold bg-white' : 'text-muted-foreground'}`}
              onClick={() => handleDateFilterSelect(filter)}
            >
              {filter}
            </Button>
          ))}
          <Popover open={isCalendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant={activeDateFilter.includes(' ') || (activeDateFilter !== 'Today' && activeDateFilter !== 'Tomorrow' && activeDateFilter !== 'Weekend') ? 'outline' : 'ghost'}
                className={cn('rounded-full whitespace-nowrap text-sm h-9 px-4', (activeDateFilter.includes(' ') || (activeDateFilter !== 'Today' && activeDateFilter !== 'Tomorrow' && activeDateFilter !== 'Weekend')) ? 'border-primary text-primary font-semibold bg-white' : 'text-muted-foreground')}
                onClick={() => setCalendarOpen(true)}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {activeDateFilter.includes(' ') ? activeDateFilter : 'Calendar'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={form.getValues('date')}
                onSelect={handleDateSelect}
                disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

    </div>
  );
}
