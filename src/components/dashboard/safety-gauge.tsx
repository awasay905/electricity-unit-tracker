
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChartContainer } from '@/components/ui/chart';
import { Label, RadialBar, RadialBarChart } from 'recharts';
import type { Reading } from '@/lib/types';
import { Bot, Zap, TrendingUp, Loader2 } from 'lucide-react';
import { runFlow } from '@genkit-ai/next/client';
import { getConsumptionPace } from '@/ai/flows/energy-consumption-safety-gauge';

interface PacingAnalysisProps {
    monthlyGoal: number;
    currentUsage: number;
    billingStartDate: Date;
}

type PaceStatus = 'On Track' | 'Slightly High' | 'High' | 'Unknown';
interface PaceData {
    status: PaceStatus;
    analysis: string;
    projectedUsage: number;
}

const paceConfig: Record<PaceStatus, {
    color: string;
    icon: React.ElementType;
}> = {
    'On Track': { color: 'hsl(142.1, 76.2%, 36.3%)', icon: Zap },
    'Slightly High': { color: 'hsl(var(--accent))', icon: TrendingUp },
    'High': { color: 'hsl(var(--destructive))', icon: TrendingUp },
    'Unknown': { color: 'hsl(var(--muted-foreground))', icon: Bot },
};

export function SafetyGauge({ monthlyGoal, currentUsage, billingStartDate }: PacingAnalysisProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [paceData, setPaceData] = useState<PaceData | null>(null);

    const handleAnalysis = async () => {
        setIsLoading(true);
        setPaceData(null);
        try {
            const daysElapsed = Math.ceil((new Date().getTime() - billingStartDate.getTime()) / (1000 * 3600 * 24)) || 1;
            
            const result = await runFlow(getConsumptionPace, {
                monthlyGoal,
                currentUsage,
                daysElapsed,
            });

            setPaceData({
                status: result.paceStatus as PaceStatus,
                analysis: result.analysis,
                projectedUsage: result.projectedUsage,
            });

        } catch (error) {
            console.error("AI analysis failed:", error);
            setPaceData({
                status: 'Unknown',
                analysis: 'Could not perform analysis. Please try again.',
                projectedUsage: 0,
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const status = paceData?.status || 'Unknown';
    const Icon = paceConfig[status].icon;
    const projectedPercentage = monthlyGoal > 0 ? (paceData?.projectedUsage ?? 0) / monthlyGoal * 100 : 0;
    const chartData = [{ name: 'Pace', value: projectedPercentage, fill: paceConfig[status].color }];

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                    <Bot className="h-6 w-6" />
                    AI Pacing Analysis
                </CardTitle>
                <CardDescription>Get an AI-powered analysis of your consumption pace.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div className="flex flex-col items-center justify-center text-center">
                    {isLoading ? (
                        <div className="flex flex-col items-center gap-2">
                           <Loader2 className="h-10 w-10 animate-spin text-primary" />
                           <p className="text-muted-foreground">Analyzing...</p>
                        </div>
                    ) : paceData ? (
                        <div className="space-y-2">
                             <p className="font-bold text-lg" style={{ color: paceConfig[status].color }}>
                                {paceData.status}
                            </p>
                            <p className="text-sm">{paceData.analysis}</p>
                            <p className="text-sm text-muted-foreground">
                                Projected: {paceData.projectedUsage.toFixed(0)} / {monthlyGoal} kWh
                            </p>
                        </div>
                    ) : (
                         <p className="text-muted-foreground">Click the button to analyze your energy pace.</p>
                    )}
                </div>
                <div className="flex items-center justify-center">
                     <ChartContainer config={{}} className="mx-auto aspect-square w-full max-w-[200px]">
                        <RadialBarChart 
                            data={chartData} 
                            innerRadius="80%" 
                            outerRadius="100%" 
                            startAngle={90} 
                            endAngle={450}
                            barSize={20}
                        >
                             <RadialBar 
                                dataKey="value" 
                                cornerRadius={10} 
                                background
                             />
                             <Label
                                content={({ viewBox }) => {
                                    if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                                        return (
                                            <g>
                                                <text x={viewBox.cx} y={viewBox.cy - 5} textAnchor="middle" dominantBaseline="middle" className="fill-foreground text-3xl font-bold">
                                                    {`${Math.round(projectedPercentage)}%`}
                                                </text>
                                                <text x={viewBox.cx} y={viewBox.cy + 20} textAnchor="middle" dominantBaseline="middle" className="fill-muted-foreground text-sm">
                                                    Projected
                                                </text>
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
