'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, updateDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Loader2, Edit, ToggleLeft, ToggleRight, Check } from 'lucide-react';
import type { Court } from '@/lib/types';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

const CourtListItem = ({ court }: { court: Court }) => {
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isToggling, setIsToggling] = useState(false);

  const handleStatusToggle = async (newStatus: boolean) => {
    if (!firestore) return;
    setIsToggling(true);
    const courtRef = doc(firestore, 'courts', court.id);
    try {
      await updateDoc(courtRef, { isLiveAvailable: newStatus });
      toast({
        title: 'Status Updated',
        description: `${court.name} is now ${newStatus ? 'Active' : 'Inactive'}.`,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error.message,
      });
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-start gap-4">
        <Image 
          src={court.imageUrl} 
          alt={court.name} 
          width={80} 
          height={80} 
          className="rounded-lg aspect-square object-cover" 
          data-ai-hint={court.imageHint} 
        />
        <div className="flex-1">
          <CardTitle>{court.name}</CardTitle>
          <CardDescription>{court.address}</CardDescription>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">{court.sport}</Badge>
            <Badge variant={court.isLiveAvailable ? 'secondary' : 'destructive'}>
              {court.isLiveAvailable ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="mt-auto flex items-center justify-end gap-2 p-4 pt-0">
        <div className="flex items-center gap-2 mr-auto">
          <Switch
            id={`status-toggle-${court.id}`}
            checked={court.isLiveAvailable}
            onCheckedChange={handleStatusToggle}
            disabled={isToggling}
            aria-label="Toggle court status"
          />
           <label htmlFor={`status-toggle-${court.id}`} className="text-sm font-medium text-muted-foreground">
            {isToggling ? <Loader2 className="h-4 w-4 animate-spin"/> : (court.isLiveAvailable ? 'Active' : 'Inactive')}
          </label>
        </div>
        
        <Button variant="outline" size="sm" onClick={() => toast({title: "Coming soon!"})}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </CardContent>
    </Card>
  );
};

export default function OwnerCourtsPage() {
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();

  const courtsQuery = useMemoFirebase(
    () => (user && firestore ? query(collection(firestore, 'courts'), where('ownerId', '==', user.uid)) : null),
    [user, firestore]
  );

  const { data: courts, isLoading } = useCollection<Court>(courtsQuery);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">My Courts</h1>
        <Button onClick={() => router.push('/owner/courts/new')}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Court
        </Button>
      </div>

      {isLoading && (
        <div className="flex justify-center mt-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {!isLoading && courts && courts.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {courts.map((court) => (
            <CourtListItem key={court.id} court={court} />
          ))}
        </div>
      )}

      {!isLoading && (!courts || courts.length === 0) && (
        <div className="text-center py-16 px-4 border-2 border-dashed rounded-lg mt-8">
          <h2 className="text-xl font-semibold">No Courts Found</h2>
          <p className="text-muted-foreground mt-2">Get started by adding your first court.</p>
           <Button className="mt-4" onClick={() => router.push('/owner/courts/new')}>
              <PlusCircle className="mr-2 h-4 w-4" /> Create First Court
            </Button>
        </div>
      )}
    </div>
  );
}
