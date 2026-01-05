'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/header';
import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import LoginForm from '@/components/auth/login-form';
import SignUpForm from '@/components/auth/signup-form';
import { getAuth, signOut } from "firebase/auth";
import { Separator } from '@/components/ui/separator';

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  const handleLogout = async () => {
    const auth = getAuth();
    await signOut(auth);
    router.push('/');
  };

  if (isUserLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <>
      <Header />
      <main className="container max-w-5xl mx-auto px-4 py-8">
        {user ? (
          <div>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold">Welcome!</h1>
                <p className="text-muted-foreground">{user.email || 'No email provided'}</p>
              </div>
              <Button onClick={handleLogout} variant="outline">Logout</Button>
            </div>
            <Separator />
            <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Account Settings</h2>
                <p className="text-muted-foreground">Manage your account details here. (Coming Soon)</p>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <h2 className="text-2xl font-bold mb-4">Login</h2>
              <LoginForm />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-4">Sign Up</h2>
              <SignUpForm />
            </div>
          </div>
        )}
      </main>
    </>
  );
}
