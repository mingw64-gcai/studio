
'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Upload, Loader2, Sparkles, PanelLeft } from 'lucide-react';
import { analyzeImageForCrowds } from '@/ai/flows/analyze-image-for-crowds';
import { UserNav } from '@/components/user-nav';
import { Sidebar } from '@/components/sidebar';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';

export default function CrowdHotspotsPage() {
  const { toast } = useToast();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [originalImageFile, setOriginalImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setOriginalImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setSelectedImage(e.target.result as string);
          setAnalysisResult(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

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
      const result = await analyzeImageForCrowds({
        imageDataUri: selectedImage,
      });
      setAnalysisResult(result.heatmapOverlayDataUri);
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

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <Sidebar />
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-60">
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
                <h1 className="text-xl font-semibold">Crowd Heatmap</h1>
            </div>
            <UserNav />
        </header>
        <main className="flex-1 p-4 sm:px-6 sm:py-0 md:gap-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <CardTitle>Image Analysis</CardTitle>
                        <CardDescription>Upload an image to identify potential crowd gatherings.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="relative aspect-video w-full overflow-hidden rounded-md border-2 border-dashed border-muted-foreground/50 bg-muted">
                        {selectedImage ? (
                            <Image src={selectedImage} alt="Selected for analysis" fill objectFit="contain" />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                <Upload className="h-12 w-12" />
                                <p>Upload an image to begin</p>
                            </div>
                        )}
                        {isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <p className="ml-2">Analyzing...</p>
                            </div>
                        )}
                        {analysisResult && (
                             <Image src={analysisResult} alt="Analysis result" fill objectFit="contain" className="opacity-60" />
                        )}
                        </div>

                        <Input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            className="hidden"
                            accept="image/*"
                        />
                        <div className="flex gap-2">
                             <Button onClick={handleUploadClick} variant="outline">
                                <Upload className="mr-2 h-4 w-4" />
                                Upload Image
                            </Button>
                            <Button onClick={handleAnalyzeClick} disabled={isLoading || !selectedImage}>
                            {isLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Sparkles className="mr-2 h-4 w-4" />
                            )}
                            Analyze
                            </Button>
                        </div>
                    </CardContent>
                </Card>
                 <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Results</CardTitle>
                        <CardDescription>Highlighted areas of potential congestion.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         {analysisResult ? (
                              <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
                                  <Image src={analysisResult} alt="Crowd heatmap" fill objectFit="contain" />
                              </div>
                          ) : (
                              <div className="flex items-center justify-center h-48 rounded-md bg-muted text-muted-foreground">
                                  <p>Analysis results will appear here.</p>
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
