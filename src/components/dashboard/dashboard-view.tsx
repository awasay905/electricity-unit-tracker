
'use client';

import type { House, Reading, User } from '@/lib/types';
import { StatCard } from './stat-card';
import { PacingGuide } from './pacing-guide';
import { ReadingForm } from './reading-form';
import { GoalForm } from './goal-form';
import { UsageChart } from './usage-chart';
import { useMemo } from 'react';
import { Zap, Target, Calendar } from 'lucide-react';
import { GoalProgress } from './goal-progress';

interface DashboardViewProps {
  user: User;
  house: House;
  readings: Reading[];
  members: User[];
  onAddReading: (reading: Omit<Reading, 'id'>) => void;
  onUpdateHouse: (house: Partial<House>) => void;
}

export function DashboardView({ user, house, readings, members, onAddReading, onUpdateHouse }: DashboardViewProps) {
  const sortedReadings = useMemo(() => [...readings].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [readings]);
  
  const latestReading = useMemo(() => sortedReadings[0] || { value: 0, date: new Date().toISOString() }, [sortedReadings]);
  
  const billingCycleStartReading = useMemo(() => {
    return [...sortedReadings]
        .filter(r => new Date(r.date) >= new Date(house.billingCycleStart.date))
        .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0] || { value: house.billingCycleStart.units, date: house.billingCycleStart.date};
  }, [sortedReadings, house.billingCycleStart]);


  const unitsConsumed = useMemo(() => {
      if (latestReading && latestReading.value > billingCycleStartReading.value) {
          return latestReading.value - billingCycleStartReading.value;
      }
      return 0;
  }, [latestReading, billingCycleStartReading]);

  const unitsLeft = useMemo(() => house.monthlyGoal - unitsConsumed, [house.monthlyGoal, unitsConsumed]);
  const goalReachedPercent = useMemo(() => house.monthlyGoal > 0 ? (unitsConsumed / house.monthlyGoal) * 100 : 0, [unitsConsumed, house.monthlyGoal]);

  const isOwner = user.uid === house.ownerId;

  return (
    <div className="w-full max-w-7xl space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold font-headline text-primary">{house.name}</h1>
        <p className="text-muted-foreground">Welcome back, {user.name}!</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Zap} title="Units Consumed" value={`${unitsConsumed.toFixed(2)} kWh`} />
        <StatCard icon={Target} title="Units Left" value={`${unitsLeft.toFixed(2)} kWh`} />
        <StatCard icon={Calendar} title="Last Reading" 
          value={`${Math.floor((new Date().getTime() - new Date(latestReading.date).getTime()) / (1000 * 60 * 60 * 24))} days ago.`} />
        <StatCard icon={Target} title="Goal Set" value={`${house.monthlyGoal} kWh`} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <GoalProgress title="Goal Reached" percentage={goalReachedPercent} />
        </div>
        <div className="lg:col-span-2">
           <PacingGuide monthlyGoal={house.monthlyGoal} currentUsage={unitsConsumed} billingStartDate={new Date(billingCycleStartReading.date)} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:grid-flow-row-dense">
        <div className="lg:col-span-2 lg:col-start-1">
            <UsageChart readings={readings} billingStartUnits={house.billingCycleStart.units} />
        </div>
        <div className="space-y-4 lg:col-span-1 lg:col-start-3">
            <ReadingForm onAddReading={onAddReading} lastReadingValue={latestReading.value} />
            {isOwner && <GoalForm house={house} onUpdateHouse={onUpdateHouse} />}
        </div>
      </div>
    </div>
  );
}
