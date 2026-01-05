'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ArrowRight, Lock, Mail, User as UserIcon, Zap, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';

const AuthPageSuspenseWrapper = () => (
  <Suspense fallback={<div className="h-screen w-full bg-gray-900" />}>
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

  const [formMode, setFormMode] = useState<'login' | 'signup'>(mode === 'signup' ? 'signup' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  if (isUserLoading) {
    return <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm"><Loader2 className="h-8 w-8 animate-spin text-white" /></div>;
  }
  
  if (currentUser) {
    router.replace(redirect);
    return <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm"><Loader2 className="h-8 w-8 animate-spin text-white" /></div>;
  }


  const handleAuthAction = async () => {
    setIsLoading(true);
    const auth = getAuth();
    try {
      if (formMode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: 'Welcome back!' });
      } else {
        if (fullName.length < 2) throw new Error("Full name must be at least 2 characters.");
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: fullName });

        if (firestore) {
          const userRef = doc(firestore, `users/${userCredential.user.uid}`);
          await setDoc(userRef, {
            id: userCredential.user.uid,
            fullName,
            email,
            createdAt: serverTimestamp()
          });
        }
        
        toast({ title: 'Account created successfully!' });
      }

      // Handle pending booking after login/signup
      const pendingBooking = localStorage.getItem('cf_pending_booking');
      if (pendingBooking) {
        const { courtId, dateKey, startTime, durationHours } = JSON.parse(pendingBooking);
        // In a real app, we'd now create the booking using this data
        // For now, we'll just redirect to checkout as if it were created.
        const mockBookingId = 'mock_id_after_login';
        localStorage.removeItem('cf_pending_booking');
        router.push(`/checkout?bookingId=${mockBookingId}`);
      } else {
        router.push(redirect);
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-green-900/20 via-gray-900 to-indigo-900/20 text-white flex flex-col items-center justify-center p-4 overflow-hidden">
        <div className="absolute inset-0 bg-gray-900/80 -z-10" />

      <div className="w-full max-w-md text-center mb-8">
        <div className="flex justify-center mb-4">
            <div className="h-14 w-14 rounded-xl bg-primary flex items-center justify-center">
                <Zap className="h-8 w-8 text-white" />
            </div>
        </div>
        <h1 className="text-3xl font-bold italic tracking-tight">COURT FINDER</h1>
        <p className="text-sm font-semibold text-primary tracking-[0.2em] mt-1">ELEVATE YOUR GAME</p>
      </div>

      <div className="w-full max-w-md mb-6">
        <div className="relative flex items-center justify-center w-full p-1 rounded-full bg-black/20 border border-white/10">
          <motion.div
            layout
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="absolute left-1 h-[85%] bg-primary rounded-full"
            style={{ width: formMode === 'login' ? 'calc(50% - 4px)' : 'calc(50% - 4px)', left: formMode === 'login' ? '4px' : '50%' }}
          />
          <button onClick={() => setFormMode('login')} className="relative z-10 w-1/2 py-2 text-sm font-bold text-center rounded-full transition-colors">LOGIN</button>
          <button onClick={() => setFormMode('signup')} className="relative z-10 w-1/2 py-2 text-sm font-bold text-center rounded-full transition-colors">SIGN UP</button>
        </div>
      </div>

      <div className="w-full max-w-md p-8 rounded-3xl bg-black/20 border border-white/10 shadow-2xl backdrop-blur-lg">
        <div className="text-center mb-6 h-[72px]">
            <AnimatePresence mode="wait">
                <motion.div
                    key={formMode}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                >
                    <h2 className="text-2xl font-bold">
                        {formMode === 'login' ? 'Welcome Back' : 'Join the Club'}
                    </h2>
                    <p className="text-white/60 text-sm mt-1">
                        {formMode === 'login' ? 'Log in to reserve your next court.' : 'Create an account to start playing.'}
                    </p>
                </motion.div>
            </AnimatePresence>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleAuthAction(); }} className="space-y-4">
          <div className={`transition-opacity duration-300 ${formMode === 'signup' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
              <Input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required={formMode === 'signup'}
                className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                tabIndex={formMode === 'signup' ? 0 : -1}
              />
            </div>
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="pl-10 pr-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/40"
            />
             <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60">
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          <div className="pt-2">
            <Button type="submit" size="lg" className="w-full h-12 rounded-xl text-base font-bold shadow-lg shadow-primary/20" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : 
                <>
                  {formMode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              }
            </Button>
          </div>
        </form>
      </div>

      <p className="w-full max-w-md text-center text-[10px] text-white/40 mt-8 tracking-wider">
        BY CONTINUING, YOU AGREE TO OUR TERMS OF SERVICE
      </p>
    </div>
  );
};

export default AuthPageSuspenseWrapper;
