
'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, signOut } from 'firebase/auth';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Sparkles,
  Zap,
  Grid3x3,
  MoveUpRight,
  Settings,
  CreditCard,
  Bell,
  Shield,
  ChevronRight,
  LogOut,
  Loader2,
  Star,
  Camera,
  Pencil,
  Clock,
  Award,
  Users,
} from 'lucide-react';
import Header from '@/components/layout/header';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type UserProfile = {
  role?: string;
  bio?: string;
  photoURL?: string;
  displayName?: string;
};

// --- Reusable Components ---

const ProfileHeader = ({
  user,
  profile,
  onPhotoChange,
  isUploading,
  uploadProgress,
}: {
  user: import('firebase/auth').User;
  profile: UserProfile;
  onPhotoChange: (file: File) => void;
  isUploading: boolean;
  uploadProgress: number;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          variant: 'destructive',
          title: 'Invalid File Type',
          description: 'Please select an image file.',
        });
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast({
          variant: 'destructive',
          title: 'File Too Large',
          description: 'Please select an image smaller than 5MB.',
        });
        return;
      }
      onPhotoChange(file);
    }
  };

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative mb-4">
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
        <Avatar className="w-24 h-24 border-4 border-background relative z-10" onClick={handleAvatarClick}>
          <AvatarImage src={profile.photoURL ?? user.photoURL ?? undefined} alt={profile.displayName ?? ''} />
          <AvatarFallback>
            {profile.displayName
              ? profile.displayName.split(' ').map((n: string) => n[0]).join('')
              : user.email?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <Button
          size="icon"
          className="absolute bottom-0 right-0 z-20 h-8 w-8 rounded-full"
          onClick={handleAvatarClick}
          disabled={isUploading}
        >
          {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
        </Button>
      </div>
      {isUploading && (
        <div className="w-full max-w-xs text-center">
          <Progress value={uploadProgress} className="h-2" />
          <p className="text-xs mt-1 text-muted-foreground">Uploading...</p>
        </div>
      )}
      <h1 className="text-2xl font-bold mt-2">{profile.displayName || user.displayName}</h1>
      <div className="flex items-center gap-2 mt-2">
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">PRO MEMBER</Badge>
        <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200">RANK N/A</Badge>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color }: { title: string; value: string; icon: React.ElementType, color: string }) => (
    <Card>
      <CardContent className="p-4 text-center">
        <div className={`inline-flex p-3 rounded-full mb-2`} style={{ backgroundColor: `${color}1A` }}>
          <Icon className="h-6 w-6" style={{color: color}} />
        </div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground font-semibold tracking-wider">{title}</p>
      </CardContent>
    </Card>
);

const OwnerDashboardBanner = () => (
  <Link href="/owner" passHref>
    <Card className="bg-gray-800 text-white rounded-3xl overflow-hidden relative border-gray-700 mt-8 cursor-pointer group">
      <CardContent className="p-6 relative z-10 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-primary tracking-wider flex items-center gap-2">
            <Grid3x3 className="h-3 w-3" /> PARTNER PORTAL
          </p>
          <h3 className="text-2xl font-bold mt-1">Owner Dashboard</h3>
          <p className="text-xs text-gray-400 font-semibold tracking-wider mt-1">
            MANAGE COURTS & BOOKINGS
          </p>
        </div>
        <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center transition-transform group-hover:scale-110">
          <ChevronRight className="h-6 w-6 text-primary" />
        </div>
      </CardContent>
      <div className="absolute -top-4 -right-8 w-32 h-32 rounded-full bg-white/5 transition-transform group-hover:scale-125" />
    </Card>
  </Link>
);


const BioSection = ({ bio, onSave }: { bio?: string; onSave: (newBio: string) => Promise<void> }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedBio, setEditedBio] = useState(bio || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(editedBio);
    setIsSaving(false);
    setIsEditing(false);
  };

  return (
    <Card className="mt-8">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold">Bio</h3>
            <p className="text-sm text-muted-foreground">Tell other players about yourself.</p>
          </div>
          {!isEditing && (
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
              <Pencil className="mr-2 h-4 w-4" /> Edit Bio
            </Button>
          )}
        </div>
        <div className="mt-4">
          {isEditing ? (
            <div className="space-y-4">
              <Textarea
                value={editedBio}
                onChange={(e) => setEditedBio(e.target.value)}
                placeholder="Your bio..."
                rows={4}
              />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setIsEditing(false)} disabled={isSaving}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save'}
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              {bio || 'No bio yet.'}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};


const AccountRow = ({
  icon: Icon,
  title,
  subtitle,
  onClick,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  onClick: () => void;
}) => (
  <div
    onClick={onClick}
    className="flex items-center p-4 bg-card rounded-2xl border hover:bg-secondary/50 transition-colors cursor-pointer"
  >
    <div className="p-3 bg-secondary rounded-xl">
      <Icon className="h-5 w-5 text-foreground" />
    </div>
    <div className="flex-1 ml-4">
      <p className="font-semibold">{title}</p>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </div>
    <ChevronRight className="h-5 w-5 text-muted-foreground" />
  </div>
);

function ProfilePageContent() {
  const { user: authUser, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const userProfileRef = useMemoFirebase(() => {
    return authUser && firestore ? doc(firestore, 'users', authUser.uid) : null;
  }, [authUser, firestore]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  React.useEffect(() => {
    if (!isUserLoading && !authUser) {
      router.replace('/auth?redirect=/profile');
    }
  }, [authUser, isUserLoading, router]);

  const handlePhotoChange = (file: File) => {
    if (!authUser) return;

    const storage = getStorage();
    const fileExtension = file.name.split('.').pop();
    const storageRef = ref(storage, `users/${authUser.uid}/avatar.${fileExtension}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    setIsUploading(true);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        setIsUploading(false);
        setUploadProgress(0);
        toast({
          variant: 'destructive',
          title: 'Upload Failed',
          description: error.message,
        });
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          if (userProfileRef) {
            await updateDoc(userProfileRef, { photoURL: downloadURL, updatedAt: serverTimestamp() });
          }
          toast({
            title: 'Profile Photo Updated!',
            description: 'Your new photo is now visible.',
          });
        } catch (error: any) {
          toast({
            variant: 'destructive',
            title: 'Update Failed',
            description: 'Could not save the new photo URL.',
          });
        } finally {
          setIsUploading(false);
          setUploadProgress(0);
        }
      }
    );
  };
  
  const handleSaveBio = async (newBio: string) => {
      if (!userProfileRef) {
          toast({ variant: 'destructive', title: 'Error', description: 'User profile not found.' });
          return;
      }
      try {
          await updateDoc(userProfileRef, { bio: newBio, updatedAt: serverTimestamp() });
          toast({ title: 'Bio updated successfully!' });
      } catch (error: any) {
          toast({ variant: 'destructive', title: 'Failed to update bio', description: error.message });
      }
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    router.replace('/'); 
    setTimeout(async () => {
      try {
        const auth = getAuth();
        await signOut(auth);
        toast({ title: "You've been signed out." });
      } catch (error) {
        toast({ variant: 'destructive', title: 'Logout Failed', description: 'Something went wrong.' });
      } finally {
        setIsLoggingOut(false);
      }
    }, 100);
  };

  const isLoading = isUserLoading || isProfileLoading;

  if (isLoading || !authUser || !userProfile) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <Header showLocation={false} />
      <main className="container max-w-2xl mx-auto px-4 py-8">
        <ProfileHeader
          user={authUser}
          profile={userProfile}
          onPhotoChange={handlePhotoChange}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
        />
        
        <div className="grid grid-cols-2 gap-4 mt-8">
          <StatCard title="PLAYER RATING" value="N/A" icon={Award} color="#f1c40f" />
          <StatCard title="TOTAL PLAYTIME" value="0 hrs" icon={Clock} color="#3498db" />
        </div>
        
        {userProfile?.role === 'owner' && <OwnerDashboardBanner />}
        
        <Alert className="mt-8">
          <Users className="h-4 w-4" />
          <AlertTitle>Join a Crew!</AlertTitle>
          <AlertDescription>
            The Crew feature is coming soon. Team up with friends, compete, and climb the ranks together.
          </AlertDescription>
        </Alert>
        
        <BioSection bio={userProfile?.bio} onSave={handleSaveBio} />

        <div className="my-8">
          <p className="text-sm font-semibold text-muted-foreground tracking-[0.2em] mb-4 text-center">
            ACCOUNT MANAGEMENT
          </p>
          <div className="space-y-3">
            {[
              { icon: Settings, title: "Settings", subtitle: "APP PREFERENCES & ACCOUNT" },
              { icon: CreditCard, title: "Payment Methods", subtitle: "MANAGE CARDS & BILLING" },
              { icon: Bell, title: "Notifications", subtitle: "BOOKING ALERTS & UPDATES" },
              { icon: Shield, title: "Privacy & Security", subtitle: "DATA & PASSWORD" },
            ].map(item => (
              <AccountRow
                key={item.title}
                icon={item.icon}
                title={item.title}
                subtitle={item.subtitle}
                onClick={() => toast({ title: 'Coming Soon!' })}
              />
            ))}
          </div>
        </div>

        <div className="mt-12">
          <Button
            variant="outline"
            className="w-full h-14 rounded-2xl text-base font-bold text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/50"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <LogOut className="mr-2 h-5 w-5" />}
            SIGN OUT
          </Button>
        </div>
      </main>
    </div>
  );
}

export default function ProfilePage() {
  return <ProfilePageContent />;
}
