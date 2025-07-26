
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, PanelLeft } from 'lucide-react';
import { analyzeCrowdImage, AnalyzeCrowdImageOutput } from '@/ai/flows/analyze-crowd-image';
import { UserNav } from '@/components/user-nav';
import { Sidebar } from '@/components/sidebar';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';

const IMAGE_URL = "https://res.cloudinary.com/dtwt3cwfo/image/upload/v1753528344/crowd_analysis/job_20250726_164055_e62f7ced/crowd%20data.png.png";

export default function CrowdHotspotsPage() {
  const { toast } = useToast();
  const [selectedImage] = useState<string>(IMAGE_URL);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  const handleAnalyzeClick = async () => {
    if (!selectedImage) {
      toast({
        variant: 'destructive',
        title: 'No Image Selected',
        description: 'Please upload an image to analyze.',
      });
      return;
    }
    setIsLoading(true);
    setAnalysisResult(null);
    try {
      // Fetch the image and convert to data URI
      const response = await fetch(selectedImage);
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
      setIsLoading(false);
    }
  };


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
                        <CardTitle>Chart Analysis</CardTitle>
                        <CardDescription>Analyze the image to get an AI summary about crowd gathering.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="relative aspect-video w-full overflow-hidden rounded-md border-2 border-dashed border-muted-foreground/50 bg-muted">
                        {selectedImage ? (
                            <Image src={selectedImage} alt="Selected for analysis" fill style={{objectFit:'contain'}} unoptimized/>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                <Loader2 className="h-12 w-12" />
                                <p>Loading Image...</p>
                            </div>
                        )}
                        {isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <p className="ml-2">Analyzing...</p>
                            </div>
                        )}
                        </div>
                        <Button onClick={handleAnalyzeClick} disabled={isLoading || !selectedImage}>
                        {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Sparkles className="mr-2 h-4 w-4" />
                        )}
                        Analyze
                        </Button>
                    </CardContent>
                </Card>
            </div>
            {analysisResult && (
                 <Card className="mt-4">
                    <CardHeader>
                        <CardTitle>AI Analysis</CardTitle>
                        <CardDescription>A summary of the crowd situation from Gemini.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-foreground">{analysisResult}</p>
                    </CardContent>
                </Card>
            )}
        </main>
        </div>
    </div>
  );
}
