'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Target } from 'lucide-react';

interface GoalProgressProps {
  percentage: number;
  title: string;
}

export function GoalProgress({ percentage, title }: GoalProgressProps) {
  const fillPercentage = Math.min(Math.max(percentage, 0), 100);
  
  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
            <Target className="h-6 w-6"/>
            {title}
        </CardTitle>
        <CardDescription>
            You have used {fillPercentage.toFixed(0)}% of your monthly goal.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center px-6">
        <div className="flex items-center gap-4">
            <Progress value={fillPercentage} className="h-4 flex-1" />
            <span className="text-xl font-bold font-headline text-primary">
                {fillPercentage.toFixed(0)}%
            </span>
        </div>
      </CardContent>
    </Card>
  );
}
