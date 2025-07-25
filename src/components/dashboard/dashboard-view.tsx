'use client';

import type { House, Reading, User } from '@/lib/types';
import { StatCard } from './stat-card';
import { ProgressCircle } from './progress-circle';
import { SafetyGauge } from './safety-gauge';
import { ReadingForm } from './reading-form';
import { GoalForm } from './goal-form';
import { UsageChart } from './usage-chart';
import { useMemo } from 'react';
import { Home, Zap, Calendar, Target, Users } from 'lucide-react';

interface DashboardViewProps {
  user: User;
  house: House;
  readings: Reading[];
  members: User[];
  onAddReading: (reading: Reading) => void;
  onUpdateHouse: (house: Partial<House>) => void;
}

export function DashboardView({ user, house, readings, members, onAddReading, onUpdateHouse }: DashboardViewProps) {
  const sortedReadings = useMemo(() => [...readings].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [readings]);
  const latestReading = sortedReadings[0] || { value: 0, date: new Date().toISOString() };
  
  const billingCycleStartReading = useMemo(() => {
    return [...sortedReadings].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .find(r => r.isBillingCycleStart) || { value: 0, date: new Date().toISOString() };
  }, [sortedReadings]);

  const unitsConsumed = useMemo(() => {
      if (latestReading && billingCycleStartReading && latestReading.value > billingCycleStartReading.value) {
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Zap} title="Units Consumed" value={`${unitsConsumed.toFixed(2)} kWh`} />
        <StatCard icon={Target} title="Units Left" value={`${unitsLeft.toFixed(2)} kWh`} />
        <StatCard icon={Calendar} title="Last Reading" value={new Date(latestReading.date).toLocaleDateString('en-US')} />
        <StatCard icon={Users} title="Members" value={members.length.toString()} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <ProgressCircle title="Goal Reached" percentage={goalReachedPercent} />
        </div>
        <div className="lg:col-span-2">
           <SafetyGauge monthlyGoal={house.monthlyGoal} currentUsage={unitsConsumed} readings={readings} billingStartDate={new Date(billingCycleStartReading.date)} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2">
            <UsageChart readings={readings} />
        </div>
        <div className="space-y-4">
            <ReadingForm onAddReading={onAddReading} lastReadingValue={latestReading.value} />
            {isOwner && <GoalForm house={house} onUpdateHouse={onUpdateHouse} />}
        </div>
      </div>
    </div>
  );
}
