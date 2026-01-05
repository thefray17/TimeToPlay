'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import React, { useState } from 'react';
import { Calendar as CalendarIcon, Search, SlidersHorizontal } from 'lucide-react';
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

  const handleSportSelect = (sport: string) => {
    setActiveSport(sport);
    form.setValue('sport', sport.toLowerCase());
    handleSubmit();
  };
  
  const handleDateFilterSelect = (filter: string) => {
    setActiveDateFilter(filter);
    const newDate = new Date();
    if (filter === 'Tomorrow') {
      newDate.setDate(newDate.getDate() + 1);
    }
    // 'Weekend' logic can be more complex, for now it will just be 'today'
    form.setValue('date', newDate);
    if(filter !== 'Calendar') {
      handleSubmit();
    }
  };

  const handleDateSelect = (date?: Date) => {
    if (date) {
      form.setValue('date', date);
      setActiveDateFilter(format(date, 'MMM d'));
      setCalendarOpen(false);
      handleSubmit();
    }
  }

  const handleSubmit = form.handleSubmit((values) => {
    onSearch(values);
  });

  return (
    <div className="space-y-4 mb-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input 
          {...form.register('query')}
          placeholder="Find a court..." 
          className="pl-10 h-12 text-base rounded-xl"
          onBlur={handleSubmit}
        />
        <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9">
            <SlidersHorizontal className="h-5 w-5 text-muted-foreground" />
        </Button>
      </div>

      <div className="flex space-x-2 overflow-x-auto pb-2 -mx-4 px-4">
        {sports.map(sport => (
          <Button
            key={sport}
            variant={activeSport === sport ? 'default' : 'outline'}
            className={`rounded-full whitespace-nowrap ${activeSport === sport ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground'}`}
            onClick={() => handleSportSelect(sport)}
          >
            {sport}
          </Button>
        ))}
      </div>

      <div className="flex space-x-2">
        {dateFilters.map(filter => (
           <Button
            key={filter}
            variant={activeDateFilter === filter ? 'outline' : 'ghost'}
            className={`rounded-full whitespace-nowrap ${activeDateFilter === filter ? 'border-primary text-primary font-bold' : ''}`}
            onClick={() => handleDateFilterSelect(filter)}
          >
            {filter}
          </Button>
        ))}
        <Popover open={isCalendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant={activeDateFilter.includes(' ') || (activeDateFilter !== 'Today' && activeDateFilter !== 'Tomorrow' && activeDateFilter !== 'Weekend') ? 'outline' : 'ghost'}
              className={cn('rounded-full whitespace-nowrap', (activeDateFilter.includes(' ') || (activeDateFilter !== 'Today' && activeDateFilter !== 'Tomorrow' && activeDateFilter !== 'Weekend')) && 'border-primary text-primary font-bold')}
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
  );
}
