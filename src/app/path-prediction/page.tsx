
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Upload, Loader2, Sparkles, PanelLeft, Footprints } from 'lucide-react';
import { UserNav } from '@/components/user-nav';
import { Sidebar } from '@/components/sidebar';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';

export default function PathPredictionPage() {
  const { toast } = useToast();
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleVideoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setSelectedVideo(e.target.result as string);
          setAnalysisResult(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeClick = async () => {
    if (!selectedVideo) {
        toast({
          variant: 'destructive',
          title: 'No Video Selected',
          description: 'Please upload a video to predict the path.',
        });
        fileInputRef.current?.click();
        return;
    }
    setIsLoading(true);
    setAnalysisResult(null);
    
    // Simulate API call
    setTimeout(() => {
      // In a real app, you would get the result from your backend API
      // For now, we'll use a placeholder video as the result
      setAnalysisResult("https://placehold.co/1280x720/0000ff/0000ff.png?text=+");
      setIsLoading(false);
      toast({
        title: 'Analysis Complete',
        description: 'Predicted walk path has been generated.',
      });
    }, 3000);
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
                <h1 className="text-xl font-semibold">Path Prediction</h1>
            </div>
            <UserNav />
        </header>
        <main className="flex-1 p-4 sm:px-6 sm:py-0 md:gap-8">
            <div className="grid gap-4 md:grid-cols-1">
                <Card>
                    <CardHeader>
                        <CardTitle>Walk Path Prediction</CardTitle>
                        <CardDescription>Upload a video to predict crowd movement paths.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div 
                            className="relative aspect-video w-full overflow-hidden rounded-md border-2 border-dashed border-muted-foreground/50 bg-muted cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                        >
                        {selectedVideo ? (
                            <video src={selectedVideo} controls className="w-full h-full object-contain" />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                <Upload className="h-12 w-12" />
                                <p>Click to upload a video to begin</p>
                            </div>
                        )}
                        {isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <p className="ml-2">Predicting...</p>
                            </div>
                        )}
                        {analysisResult && (
                             <video src={analysisResult} autoPlay loop muted className="absolute inset-0 w-full h-full object-contain opacity-60" />
                        )}
                        </div>

                        <Input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleVideoChange}
                            className="hidden"
                            accept="video/*"
                        />
                        <div className="flex gap-2">
                            <Button onClick={handleAnalyzeClick} disabled={isLoading || !selectedVideo}>
                            {isLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Sparkles className="mr-2 h-4 w-4" />
                            )}
                            Predict Path
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
        </div>
    </div>
  );
}
