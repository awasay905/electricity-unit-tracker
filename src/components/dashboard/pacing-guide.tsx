
'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Gauge } from 'lucide-react';

interface PacingGuideProps {
    monthlyGoal: number;
    currentUsage: number;
    billingStartDate: Date;
}

type PaceStatus = 'Very High' | 'High' | 'On Track' | 'Low' | 'Very Low';

interface PaceInfo {
    status: PaceStatus;
    colorClass: string;
    description: string;
}

const paceScale: Record<PaceStatus, PaceInfo> = {
    'Very High': { status: 'Very High', colorClass: 'bg-red-500', description: 'Consumption is much higher than target pace.' },
    'High': { status: 'High', colorClass: 'bg-orange-500', description: 'Consumption is higher than target pace.' },
    'On Track': { status: 'On Track', colorClass: 'bg-accent', description: 'Consumption is on track to meet the goal.' },
    'Low': { status: 'Low', colorClass: 'bg-green-500', description: 'Consumption is lower than target pace. Great job!' },
    'Very Low': { status: 'Very Low', colorClass: 'bg-sky-400', description: 'Consumption is much lower than target pace. Excellent!' },
};

export function PacingGuide({ monthlyGoal, currentUsage, billingStartDate }: PacingGuideProps) {
    const { projectedUsage, paceInfo, progressValue } = useMemo(() => {
        const daysElapsed = Math.max(1, Math.ceil((new Date().getTime() - new Date(billingStartDate).getTime()) / (1000 * 3600 * 24)));
        const avgDailyUsage = currentUsage / daysElapsed;
        const projectedUsage = avgDailyUsage * 30; // Assuming 30-day cycle

        let status: PaceStatus = 'On Track';
        let progressValue = 50;

        if (monthlyGoal > 0) {
            const projectedPercent = (projectedUsage / monthlyGoal) * 100;
            if (projectedPercent > 150) {
                status = 'Very High';
                progressValue = 100;
            } else if (projectedPercent > 115) {
                status = 'High';
                progressValue = 80;
            } else if (projectedPercent > 95) {
                status = 'On Track';
                progressValue = 60;
            } else if (projectedPercent > 70) {
                status = 'Low';
                progressValue = 40;
            } else {
                status = 'Very Low';
                progressValue = 20;
            }
        }
        
        return {
            projectedUsage,
            paceInfo: paceScale[status],
            progressValue
        };

    }, [monthlyGoal, currentUsage, billingStartDate]);

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                    <Gauge className="h-6 w-6" />
                    Consumption Pacing Guide
                </CardTitle>
                <CardDescription>
                    Your projected usage for this cycle is <strong>{projectedUsage.toFixed(0)} kWh</strong> out of your {monthlyGoal} kWh goal.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center px-6">
                <div className='space-y-2'>
                    <Progress value={progressValue} className="h-3 [&>*]:transition-none" colorClass={paceInfo.colorClass} />
                    <div className="flex justify-between text-sm font-medium">
                        <span className={progressValue < 30 ? paceInfo.colorClass.replace('bg-', 'text-') : ''}>Very Low</span>
                        <span className={progressValue >= 30 && progressValue < 50 ? paceInfo.colorClass.replace('bg-', 'text-') : ''}>Low</span>
                        <span className={progressValue >= 50 && progressValue < 70 ? paceInfo.colorClass.replace('bg-', 'text-') : ''}>On Track</span>
                        <span className={progressValue >= 70 && progressValue < 90 ? paceInfo.colorClass.replace('bg-', 'text-') : ''}>High</span>
                        <span className={progressValue >= 90 ? paceInfo.colorClass.replace('bg-', 'text-') : ''}>Very High</span>
                    </div>
                </div>
                 <div className="text-center mt-4">
                    <p className="font-bold text-lg" style={{color: paceInfo.colorClass.startsWith('bg-') ? paceInfo.colorClass === 'bg-accent' ? 'hsl(var(--accent))' : `var(--${paceInfo.colorClass.substring(3, paceInfo.colorClass.lastIndexOf('-'))}-500)`: 'inherit'}}>{paceInfo.status}</p>
                    <p className="text-sm text-muted-foreground">{paceInfo.description}</p>
                </div>
            </CardContent>
        </Card>
    );
}
