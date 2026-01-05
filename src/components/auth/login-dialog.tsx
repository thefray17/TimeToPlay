'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import LoginForm from "./login-form";
import SignUpForm from "./signup-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type LoginDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Welcome</DialogTitle>
                    <DialogDescription>
                        Please log in or sign up to continue.
                    </DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="login" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="login">Login</TabsTrigger>
                        <TabsTrigger value="signup">Sign Up</TabsTrigger>
                    </TabsList>
                    <TabsContent value="login">
                        <LoginForm onSuccess={() => onOpenChange(false)} />
                    </TabsContent>
                    <TabsContent value="signup">
                        <SignUpForm onSuccess={() => onOpenChange(false)} />
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
