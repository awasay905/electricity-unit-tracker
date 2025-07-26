'use client';

import { useState } from 'react';
import type { User, House } from '@/lib/types';
import { CreateHouse } from './create-house';
import { JoinHouse } from './join-house';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bolt } from 'lucide-react';

interface OnboardingProps {
  user: User;
  onComplete: (house: House) => void;
}

export function Onboarding({ user, onComplete }: OnboardingProps) {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center bg-background p-4">
        <div className="text-center mb-8">
             <div className="mx-auto mb-4 inline-flex items-center justify-center rounded-full bg-primary p-3">
                <Bolt className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold font-headline text-primary">Welcome, {user.name}!</h1>
            <p className="text-muted-foreground">Let's get you set up. Create a new household or join an existing one.</p>
        </div>
        <Tabs defaultValue="create" className="w-full max-w-md">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="create">Create House</TabsTrigger>
                <TabsTrigger value="join">Join House</TabsTrigger>
            </TabsList>
            <TabsContent value="create">
                <CreateHouse user={user} onHouseCreated={onComplete} />
            </TabsContent>
            <TabsContent value="join">
                <JoinHouse user={user} onHouseJoined={onComplete} />
            </TabsContent>
        </Tabs>
    </div>
  );
}
