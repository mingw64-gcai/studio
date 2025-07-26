
'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, PanelLeft, ImageIcon } from 'lucide-react';
import { analyzeCrowdImage } from '@/ai/flows/analyze-crowd-image';
import { UserNav } from '@/components/user-nav';
import { Sidebar } from '@/components/sidebar';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

const CROWD_DATA_IMAGE_URL = "https://res.cloudinary.com/dtwt3cwfo/image/upload/v1753528344/crowd_analysis/job_20250726_164055_e62f7ced/crowd%20data.png.png";

export default function CrowdHotspotsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [imageToAnalyze, setImageToAnalyze] = useState<string | null>(null);
  const [isVideoProcessed, setIsVideoProcessed] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const resetState = useCallback(() => {
    setIsLoading(false);
    setAnalysisResult(null);
    setImageToAnalyze(null);
    setIsVideoProcessed(false);
  }, []);

  const handleAnalyze = useCallback(async () => {
    setIsLoading(true);
    setAnalysisResult(null);
    setImageToAnalyze(CROWD_DATA_IMAGE_URL);

    try {
      // Fetch the image and convert to data URI
      const response = await fetch(CROWD_DATA_IMAGE_URL);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
          const base64data = reader.result as string;
          try {
            const result = await analyzeCrowdImage({
                imageDataUri: base64data,
            });
            setAnalysisResult(result.analysis);
          } catch (error) {
             console.error('Failed to analyze image', error);
             toast({
                variant: 'destructive',
                title: 'Analysis Failed',
                description: 'There was a problem communicating with the AI model.',
             });
             resetState();
          } finally {
             setIsLoading(false);
          }
      };
    } catch (error) {
      console.error('Failed to fetch or process image', error);
      toast({
        variant: 'destructive',
        title: 'Image Load Failed',
        description: 'Could not load the image from the provided URL.',
      });
      resetState();
    }
  }, [toast, resetState]);


  useEffect(() => {
    if (!isClient) return;

    const checkVideoStatus = () => {
      const processed = localStorage.getItem('isVideoProcessed') === 'true';
      if (processed && !isVideoProcessed) {
        setIsVideoProcessed(true);
        toast({
          title: 'Analysis Starting',
          description: 'Generating crowd chart analysis. This will take about 20 seconds.',
        });
        const timer = setTimeout(() => {
          handleAnalyze();
        }, 20000); 
        return () => clearTimeout(timer);
      } else if (!processed && isVideoProcessed) {
        resetState();
      }
    };

    checkVideoStatus();

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'isVideoProcessed') {
        checkVideoStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };

  }, [isClient, isVideoProcessed, handleAnalyze, resetState, toast]);

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <Sidebar />
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
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
            <div className="relative ml-auto flex-1 md:grow-0">
                <h1 className="text-xl font-semibold">Chart Analysis</h1>
            </div>
            <UserNav />
        </header>
        <main className="flex-1 p-4 sm:px-6 sm:py-0 md:gap-8">
            <div className="grid gap-4 md:grid-cols-1">
                <Card>
                    <CardHeader>
                        <CardTitle>Generated Crowd Chart</CardTitle>
                        <CardDescription>Visual representation of crowd data.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="relative flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-md border-muted-foreground/50 bg-muted aspect-video">
                            {imageToAnalyze ? (
                                <Image src={imageToAnalyze} alt="Crowd Data Chart" layout="fill" objectFit="contain" />
                            ) : (
                                <>
                                    <ImageIcon className="w-16 h-16 text-muted-foreground" />
                                    <p className="mt-2 text-center text-muted-foreground">Charts will be generated after a video is uploaded</p>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>AI Analysis</CardTitle>
                        <CardDescription>AI-generated summary of the chart.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center min-h-[300px]">
                        {isLoading ? (
                            <div className="flex flex-col items-center text-center">
                                <Loader2 className="w-12 h-12 mb-4 animate-spin text-primary" />
                                <p className="font-semibold">Analyzing Chart...</p>
                                <p className="text-sm text-muted-foreground">Please wait a moment.</p>
                            </div>
                        ) : analysisResult ? (
                            <div className="w-full space-y-4 text-sm">
                                <p>{analysisResult}</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center text-center text-muted-foreground">
                                <Sparkles className="w-12 h-12 mb-4" />
                                <p className="font-semibold">No analysis to display.</p>
                                <p className="text-sm">Output will be generated after a video is uploaded.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </main>
        </div>
    </div>
  );
}
