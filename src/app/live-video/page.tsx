
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Upload, Loader2, Sparkles, PanelLeft, FileVideo, RefreshCw, AlertCircle } from 'lucide-react';
import { UserNav } from '@/components/user-nav';
import { Sidebar } from '@/components/sidebar';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Papa from 'papaparse';

const API_BASE_URL = 'https://0f2b00637027.ngrok-free.app';
const CSV_POLL_URL = 'https://res.cloudinary.com/dtwt3cwfo/raw/upload/v1753528346/crowd_analysis/job_20250726_164055_e62f7ced/crowd_data.csv';

type JobStatus = 'idle' | 'uploading' | 'processing' | 'completed' | 'error';

export default function LiveVideoPage() {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState<JobStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [resultVideoUrl, setResultVideoUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const resetState = () => {
    setSelectedFile(null);
    setStatus('idle');
    setError(null);
    setResultVideoUrl(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
    if(pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
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
  
  const pollForResults = () => {
      pollIntervalRef.current = setInterval(async () => {
          try {
              const response = await fetch(CSV_POLL_URL);
              if (!response.ok) {
                  // Don't throw error, just continue polling
                  console.warn(`Polling failed with status ${response.status}`);
                  return;
              }
              const csvText = await response.text();
              
              Papa.parse(csvText, {
                  header: true,
                  complete: (results) => {
                      // Assuming the CSV has `status` and `output_video_url` columns
                      // And we are interested in the last row.
                      const lastResult: any = results.data[results.data.length - 1];
                      if(lastResult && lastResult.status === 'completed' && lastResult.output_video_url) {
                          setResultVideoUrl(lastResult.output_video_url);
                          setStatus('completed');
                          toast({
                              title: "Analysis Complete!",
                              description: "The processed video is now available."
                          })
                          if(pollIntervalRef.current) {
                            clearInterval(pollIntervalRef.current);
                            pollIntervalRef.current = null;
                          }
                      }
                  }
              });

          } catch (e) {
              console.error("Polling error:", e);
              // Don't stop polling on fetch error
          }
      }, 5000); // Poll every 5 seconds
  }

  useEffect(() => {
      return () => {
          if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
          }
      }
  }, []);

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

    setStatus('uploading');
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/analyze/video`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
          const err = await response.json().catch(() => ({error: `Request failed with status ${response.status}`}));
          throw new Error(err.error || `Analysis failed with status ${response.status}`);
      }
      
      toast({
        title: 'Video Sent for Analysis',
        description: `Your video is being processed. Results will appear here when ready.`,
      });
      setStatus('processing');
      pollForResults();

    } catch (e: any) {
      console.error('Analysis failed:', e);
      const errorMessage = e.message || 'Could not send the video. Check the browser console and ensure the backend server is running correctly.';
      setError(errorMessage);
      setStatus('error');
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: errorMessage,
      });
    }
  };
  
  const isLoading = status === 'uploading' || status === 'processing';

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
                        <CardTitle>Video Upload</CardTitle>
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
                                    <p className="mt-4 text-lg font-semibold">{status === 'uploading' ? 'Sending Video...' : 'Processing Video...'}</p>
                                    <p className="text-sm text-muted-foreground">{status === 'processing' ? 'This may take several minutes.' : 'Please wait.'}</p>
                                </div>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                             <Button onClick={handleUploadClick} variant="outline" disabled={isLoading || !!resultVideoUrl}>
                                <Upload className="mr-2 h-4 w-4" />
                                {selectedFile ? "Change Video" : "Select Video"}
                            </Button>
                            <Button onClick={handleAnalyzeClick} disabled={!selectedFile || isLoading || !!resultVideoUrl}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        {status === 'uploading' ? 'Sending...' : 'Processing...'}
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="mr-2 h-4 w-4" />
                                        Send for Analysis
                                    </>
                                )}
                            </Button>
                            {(selectedFile || resultVideoUrl) && (
                                <Button onClick={resetState} variant="ghost" disabled={isLoading}>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Clear
                                </Button>
                            )}
                            {status === 'processing' && (
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <AlertCircle className="mr-2 h-4 w-4 text-primary" />
                                    <span>Analysis in progress. Results will appear automatically.</span>
                                </div>
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
