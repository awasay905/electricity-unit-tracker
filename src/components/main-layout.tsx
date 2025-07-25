'use client';

import { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardView } from '@/components/dashboard/dashboard-view';
import { SettingsView } from '@/components/settings/settings-view';
import type { House, Reading, User } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';

// --- MOCK DATA ---
const MOCK_USER_ID = 'user_1';
const MOCK_OWNER_ID = 'user_1';
const MOCK_HOUSE_ID = 'house_1';

const MOCK_USERS: User[] = [
  { uid: 'user_1', name: 'Alex Johnson', email: 'alex@example.com', houseId: MOCK_HOUSE_ID },
  { uid: 'user_2', name: 'Maria Garcia', email: 'maria@example.com', houseId: MOCK_HOUSE_ID },
];

const MOCK_INITIAL_READINGS: Reading[] = [
  { id: 'read_1', value: 15000, date: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(), isBillingCycleStart: true },
  { id: 'read_2', value: 15050, date: new Date(new Date().setDate(new Date().getDate() - 20)).toISOString(), isBillingCycleStart: false },
  { id: 'read_3', value: 15110, date: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(), isBillingCycleStart: false },
  { id: 'read_4', value: 15180, date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(), isBillingCycleStart: false },
];

const MOCK_HOUSE: House = {
  id: MOCK_HOUSE_ID,
  name: "The Power House",
  ownerId: MOCK_OWNER_ID,
  joinCode: 'AbCdEf12',
  monthlyGoal: 300,
  billingCycleStart: {
      date: MOCK_INITIAL_READINGS[0].date,
      units: MOCK_INITIAL_READINGS[0].value,
  }
};

const MOCK_JOIN_REQUESTS = [
    { requestId: 'req_1', houseId: MOCK_HOUSE_ID, requesterName: 'Charlie Brown', status: 'pending' as const },
    { requestId: 'req_2', houseId: MOCK_HOUSE_ID, requesterName: 'Dana Scully', status: 'pending' as const },
];
// --- END MOCK DATA ---


export function MainLayout() {
  const [user] = useState<User>(MOCK_USERS[0]);
  const [house, setHouse] = useState<House>(MOCK_HOUSE);
  const [readings, setReadings] = useState<Reading[]>(MOCK_INITIAL_READINGS);
  const [members, setMembers] = useState<User[]>(MOCK_USERS);
  const [joinRequests, setJoinRequests] = useState(MOCK_JOIN_REQUESTS);

  const handleAddReading = (newReading: Reading) => {
    setReadings(prev => [...prev, newReading]);
  };

  const handleUpdateHouse = (updates: Partial<House>) => {
    setHouse(prev => ({ ...prev, ...updates }));
    if(updates.billingCycleStart) {
        const newBillingReading: Reading = {
            id: `reading_billing_${Date.now()}`,
            value: updates.billingCycleStart.units,
            date: updates.billingCycleStart.date,
            isBillingCycleStart: true
        }
        setReadings(prev => [...prev, newBillingReading]);
    }
  };
  
  const handleUpdateRequestStatus = (requestId: string, status: 'approved' | 'rejected') => {
      setJoinRequests(prev => prev.filter(req => req.requestId !== requestId));
      // In a real app, if approved, a new member would be added.
      console.log(`Request ${requestId} ${status}`);
  };

  const handleRemoveMember = (uid: string) => {
      if (uid === house.ownerId) {
          console.error("Cannot remove the owner.");
          return;
      }
      setMembers(prev => prev.filter(member => member.uid !== uid));
  };

  if (!user || !house) {
    // In a real app, this would be a loading state or a prompt to create/join a house
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-6 text-center">
          <p>Loading user data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Tabs defaultValue="dashboard" className="w-full max-w-7xl">
      <div className="flex justify-center">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="dashboard" className="mt-6">
        <DashboardView
          user={user}
          house={house}
          readings={readings}
          members={members}
          onAddReading={handleAddReading}
          onUpdateHouse={handleUpdateHouse}
        />
      </TabsContent>
      <TabsContent value="settings" className="mt-6">
        <SettingsView
          user={user}
          house={house}
          members={members}
          joinRequests={joinRequests}
          onUpdateRequestStatus={handleUpdateRequestStatus}
          onRemoveMember={handleRemoveMember}
          onUpdateHouseName={(name) => handleUpdateHouse({ name })}
          onUpdateUserName={(name) => console.log('Update user name:', name)}
        />
      </TabsContent>
    </Tabs>
  );
}
