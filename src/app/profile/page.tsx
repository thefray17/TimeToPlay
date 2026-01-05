'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, signOut } from 'firebase/auth';
import { useUser } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  Sparkles,
  Zap,
  Users,
  MoveUpRight,
  Settings,
  CreditCard,
  Bell,
  Shield,
  ChevronRight,
  LogOut,
  Loader2
} from 'lucide-react';
import Header from '@/components/layout/header';


const ProfileHeader = ({ user }: { user: any }) => (
    <div className="flex flex-col items-center text-center">
        <div className="relative mb-4">
            <div className="absolute -inset-2 rounded-full bg-gradient-to-br from-green-300 via-amber-200 to-pink-300 blur-md opacity-70" />
            <Avatar className="w-24 h-24 border-4 border-background relative z-10">
                <AvatarImage src={user.photoURL} alt={user.displayName} />
                <AvatarFallback>
                    {user.displayName?.split(' ').map((n: string) => n[0]).join('')}
                </AvatarFallback>
            </Avatar>
            <div className="absolute bottom-1 right-1 z-20 h-7 w-7 rounded-full bg-primary flex items-center justify-center border-2 border-background">
                <Sparkles className="h-4 w-4 text-white fill-white" />
            </div>
        </div>
        <h1 className="text-2xl font-bold">{user.displayName || 'Player'}</h1>
        <div className="flex items-center gap-2 mt-2">
            <Badge className="bg-green-100 text-green-800 hover:bg-green-200">PRO MEMBER</Badge>
            <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200">RANK #12</Badge>
        </div>
    </div>
);


const StatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        <Card className="bg-gray-800 text-white rounded-3xl overflow-hidden relative border-gray-700">
            <CardContent className="p-6 relative z-10">
                <p className="text-xs font-bold text-primary tracking-wider">YOUR CREW</p>
                <h3 className="text-2xl font-bold mt-1">Baseline Elites</h3>
                <div className="flex items-center mt-4">
                    <div className="flex -space-x-2">
                        <Avatar className="h-6 w-6 border-2 border-gray-800">
                            <AvatarImage src="https://i.pravatar.cc/32?u=a" />
                        </Avatar>
                        <Avatar className="h-6 w-6 border-2 border-gray-800">
                             <AvatarImage src="https://i.pravatar.cc/32?u=b" />
                        </Avatar>
                         <Avatar className="h-6 w-6 border-2 border-gray-800">
                             <AvatarImage src="https://i.pravatar.cc/32?u=c" />
                        </Avatar>
                    </div>
                    <span className="text-xs text-gray-400 ml-2">+8 more</span>
                </div>
                 <Button variant="ghost" size="icon" className="absolute bottom-4 right-4 h-8 w-8 text-gray-400 hover:bg-white/10 hover:text-white">
                    <MoveUpRight className="h-4 w-4" />
                </Button>
            </CardContent>
            <div className="absolute -top-4 -right-8 w-32 h-32 rounded-full bg-white/5" />
        </Card>
        <Card className="bg-card rounded-3xl border">
            <CardContent className="p-6 text-center">
                <div className="inline-flex p-3 bg-orange-100 dark:bg-orange-900/50 rounded-full mb-2">
                    <Zap className="h-6 w-6 text-orange-500" />
                </div>
                <p className="text-xs font-bold text-muted-foreground tracking-wider">TOTAL PLAYTIME</p>
                <p className="text-4xl font-extrabold mt-1">124 <span className="text-2xl text-muted-foreground">hrs</span></p>
            </CardContent>
        </Card>
    </div>
);


const AccountRow = ({ icon: Icon, title, subtitle, onClick }: { icon: React.ElementType, title: string, subtitle: string, onClick: () => void }) => (
    <div onClick={onClick} className="flex items-center p-4 bg-card rounded-2xl border hover:bg-secondary/50 transition-colors cursor-pointer">
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
    const { user, isUserLoading } = useUser();
    const router = useRouter();
    const { toast } = useToast();

    React.useEffect(() => {
        if (!isUserLoading && !user) {
            router.replace('/auth?redirect=/profile');
        }
    }, [user, isUserLoading, router]);

    const handleLogout = async () => {
        const auth = getAuth();
        await signOut(auth);
        toast({ title: "You've been signed out." });
        router.push('/');
    };

    const handleComingSoon = () => {
        toast({ title: 'Coming Soon!', description: 'This feature is under development.' });
    };
    
    if (isUserLoading || !user) {
        return (
            <div className="flex items-center justify-center h-screen bg-background">
                 <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const accountItems = [
        { icon: Settings, title: "Settings", subtitle: "APP PREFERENCES & ACCOUNT" },
        { icon: CreditCard, title: "Payment Methods", subtitle: "MANAGE CARDS & BILLING" },
        { icon: Bell, title: "Notifications", subtitle: "BOOKING ALERTS & UPDATES" },
        { icon: Shield, title: "Privacy & Security", subtitle: "DATA & PASSWORD" },
    ];

    return (
        <div className="bg-background min-h-screen">
            <Header showLocation={false}/>
            <main className="container max-w-2xl mx-auto px-4 py-8">
                <ProfileHeader user={user} />
                <StatsCards />

                <div className="my-8">
                    <p className="text-sm font-semibold text-muted-foreground tracking-[0.2em] mb-4 text-center">ACCOUNT MANAGEMENT</p>
                    <div className="space-y-3">
                        {accountItems.map(item => (
                             <AccountRow 
                                key={item.title} 
                                icon={item.icon} 
                                title={item.title} 
                                subtitle={item.subtitle}
                                onClick={handleComingSoon}
                            />
                        ))}
                    </div>
                </div>

                <div className="mt-12">
                     <Button
                        variant="outline"
                        className="w-full h-14 rounded-2xl text-base font-bold text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/50"
                        onClick={handleLogout}
                     >
                        <LogOut className="mr-2 h-5 w-5" />
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
