
'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, PanelLeft, Footprints } from 'lucide-react';
import { UserNav } from '@/components/user-nav';
import { Sidebar } from '@/components/sidebar';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { analyzeWalkPathImage } from '@/ai/flows/analyze-walk-path-image';
import { Separator } from '@/components/ui/separator';

const PATH_PREDICTION_IMAGE_URL = "https://res.cloudinary.com/dtwt3cwfo/image/upload/v1753542455/crowd_analysis/job_20250726_164055_e62f7ced/Screenshot_2025-07-26_203612_ktbnza.png";

export default function PathPredictionPage() {
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
    setImageToAnalyze(PATH_PREDICTION_IMAGE_URL);

    try {
      // Fetch the image and convert to data URI
      const response = await fetch(PATH_PREDICTION_IMAGE_URL);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
          const base64data = reader.result as string;
          try {
            const result = await analyzeWalkPathImage({
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
          description: 'Generating walk path prediction. This will take about 5 seconds.',
        });
        const timer = setTimeout(() => {
          handleAnalyze();
        }, 5000);
        return () => clearTimeout(timer);
      } else if (!processed && isVideoProcessed) {
        resetState();
      }
    };

    // Initial check
    checkVideoStatus();

    // Listen for changes
    const handleStorageChange = (event: StorageEvent) => {
        // When the key is isVideoProcessed and it's cleared from another page
        if (event.key === 'isVideoProcessed') {
            if (event.newValue === null) {
                resetState();
            } else {
                checkVideoStatus();
            }
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
                <h1 className="text-xl font-semibold">Path Prediction</h1>
            </div>
            <UserNav />
        </header>
        <main className="flex-1 p-4 sm:px-6 sm:py-0 md:gap-8">
            <div className="grid gap-4 md:grid-cols-1">
                <Card>
                    <CardHeader>
                        <CardTitle>Walk Path Prediction</CardTitle>
                        <CardDescription>Predicted crowd movement paths based on video analysis.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div 
                            className="relative aspect-video w-full overflow-hidden rounded-md border-2 border-dashed border-muted-foreground/50 bg-muted"
                        >
                        {imageToAnalyze ? (
                            <Image src={imageToAnalyze} alt="Walk path prediction" fill objectFit="contain" />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                <Footprints className="h-12 w-12" />
                                <p>Walk Path Prediction will be generated after a video is uploaded</p>
                            </div>
                        )}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>AI Analysis</CardTitle>
                        <CardDescription>AI-generated summary of the predicted paths.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center min-h-[200px]">
                        {isLoading ? (
                            <div className="flex flex-col items-center text-center">
                                <Loader2 className="w-12 h-12 mb-4 animate-spin text-primary" />
                                <p className="font-semibold">Analyzing Prediction...</p>
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
