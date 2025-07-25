'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { useMemo } from 'react';
import type { Reading } from '@/lib/types';
import { BarChart3 } from 'lucide-react';

interface UsageChartProps {
  readings: Reading[];
}

export function UsageChart({ readings }: UsageChartProps) {
  const chartData = useMemo(() => {
    return [...readings]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(reading => ({
        date: new Date(reading.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        usage: reading.value,
      }));
  }, [readings]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
            <BarChart3 className="h-6 w-6"/>
            Usage Over Time
        </CardTitle>
        <CardDescription>Total meter reading progression.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{
          usage: {
            label: 'Usage (kWh)',
            color: 'hsl(var(--primary))',
          },
        }} className="h-[250px] w-full">
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              domain={['dataMin - 100', 'dataMax + 100']}
              tickFormatter={(value) => `${value}`}
              />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <defs>
              <linearGradient id="fillUsage" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-usage)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-usage)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="usage"
              stroke="var(--color-usage)"
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
