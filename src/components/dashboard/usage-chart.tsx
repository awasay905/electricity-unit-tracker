'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ReferenceLine } from 'recharts';
import { useMemo } from 'react';
import type { Reading } from '@/lib/types';
import { BarChart3 } from 'lucide-react';

interface UsageChartProps {
  readings: Reading[];
  billingStartUnits: number;
}

export function UsageChart({ readings, billingStartUnits }: UsageChartProps) {
  const chartData = useMemo(() => {
    // Find the most recent billing cycle start reading
    const billingReadings = readings.filter(r => r.isBillingCycleStart)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const currentBillingStart = billingReadings[0];

    // If no billing start found, return empty chart
    if (!currentBillingStart) return [];

    // Get readings only from current billing cycle
    const currentCycleReadings = readings
      .filter(reading => new Date(reading.date) >= new Date(currentBillingStart.date))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Remove duplicate dates by keeping only the latest reading for each date
    const uniqueReadings = currentCycleReadings.reduce((acc, current) => {
      const date = new Date(current.date).toLocaleDateString('en-US');
      return { ...acc, [date]: current };
    }, {} as Record<string, Reading>);

    // Convert to chart data format
    return Object.values(uniqueReadings).map(reading => ({
      date: new Date(reading.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      'Usage This Cycle': reading.value - currentBillingStart.value,
      'Total Reading': reading.value,
    }));
  }, [readings, billingStartUnits]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
            <BarChart3 className="h-6 w-6"/>
            Usage This Cycle
        </CardTitle>
        <CardDescription>Your electricity consumption since the last billing date.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{
          'Usage This Cycle': {
            label: 'Usage (kWh)',
            color: 'hsl(var(--primary))',
          },
          'Total Reading': {
            label: 'Total (kWh)',
            color: 'hsl(var(--secondary))',
          }
        }} className="h-[250px] w-full">
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              domain={['dataMin', 'dataMax + 50']}
              tickFormatter={(value) => `${value}`}
              />
            <ChartTooltip cursor={false} content={<ChartTooltipContent 
                formatter={(value, name) => (
                    <div className="flex flex-col">
                        <span className="font-bold">{`${name}: ${Number(value).toFixed(2)} kWh`}</span>
                    </div>
                )}
            />} />
            <defs>
              <linearGradient id="fillUsage" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-Usage-This-Cycle)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-Usage-This-Cycle)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <ReferenceLine y={0} stroke="hsl(var(--border))" strokeDasharray="3 3" />
            <Area
              type="monotone"
              dataKey="Usage This Cycle"
              stroke="var(--color-Usage-This-Cycle)"
              fillOpacity={1}
              fill="url(#fillUsage)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
