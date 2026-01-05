'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';
import { nanoid } from 'nanoid';

const courtSchema = z.object({
  name: z.string().min(3, { message: 'Court name must be at least 3 characters.' }),
  sport: z.string().min(2, { message: 'Sport type is required.' }),
  address: z.string().min(10, { message: 'Please enter a valid address.' }),
  description: z.string().optional(),
  pricePerHour: z.coerce.number().min(0, { message: 'Price must be a positive number.' }).default(0),
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
      await addDoc(collection(firestore, 'courts'), {
        ...values,
        id: courtId,
        ownerId: user.uid,
        // Placeholder data for fields not in form
        rating: 5,
        tags: ['outdoor'],
        type: 'Outdoor',
        isLiveAvailable: true,
        imageUrl: `https://picsum.photos/seed/${courtId}/600/400`,
        imageHint: `${values.sport.toLowerCase()} court`,
        amenities: [],
        operatingHours: '9:00 AM - 10:00 PM',
        cost: values.pricePerHour > 0 ? 'Paid' : 'Free',
        surface: 'Hard Court',
        rules: [],
        reviewsCount: 0,
        lat: 9.31, // Dumaguete default
        lng: 123.31, // Dumaguete default
        sportTypes: [values.sport],
        openTime: '09:00',
        closeTime: '22:00',
        heroImageUrl: `https://picsum.photos/seed/${courtId}-hero/1200/400`,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast({ title: 'Court Created!', description: `${values.name} has been added to your list.` });
      router.push('/owner/courts');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Failed to create court', description: error.message });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
       <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Courts
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Create a New Court</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="A brief description of your court..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
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

    