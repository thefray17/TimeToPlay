'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, MapPin, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { SportIcons } from './icons';
import { Card, CardContent } from '@/components/ui/card';

const searchSchema = z.object({
  location: z.string().min(1, 'Location is required'),
  sport: z.string(),
  date: z.date(),
  distance: z.number().min(1).max(50),
  type: z.string(),
  cost: z.string(),
});

export type FormValues = z.infer<typeof searchSchema>;

type CourtSearchFormProps = {
  onSearch: (values: FormValues) => void;
  isSearching: boolean;
};

export default function CourtSearchForm({ onSearch, isSearching }: CourtSearchFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      location: 'New York, NY',
      sport: 'all',
      date: new Date(),
      distance: 10,
      type: 'all',
      cost: 'all',
    },
  });

  return (
    <Card className="mb-8 shadow-lg">
      <CardContent className="p-4 md:p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSearch)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
              <div className="lg:col-span-2">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="City, State, or Zip" className="pl-10" {...field} />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="sport"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sport</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a sport" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="all">All Sports</SelectItem>
                        <SelectItem value="Pickleball">
                          <div className="flex items-center gap-2">
                            <SportIcons.Pickleball className="h-4 w-4" /> Pickleball
                          </div>
                        </SelectItem>
                        <SelectItem value="Basketball">
                           <div className="flex items-center gap-2">
                            <SportIcons.Basketball className="h-4 w-4" /> Basketball
                          </div>
                        </SelectItem>
                        <SelectItem value="Tennis">
                           <div className="flex items-center gap-2">
                            <SportIcons.Tennis className="h-4 w-4" /> Tennis
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )}
              />

              <div className="lg:col-span-2">
                 <Button disabled={isSearching} type="submit" className="w-full h-10">
                  <Search className="mr-2 h-4 w-4" />
                  {isSearching ? 'Searching...' : 'Search'}
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <FormField
                  control={form.control}
                  name="distance"
                  render={({ field: {value, onChange} }) => (
                    <FormItem>
                      <FormLabel>Distance ({value} mi)</FormLabel>
                      <FormControl>
                        <Slider
                          min={1}
                          max={50}
                          step={1}
                          value={[value]}
                          onValueChange={(vals) => onChange(vals[0])}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Court Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Any Type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="all">Any Type</SelectItem>
                          <SelectItem value="Indoor">Indoor</SelectItem>
                          <SelectItem value="Outdoor">Outdoor</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cost</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Any Cost" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="all">Any Cost</SelectItem>
                          <SelectItem value="Free">Free</SelectItem>
                          <SelectItem value="Paid">Paid</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
