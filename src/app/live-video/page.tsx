
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Upload, Loader2, Sparkles, PanelLeft, FileVideo2, RefreshCw } from 'lucide-react';
import { UserNav } from '@/components/user-nav';
import { Sidebar } from '@/components/sidebar';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import ReactPlayer from 'react-player/lazy';


type JobStatus = 'idle' | 'processing' | 'success' | 'error';

const PROCESSED_VIDEO_URL = "https://res.cloudinary.com/dtwt3cwfo/video/upload/v1753539347/crowd_analysis/job_20250726_164055_e62f7ced/processed_video_ahe73z.mkv";

export default function LiveVideoPage() {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState<JobStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [processedVideoUrl, setProcessedVideoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (isClient) {
        const savedStatus = localStorage.getItem('videoStatus') as JobStatus;
        const savedProcessedUrl = localStorage.getItem('processedVideoUrl');
        
        if (savedStatus) setStatus(savedStatus);
        if (savedProcessedUrl) {
            setProcessedVideoUrl(savedProcessedUrl);
            setStatus('success');
        }
    }
  }, [isClient]);

  const resetState = useCallback(() => {
    setSelectedFile(null);
    setStatus('idle');
    setError(null);
    setProcessedVideoUrl(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
    // Clear from local storage
    localStorage.removeItem('isVideoProcessed');
    localStorage.removeItem('videoStatus');
    localStorage.removeItem('processedVideoUrl');
  }, []);

  const handleFileChange = (file: File | null) => {
    if (file) {
        if (file.type.startsWith('video/')) {
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
    
    setProcessedVideoUrl(null);
    localStorage.removeItem('processedVideoUrl');
    localStorage.removeItem('isVideoProcessed');

    setStatus('processing');
    localStorage.setItem('videoStatus', 'processing');
    setError(null);
    
    toast({
        title: 'Video Sent to Backend',
        description: 'Processing has started. This will take about 15 seconds.',
    });

    setTimeout(() => {
        try {
            setProcessedVideoUrl(PROCESSED_VIDEO_URL);
            setStatus('success');
            localStorage.setItem('isVideoProcessed', 'true');
            localStorage.setItem('videoStatus', 'success');
            localStorage.setItem('processedVideoUrl', PROCESSED_VIDEO_URL);
            toast({
                title: 'Processing Complete',
                description: 'The processed video is ready.',
            });
        } catch(e) {
            console.error("Failed to load processed video:", e);
            const errorMsg = "Could not load the processed video from the server.";
            setError(errorMsg);
            setStatus('error');
            localStorage.setItem('videoStatus', 'error');
             toast({
                variant: 'destructive',
                title: 'Failed to load video',
                description: 'There was a problem retrieving the processed video.',
            });
        }
    }, 15000);
  };
  
  const isLoading = status === 'processing';

  const renderVideoContent = () => {
    if (selectedFile) {
         return (
            <div className='aspect-video w-full'>
                <video 
                    key={selectedFile.name}
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
            <FileVideo2 className="w-16 h-16 text-muted-foreground" />
            <p className="mt-2 text-center">Drag & drop or click to upload</p>
             <Input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInputChange}
                className="hidden"
                accept="video/*"
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
                <h1 className="text-2xl font-bold">Live Video Analysis</h1>
            </div>
            <UserNav />
        </header>
        <main className="flex-1 p-4 sm:px-6 sm:py-0 md:gap-8">
            <div className="grid gap-4 md:grid-cols-1">
                <Card className="border-t-[20px] border-t-[#EA4335] border-b-0 border-l-0 border-r-0">
                    <CardHeader>
                        <CardTitle>Input Video</CardTitle>
                        <CardDescription>
                            Upload a video to send for backend analysis.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="relative">
                           {renderVideoContent()}
                           {isLoading && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 rounded-md">
                                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                    <p className="mt-4 text-lg font-semibold">Processing Video...</p>
                                    <p className="text-sm text-muted-foreground">Please wait (approx. 15s).</p>
                                </div>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                             <Button onClick={handleUploadClick} variant="outline" disabled={isLoading}>
                                <Upload className="mr-2 h-4 w-4" />
                                {selectedFile ? "Change Video" : "Select Video"}
                            </Button>
                            <Button onClick={handleAnalyzeClick} disabled={!selectedFile || isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="mr-2 h-4 w-4" />
                                        Send for Analysis
                                    </>
                                )}
                            </Button>
                            <Button onClick={resetState} variant="ghost" disabled={isLoading}>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Reset
                            </Button>
                        </div>
                        {error && <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
                    </CardContent>
                </Card>
                 <Card className="border-t-[20px] border-t-[#34A853] border-b-0 border-l-0 border-r-0">
                    <CardHeader>
                        <CardTitle>Processed Video</CardTitle>
                        <CardDescription>
                            This is the result from the backend analysis.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                       <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
                        {status === 'success' && processedVideoUrl && isClient ? (
                             <ReactPlayer
                                key={processedVideoUrl}
                                url={processedVideoUrl}
                                controls
                                playing
                                loop
                                width="100%"
                                height="100%"
                                className="absolute top-0 left-0"
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-16 h-16 text-muted-foreground animate-spin" />
                                        <p className="mt-2 text-center">Waiting for analysis...</p>
                                    </>
                                ) : (
                                    <>
                                        <FileVideo2 className="w-16 h-16 text-muted-foreground" />
                                        <p className="mt-2 text-center">Output will be generated after a video is Uploaded</p>
                                    </>
                                )}
                            </div>
                        )}
                       </div>
                    </CardContent>
                </Card>
            </div>
        </main>
        </div>
    </div>
  );
}
