
'use client';

import { useState, useEffect } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Sidebar } from '@/components/sidebar';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { PanelLeft, BarChart2 } from 'lucide-react';
import { UserNav } from '@/components/user-nav';

const chartData = [
  { month: 'February', alerts: 15 },
  { month: 'March', alerts: 8 },
  { month: 'April', alerts: 22 },
  { month: 'May', alerts: 18 },
  { month: 'June', alerts: 30 },
  { month: 'July', alerts: 25 },
];

const chartConfig = {
  alerts: {
    label: 'Alerts',
    color: 'hsl(var(--destructive))',
  },
};

export default function AnalyticsPage() {
  const [isVideoProcessed, setIsVideoProcessed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This effect runs only on the client-side
    const processed = localStorage.getItem('isVideoProcessed') === 'true';
    setIsVideoProcessed(processed);
    setIsLoading(false);
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Sidebar />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:bg-transparent sm:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="sm:hidden">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs">
              <Sidebar isSheet={true} />
            </SheetContent>
          </Sheet>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Analytics</h1>
          </div>
          <UserNav />
        </header>
        <main className="flex-1 p-4 sm:px-6 sm:py-0 md:gap-8">
            <Card>
                <CardHeader>
                    <CardTitle>High-Density Alerts</CardTitle>
                    <CardDescription>Alerts triggered per month (February - July 2025)</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center min-h-[400px]">
                    {isLoading ? (
                        <p>Loading...</p>
                    ) : isVideoProcessed ? (
                        <ChartContainer config={chartConfig} className="w-full h-full">
                            <BarChart accessibilityLayer data={chartData}>
                                <CartesianGrid vertical={false} />
                                <XAxis
                                dataKey="month"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                                tickFormatter={(value) => value.slice(0, 3)}
                                />
                                <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent hideLabel />}
                                />
                                <Bar dataKey="alerts" fill="var(--color-alerts)" radius={8} />
                            </BarChart>
                        </ChartContainer>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8">
                            <BarChart2 className="h-12 w-12 mb-4" />
                            <p className="font-semibold">No data to display.</p>
                            <p className="text-sm">Please upload a video in the live video section to generate and analyse charts.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </main>
      </div>
    </div>
  );
}
