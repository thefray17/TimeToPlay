'use client';

import React, { useState, Suspense, useCallback, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2,
  ArrowRight,
  Lock,
  Mail,
  User as UserIcon,
  Zap,
  Eye,
  EyeOff,
  Building,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  User,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc, addDoc, collection } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { add, format } from 'date-fns';
import { nanoid } from 'nanoid';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 48 48" {...props}>
    <path
      fill="#FFC107"
      d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
    ></path>
    <path
      fill="#FF3D00"
      d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
    ></path>
    <path
      fill="#4CAF50"
      d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
    ></path>
    <path
      fill="#1976D2"
      d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C44.438,36.338,48,30.418,48,24c0-3.355-0.78-6.502-2.145-9.332L39.06,19.24C41.488,20.918,43.611,20.083,43.611,20.083z"
    ></path>
  </svg>
);

const AuthPageSuspenseWrapper = () => (
  <Suspense
    fallback={
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    }
  >
    <AuthPage />
  </Suspense>
);

const AuthPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user: currentUser, isUserLoading } = useUser();

  const mode = searchParams.get('mode') || 'login';
  const redirect = searchParams.get('redirect') || '/';

  const [formMode, setFormMode] = useState<'login' | 'signup'>(
    mode === 'signup' ? 'signup' : 'login'
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSuccessfulAuth = useCallback(
    async (user: User) => {
      if (!firestore) return;
      
      const userDocRef = doc(firestore, `users/${user.uid}`);
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.data();
      const userRole = userData?.role;

      const pendingBookingString = localStorage.getItem('cf_pending_booking');

      if (pendingBookingString) {
        try {
          const pendingBooking = JSON.parse(pendingBookingString);
          const { courtId, dateKey, startTime, durationHours } = pendingBooking;

          const courtDoc = await getDoc(doc(firestore, 'courts', courtId));
          if (!courtDoc.exists()) {
            toast({
              variant: 'destructive',
              title: 'Court not found',
              description: 'The court you tried to book is no longer available.',
            });
            localStorage.removeItem('cf_pending_booking');
            router.replace(redirect);
            return;
          }

          const courtData = courtDoc.data();
          const bookingId = nanoid();
          const bookingStartTime = new Date(`${dateKey}T${startTime}`);
          const bookingEndTime = add(bookingStartTime, { hours: durationHours });
          
          const bookingRef = doc(firestore, `users/${user.uid}/bookings`, bookingId);

          const bookingData = {
            id: bookingId,
            userId: user.uid,
            courtId: courtId,
            ownerId: courtData.ownerId, 
            courtName: courtData.name,
            userName: user.displayName,
            userEmail: user.email,
            dateKey: dateKey,
            startTime: startTime,
            durationHours: durationHours,
            endTime: format(bookingEndTime, 'HH:mm'),
            totalPrice: (courtData.pricePerHour || 0) * durationHours,
            status: 'pending' as const,
            createdAt: serverTimestamp(),
          };
          
          await setDoc(bookingRef, bookingData);

          localStorage.removeItem('cf_pending_booking');
          router.push(`/checkout?bookingId=${bookingId}`);
          return;
        } catch (e: any) {
          console.error('Failed to process pending booking:', e);
          toast({
            variant: 'destructive',
            title: 'Booking failed',
            description: e.message || 'Could not create your booking after login.',
          });
          localStorage.removeItem('cf_pending_booking');
        }
      }

      if (userRole === 'owner') {
        router.replace('/owner');
      } else {
        router.replace(redirect);
      }
    },
    [firestore, router, redirect, toast]
  );

  useEffect(() => {
    if (!isUserLoading && currentUser) {
      handleSuccessfulAuth(currentUser);
    }
  }, [isUserLoading, currentUser, redirect, router, handleSuccessfulAuth]);

  const handleAuthAction = async () => {
    setIsLoading(true);
    const auth = getAuth();
    try {
      if (formMode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: 'Welcome back!' });
      } else {
        if (fullName.length < 2) throw new Error('Full name must be at least 2 characters.');
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: fullName });

        if (firestore) {
          const userRef = doc(firestore, `users/${userCredential.user.uid}`);
          await setDoc(
            userRef,
            {
              id: userCredential.user.uid,
              fullName,
              email,
              role: isOwner ? 'owner' : 'player',
              provider: 'password',
              createdAt: serverTimestamp(),
            },
            { merge: true }
          );
        }

        toast({ title: 'Account created successfully!' });
      }
    } catch (error: any) {
      let description = error.message;
      if (error.code === 'auth/email-already-in-use') {
        description =
          'This email is already associated with an account. Please log in or use a different email.';
      }
      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (firestore) {
        const userRef = doc(firestore, `users/${user.uid}`);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
          await setDoc(
            userRef,
            {
              id: user.uid,
              fullName: user.displayName,
              email: user.email,
              photoURL: user.photoURL,
              role: 'player', // Defaults to player on first Google sign-in
              provider: 'google',
              createdAt: serverTimestamp(),
            },
            { merge: true }
          );
        } else {
           await setDoc(
            userRef,
            { lastLoginAt: serverTimestamp() },
            { merge: true }
          );
        }
      }

      toast({ title: `Welcome, ${user.displayName}!` });
    } catch (error: any) {
      let description = 'Could not sign in with Google. Please try again.';
      if (error.code === 'auth/popup-blocked') {
        description = 'Popup was blocked by the browser. Please allow popups and try again.';
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        description = 'An account already exists with this email. Please sign in with your original method.';
      }
      toast({
        variant: 'destructive',
        title: 'Google Sign-In Failed',
        description,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isUserLoading || (currentUser && !isLoading)) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-green-900/20 via-gray-900 to-indigo-900/20 text-white flex flex-col items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 bg-gray-900/80 -z-10" />

      <div className="w-full max-w-md text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="h-14 w-14 rounded-xl bg-primary flex items-center justify-center">
            <Zap className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold italic tracking-tight">COURTFIND</h1>
        <p className="text-sm font-semibold text-primary tracking-[0.2em] mt-1">ELEVATE YOUR GAME</p>
      </div>

      <div className="w-full max-w-md mb-6">
        <div className="relative flex items-center justify-center w-full p-1 rounded-full bg-black/20 border border-white/10">
          <motion.div
            layout
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="absolute left-1 h-[85%] bg-primary rounded-full"
            style={{
              width: formMode === 'login' ? 'calc(50% - 4px)' : 'calc(50% - 4px)',
              left: formMode === 'login' ? '4px' : '50%',
            }}
          />
          <button
            onClick={() => setFormMode('login')}
            className="relative z-10 w-1/2 py-2 text-sm font-bold text-center rounded-full transition-colors"
          >
            LOGIN
          </button>
          <button
            onClick={() => setFormMode('signup')}
            className="relative z-10 w-1/2 py-2 text-sm font-bold text-center rounded-full transition-colors"
          >
            SIGN UP
          </button>
        </div>
      </div>

      <div className="w-full max-w-md p-8 rounded-3xl bg-black/20 border border-white/10 shadow-2xl backdrop-blur-lg min-h-[520px]">
        <div className="text-center mb-6 h-[72px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={formMode}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="text-2xl font-bold">{formMode === 'login' ? 'Welcome Back' : 'Join the Club'}</h2>
              <p className="text-white/60 text-sm mt-1">
                {formMode === 'login' ? 'Log in to reserve your next court.' : 'Create an account to start playing.'}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="space-y-4">
          <Button
            variant="outline"
            className="w-full h-12 rounded-xl bg-white/5 border-white/10 text-white hover:bg-white/10"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <GoogleIcon className="h-5 w-5 mr-2" />
                Continue with Google
              </>
            )}
          </Button>

          <div className="flex items-center">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink mx-4 text-white/40 text-xs">OR</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAuthAction();
            }}
            className="space-y-4"
          >
            <div
              className={`transition-all duration-300 ${
                formMode === 'signup' ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
              }`}
            >
              <div className="relative mb-4">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                <Input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
                  required={formMode === 'signup'}
                  className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  tabIndex={formMode === 'signup' ? 0 : -1}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isOwner"
                  checked={isOwner}
                  onCheckedChange={(checked) => setIsOwner(checked as boolean)}
                  className="border-white/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  tabIndex={formMode === 'signup' ? 0 : -1}
                />
                <Label
                  htmlFor="isOwner"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
                >
                  <Building className="mr-2 h-4 w-4 text-white/60" /> I am a court owner
                </Label>
              </div>
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                required
                className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/40"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                required
                minLength={6}
                className="pl-10 pr-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/40"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <div className="pt-2">
              <Button
                type="submit"
                size="lg"
                className="w-full h-12 rounded-xl text-base font-bold shadow-lg shadow-primary/20"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <>
                    {formMode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>

      <p className="w-full max-w-md text-center text-[10px] text-white/40 mt-8 tracking-wider">
        BY CONTINUING, YOU AGREE TO OUR TERMS OF SERVICE
      </p>
    </div>
  );
};

export default AuthPageSuspenseWrapper;
