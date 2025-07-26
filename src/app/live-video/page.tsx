
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Upload, Loader2, Sparkles, PanelLeft, FileVideo, RefreshCw } from 'lucide-react';
import { UserNav } from '@/components/user-nav';
import { Sidebar } from '@/components/sidebar';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const API_BASE_URL = 'https://dbaeb561a825.ngrok-free.app';

export default function LiveVideoPage() {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultVideoUrl, setResultVideoUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const resetState = () => {
    setSelectedFile(null);
    setIsLoading(false);
    setError(null);
    setResultVideoUrl(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }

  const handleFileChange = (file: File | null) => {
    if (file) {
        if (file.type.startsWith('video/')) {
            resetState();
            setSelectedFile(file);
        } else {
            toast({
                variant: 'destructive',
                title: 'Invalid File Type',
                description: 'Please upload a valid video file.',
            });
        }
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      handleFileChange(event.target.files[0]);
    }
  };
  
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(true);
  };
  
  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);
  };
  
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);
      if (event.dataTransfer.files && event.dataTransfer.files[0]) {
          handleFileChange(event.dataTransfer.files[0]);
      }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleAnalyzeClick = async () => {
    if (!selectedFile) {
      toast({
        variant: 'destructive',
        title: 'No Video Selected',
        description: 'Please upload a video file to analyze.',
      });
      return;
    }

    const formData = new FormData();
    formData.append('video', selectedFile);

    setIsLoading(true);
    setError(null);
    setResultVideoUrl(null);

    try {
      const response = await fetch(`${API_BASE_URL}/analyze/video`, {
        method: 'POST',
        body: formData,
        headers: {
            'ngrok-skip-browser-warning': 'true'
        }
      });

      if (!response.ok) {
          const err = await response.json().catch(() => ({error: `Request failed with status ${response.status}`}));
          throw new Error(err.error || `Analysis failed with status ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setResultVideoUrl(url);

      toast({
        title: 'Analysis Complete',
        description: `Your video has been processed successfully.`,
      });
    } catch (e: any) {
      console.error('Analysis failed:', e);
      const errorMessage = e.message || 'Could not process the video. Check the browser console and ensure the backend server is running correctly.';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: errorMessage,
      });
    } finally {
        setIsLoading(false);
    }
  };

  const renderVideoContent = () => {
    if (resultVideoUrl) {
        return (
            <div className='aspect-video w-full'>
                <video 
                    src={resultVideoUrl} 
                    controls 
                    autoPlay
                    className="w-full h-full rounded-md" 
                />
            </div>
        );
    }

    if (selectedFile) {
         return (
            <div className='aspect-video w-full'>
                <video 
                    src={URL.createObjectURL(selectedFile)} 
                    controls 
                    className="w-full h-full rounded-md" 
                />
            </div>
        );
    }

    return (
        <div 
            className={cn(
                "relative flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-md border-muted-foreground/50 bg-muted cursor-pointer transition-colors aspect-video",
                {"bg-primary/10 border-primary": isDragging},
                {"cursor-not-allowed opacity-50": isLoading}
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={isLoading ? undefined : handleUploadClick}
        >
            <FileVideo className="w-16 h-16 text-muted-foreground" />
            <p className="mt-2 text-center">Drag & drop or click to upload</p>
             <Input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInputChange}
                className="hidden"
                accept="video/mp4,video/avi,video/mov,video/mkv"
                disabled={isLoading}
            />
        </div>
    );
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
                <h1 className="text-xl font-semibold whitespace-nowrap">Live Video Analysis</h1>
            </div>
            <UserNav />
        </header>
        <main className="flex-1 p-4 sm:px-6 sm:py-0 md:gap-8">
            <div className="grid gap-4 md:grid-cols-1">
                <Card>
                    <CardHeader>
                        <CardTitle>{resultVideoUrl ? 'Analysis Result' : 'Video Upload'}</CardTitle>
                        <CardDescription>
                            {resultVideoUrl 
                                ? 'The processed video is available below.' 
                                : 'Upload a video to analyze for crowd behavior.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="relative">
                           {renderVideoContent()}
                           {isLoading && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 rounded-md">
                                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                    <p className="mt-4 text-lg font-semibold">Analyzing Video...</p>
                                    <p className="text-sm text-muted-foreground">This may take a few moments.</p>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-2">
                             <Button onClick={handleUploadClick} variant="outline" disabled={isLoading || !!resultVideoUrl}>
                                <Upload className="mr-2 h-4 w-4" />
                                {selectedFile ? "Change Video" : "Select Video"}
                            </Button>
                            <Button onClick={handleAnalyzeClick} disabled={!selectedFile || isLoading || !!resultVideoUrl}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="mr-2 h-4 w-4" />
                                        Analyze
                                    </>
                                )}
                            </Button>
                            {(selectedFile || resultVideoUrl) && (
                                <Button onClick={resetState} variant="ghost" disabled={isLoading}>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Start New Analysis
                                </Button>
                            )}
                        </div>
                        {error && <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
                    </CardContent>
                </Card>
            </div>
        </main>
        </div>
    </div>
  );
}
