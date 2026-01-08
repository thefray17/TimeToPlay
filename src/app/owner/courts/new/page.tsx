'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useUser, useFirestore } from '@/firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';
import { nanoid } from 'nanoid';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

const courtSchema = z.object({
  name: z.string().min(3, { message: 'Court name must be at least 3 characters.' }),
  sport: z.string().min(2, { message: 'A primary sport is required.' }),
  address: z.string().min(10, { message: 'Please enter a valid address.' }),
  description: z.string().optional(),
  pricePerHour: z.coerce.number().min(0, { message: 'Price must be a positive number.' }).default(0),
  openTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Invalid time format (HH:mm)'}),
  closeTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Invalid time format (HH:mm)'}),
  isIndoor: z.boolean().default(false),
  hasLights: z.boolean().default(false),
});

export default function NewCourtPage() {
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof courtSchema>>({
    resolver: zodResolver(courtSchema),
    defaultValues: {
      name: '',
      sport: 'Pickleball',
      address: '',
      description: '',
      pricePerHour: 0,
      openTime: '08:00',
      closeTime: '22:00',
      isIndoor: false,
      hasLights: true,
    },
  });

  async function onSubmit(values: z.infer<typeof courtSchema>) {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to create a court.' });
      return;
    }
    setIsLoading(true);

    try {
      const courtId = nanoid();
      const newCourtRef = doc(firestore, 'courts', courtId);
      
      await setDoc(newCourtRef, {
        id: courtId,
        ownerId: user.uid,
        name: values.name,
        sport: values.sport,
        address: values.address,
        description: values.description,
        pricePerHour: values.pricePerHour,
        openTime: values.openTime,
        closeTime: values.closeTime,
        type: values.isIndoor ? 'Indoor' : 'Outdoor',
        tags: [values.isIndoor ? 'indoor' : 'outdoor', ...(values.hasLights ? ['lights'] : [])],
        
        // Default / Placeholder data
        rating: (Math.random() * (5 - 4.5) + 4.5).toFixed(1), // Random rating between 4.5 and 5
        isLiveAvailable: true,
        imageUrl: `https://picsum.photos/seed/${courtId}/600/400`,
        heroImageUrl: `https://picsum.photos/seed/${courtId}-hero/1200/400`,
        imageHint: `${values.sport.toLowerCase()} court`,
        amenities: [],
        operatingHours: `${values.openTime} - ${values.closeTime}`,
        cost: values.pricePerHour > 0 ? 'Paid' : 'Free',
        surface: 'Hard Court',
        rules: [],
        reviewsCount: 0,
        lat: 9.31, // Dumaguete default
        lng: 123.31, // Dumaguete default
        sportTypes: [values.sport],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast({ title: 'Court Created!', description: `${values.name} has been added to your list.` });
      router.push('/owner/courts');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Failed to create court', description: error.message });
      setIsLoading(false);
    }
  }

  return (
    <div>
       <Button variant="ghost" onClick={() => router.back()} className="mb-4 -ml-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Courts
      </Button>
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Create a New Court</CardTitle>
          <CardDescription>Fill out the details for your new court listing.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Court Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Downtown Pickleball Haven" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="sport"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Sport</FormLabel>
                    <FormControl>
                       <Input placeholder="e.g., Pickleball" {...field} />
                    </FormControl>
                     <FormDescription>This will be the main category for your court.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 123 Rizal Ave, Dumaguete City" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pricePerHour"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price per Hour (₱)</FormLabel>
                    <FormControl>
                      <Input type="number" step="10" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
                <div className="grid grid-cols-2 gap-8">
                   <FormField
                    control={form.control}
                    name="openTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Opening Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="closeTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Closing Time</FormLabel>
                        <FormControl>
                           <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                 <div className="grid grid-cols-2 gap-8">
                     <FormField
                        control={form.control}
                        name="isIndoor"
                        render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                            <FormLabel className="text-base">Indoor Court</FormLabel>
                            <FormDescription>Is this court located indoors?</FormDescription>
                            </div>
                            <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                        </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="hasLights"
                        render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                            <FormLabel className="text-base">Has Lighting</FormLabel>
                            <FormDescription>Can this court be used at night?</FormDescription>
                            </div>
                            <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                        </FormItem>
                        )}
                    />
                 </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="A brief description of your court..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Court
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
