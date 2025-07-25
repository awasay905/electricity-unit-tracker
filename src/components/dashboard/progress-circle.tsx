'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Target } from 'lucide-react';
import { Label, RadialBar, RadialBarChart } from 'recharts';

interface ProgressCircleProps {
  percentage: number;
  title: string;
}

export function ProgressCircle({ percentage, title }: ProgressCircleProps) {
  const chartData = [{ name: 'Goal', value: percentage, fill: 'hsl(var(--primary))' }];
  const fillPercentage = Math.min(Math.max(percentage, 0), 100);

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
            <Target className="h-6 w-6"/>
            {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex items-center justify-center">
        <ChartContainer
          config={{
            Goal: {
              label: 'Goal',
              color: 'hsl(var(--primary))',
            },
          }}
          className="mx-auto aspect-square w-full max-w-[250px]"
        >
          <RadialBarChart
            data={chartData}
            startAngle={90}
            endAngle={-270}
            innerRadius="70%"
            outerRadius="100%"
            barSize={20}
            cy="50%"
          >
            <RadialBar
              dataKey="value"
              background={{ fill: 'hsl(var(--muted))' }}
              cornerRadius={10}
            >
                <Label
                    content={({ viewBox }) => {
                        if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                            return (
                                <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                    <tspan
                                        x={viewBox.cx}
                                        y={viewBox.cy}
                                        className="text-4xl font-bold font-headline"
                                        fill="hsl(var(--foreground))"
                                    >
                                        {fillPercentage.toFixed(0)}%
                                    </tspan>
                                </text>
                            )
                        }
                        return null;
                    }}
                />
            </RadialBar>
            <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
            />
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
