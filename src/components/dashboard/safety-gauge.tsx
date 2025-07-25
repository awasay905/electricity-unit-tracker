'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Label, RadialBar, RadialBarChart } from 'recharts';
import type { Reading } from '@/lib/types';
import { ShieldCheck, ShieldAlert, ShieldX, Loader2 } from 'lucide-react';
import { run } from '@genkit-ai/next/client';
import { energyConsumptionSafetyGauge } from '@/ai/flows/energy-consumption-safety-gauge';

interface SafetyGaugeProps {
    monthlyGoal: number;
    currentUsage: number;
    readings: Reading[];
    billingStartDate: Date;
}

type SafetyLevel = 'Safe' | 'Warning' | 'Danger' | 'Unknown';
interface SafetyData {
    level: SafetyLevel;
    recommendation: string;
    projectedUsage: number;
}

const safetyConfig: Record<SafetyLevel, {
    color: string;
    icon: React.ElementType;
    label: string;
}> = {
    Safe: { color: 'hsl(142.1, 76.2%, 36.3%)', icon: ShieldCheck, label: 'Safe' },
    Warning: { color: 'hsl(var(--accent))', icon: ShieldAlert, label: 'Warning' },
    Danger: { color: 'hsl(var(--destructive))', icon: ShieldX, label: 'Danger' },
    Unknown: { color: 'hsl(var(--muted-foreground))', icon: ShieldAlert, label: 'N/A' },
};

export function SafetyGauge({ monthlyGoal, currentUsage, readings, billingStartDate }: SafetyGaugeProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [safetyData, setSafetyData] = useState<SafetyData | null>(null);

    const handleAnalysis = async () => {
        setIsLoading(true);
        setSafetyData(null);
        try {
            const daysElapsed = Math.ceil((new Date().getTime() - billingStartDate.getTime()) / (1000 * 3600 * 24));
            const historicalData = JSON.stringify(readings.map(r => ({ date: r.date, usage: r.value })));
            
            const result = await run(energyConsumptionSafetyGauge, {
                monthlyGoal,
                currentUsage,
                daysElapsed,
                historicalUsageData: historicalData,
            });

            setSafetyData({
                level: result.safetyLevel as SafetyLevel,
                recommendation: result.recommendation,
                projectedUsage: result.projectedUsage,
            });

        } catch (error) {
            console.error("AI analysis failed:", error);
            setSafetyData({
                level: 'Unknown',
                recommendation: 'Could not perform analysis. Please try again.',
                projectedUsage: 0,
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const level = safetyData?.level || 'Unknown';
    const Icon = safetyConfig[level].icon;
    const chartData = [{ name: 'Safety', value: safetyData ? 100 : 0, fill: safetyConfig[level].color }];

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                    <Icon className="h-6 w-6" />
                    AI Safety Gauge
                </CardTitle>
                <CardDescription>Get an AI-powered analysis of your consumption habits.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div className="flex flex-col items-center justify-center text-center">
                    {isLoading ? (
                        <div className="flex flex-col items-center gap-2">
                           <Loader2 className="h-10 w-10 animate-spin text-primary" />
                           <p className="text-muted-foreground">Analyzing...</p>
                        </div>
                    ) : safetyData ? (
                        <div className="space-y-2">
                             <p className="font-bold text-lg" style={{ color: safetyConfig[level].color }}>
                                {safetyData.level}
                            </p>
                            <p className="text-sm">{safetyData.recommendation}</p>
                            <p className="text-sm text-muted-foreground">
                                Projected Usage: {safetyData.projectedUsage.toFixed(2)} / {monthlyGoal} kWh
                            </p>
                        </div>
                    ) : (
                         <p className="text-muted-foreground">Click the button to analyze your energy usage.</p>
                    )}
                </div>
                <div className="flex items-center justify-center">
                     <ChartContainer config={{}} className="mx-auto aspect-square w-full max-w-[200px]">
                        <RadialBarChart data={chartData} innerRadius="80%" outerRadius="100%" startAngle={90} endAngle={450}>
                            <RadialBar dataKey="value" background={{ fill: 'hsl(var(--muted))' }} cornerRadius={10} />
                             <Label
                                content={({ viewBox }) => {
                                    if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                                        return (
                                            <g>
                                                <Icon
                                                    x={viewBox.cx - 20}
                                                    y={viewBox.cy - 20}
                                                    height={40}
                                                    width={40}
                                                    color={safetyConfig[level].color}
                                                />
                                            </g>
                                        );
                                    }
                                    return null;
                                }}
                            />
                        </RadialBarChart>
                    </ChartContainer>
                </div>
            </CardContent>
            <div className="p-6 pt-0">
                <Button onClick={handleAnalysis} disabled={isLoading} className="w-full">
                    {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait</> : 'Run AI Analysis'}
                </Button>
            </div>
        </Card>
    );
}
