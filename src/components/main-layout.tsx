'use client';

import { useState, useEffect } from 'react';
import { DashboardView } from '@/components/dashboard/dashboard-view';
import { SettingsView } from '@/components/settings/settings-view';
import type { House, Reading, User, JoinRequest } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from './ui/button';
import { Settings } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from './ui/sheet';
import { ScrollArea } from './ui/scroll-area';
import { useAuth } from '@/hooks/use-auth';
import * as firestore from '@/lib/firebase/firestore';
import { Onboarding } from './onboarding/onboarding';

export function MainLayout() {
  const { user, loading } = useAuth();
  const [house, setHouse] = useState<House | null>(null);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [appLoading, setAppLoading] = useState(true);

  useEffect(() => {
    if (loading || !user) return;

    const fetchData = async () => {
        if (user.houseId) {
            const houseData = await firestore.getHouse(user.houseId);
            setHouse(houseData);
            if (houseData) {
              const readingsData = await firestore.getReadings(houseData.id);
              setReadings(readingsData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
              const membersData = await firestore.getHouseMembers(houseData.id);
              setMembers(membersData);
              if (user.uid === houseData.ownerId) {
                const requests = await firestore.getJoinRequests(houseData.id);
                setJoinRequests(requests);
              }
            }
        }
        setAppLoading(false);
    };

    fetchData();
  }, [user, loading]);

  const handleAddReading = async (newReading: Omit<Reading, 'id'>) => {
    if (!house) return;
    const addedReading = await firestore.addReading(house.id, newReading);
    if (addedReading) {
      setReadings((prev) => [...prev, addedReading].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }
  };
  
  const handleUpdateReading = async (readingId: string, updates: Partial<Pick<Reading, 'value' | 'date'>>) => {
    if (!house) return;
    await firestore.updateReading(house.id, readingId, updates);
    setReadings(prev => prev.map(r => r.id === readingId ? { ...r, ...updates } : r).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const handleDeleteReading = async (readingId: string) => {
    if (!house) return;
    // Optimistically remove billing cycle start readings as they cannot be deleted.
    const readingToDelete = readings.find(r => r.id === readingId);
    if (readingToDelete?.isBillingCycleStart) return;

    await firestore.deleteReading(house.id, readingId);
    setReadings(prev => prev.filter(r => r.id !== readingId));
  };

  const handleUpdateHouse = async (updates: Partial<House>) => {
    if (!house) return;
    await firestore.updateHouse(house.id, updates);
    setHouse((prev) => prev ? { ...prev, ...updates } : null);
    
    if (updates.billingCycleStart) {
        const newBillingReading = {
            value: updates.billingCycleStart.units,
            date: updates.billingCycleStart.date,
            isBillingCycleStart: true,
        };
        const addedReading = await firestore.addReading(house.id, newBillingReading);
        if (addedReading) {
            setReadings((prev) => [...prev, addedReading].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        }
    }
  };

  const handleUpdateRequestStatus = async (requestId: string, status: 'approved' | 'rejected') => {
    const request = joinRequests.find(r => r.requestId === requestId);
    if (!request) return;

    await firestore.updateJoinRequest(requestId, status);

    if (status === 'approved' && request.requesterId) {
        await firestore.addUserToHouse(request.requesterId, request.houseId);
        const newMember = await firestore.getUser(request.requesterId);
        if (newMember) setMembers(prev => [...prev, newMember]);
    }

    setJoinRequests((prev) => prev.filter((req) => req.requestId !== requestId));
  };

  const handleRemoveMember = async (uid: string) => {
    if (!house || uid === house.ownerId) return;
    await firestore.removeUserFromHouse(uid);
    setMembers((prev) => prev.filter((member) => member.uid !== uid));
  };
  
  const handleUpdateUserName = async (name: string) => {
    if (!user) return;
    await firestore.updateUser(user.uid, { name });
    // This should trigger a re-fetch or context update in a more robust app
    window.location.reload();
  }

  const handleOnboardingComplete = (houseData: House) => {
      setHouse(houseData);
      // In a real app, user object should be updated too
      if (user) user.houseId = houseData.id;
  }

  if (appLoading || loading) {
    return (
      <Card className="w-full max-w-md mx-auto mt-10">
        <CardContent className="p-6 text-center">
          <p>Loading your Voltracker dashboard...</p>
        </CardContent>
      </Card>
    );
  }
  
  if (!user) {
    // This case should ideally be handled by routing, but as a fallback:
     return (
      <Card className="w-full max-w-md mx-auto mt-10">
        <CardContent className="p-6 text-center">
          <p>Please log in to continue.</p>
        </CardContent>
      </Card>
    );
  }

  if (!house) {
    return <Onboarding user={user} onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="w-full max-w-7xl">
      <DashboardView
        user={user}
        house={house}
        readings={readings}
        members={members}
        onAddReading={handleAddReading}
        onUpdateHouse={handleUpdateHouse}
      />

      <Sheet onOpenChange={async (open) => {
          if (open && house && user.uid === house.ownerId) {
            // Refresh join requests when settings is opened
            const requests = await firestore.getJoinRequests(house.id);
            setJoinRequests(requests);
          }
        }}>
        <SheetTrigger asChild>
           <Button variant="outline" className="w-full mt-6 py-6 text-lg">
                <Settings className="mr-2 h-5 w-5" />
                Manage House Settings
            </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[90vh] flex flex-col">
           <SheetHeader>
            <SheetTitle className="text-center text-2xl font-headline">Settings</SheetTitle>
           </SheetHeader>
          <ScrollArea className="flex-1">
             <div className="p-4">
              <SettingsView
                user={user}
                house={house}
                members={members}
                joinRequests={joinRequests}
                readings={readings}
                onUpdateRequestStatus={handleUpdateRequestStatus}
                onRemoveMember={handleRemoveMember}
                onUpdateHouseName={(name) => handleUpdateHouse({ name })}
                onUpdateUserName={handleUpdateUserName}
                onUpdateReading={handleUpdateReading}
                onDeleteReading={handleDeleteReading}
              />
             </div>
          </ScrollArea>
           <SheetClose asChild>
              <Button variant="outline" className="m-4">Close</Button>
           </SheetClose>
        </SheetContent>
      </Sheet>
    </div>
  );
}
