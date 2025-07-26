
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Upload, Loader2, Video, CheckCircle, XCircle, FileVideo, PanelLeft, RefreshCw, Sparkles } from 'lucide-react';
import { UserNav } from '@/components/user-nav';
import { Sidebar } from '@/components/sidebar';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const API_BASE_URL = 'https://625a1df66bd0.ngrok-free.app'; // As per the documentation

type JobStatus = 'queued' | 'processing' | 'completed' | 'failed' | null;
type AvailableFile = {
    available: boolean;
    filename: string;
    size_bytes: number;
    size_mb: number;
    download_url: string;
};

export default function LiveVideoPage() {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<JobStatus>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [resultFiles, setResultFiles] = useState<Record<string, AvailableFile> | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const resetState = () => {
    setSelectedFile(null);
    setJobId(null);
    setStatus(null);
    setProgress(0);
    setError(null);
    setResultFiles(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }


  useEffect(() => {
    if (!jobId || status === 'completed' || status === 'failed') {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/status/${jobId}`);
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Failed to get status');
        }
        const data = await response.json();
        setStatus(data.status);
        setProgress(data.progress);
        setError(data.error || null);

        if (data.status === 'completed') {
            const filesResponse = await fetch(`${API_BASE_URL}/files/${jobId}`);
            const filesData = await filesResponse.json();
            setResultFiles(filesData.available_files);
            toast({
                title: 'Analysis Complete!',
                description: 'The video has been processed successfully.',
            });
        } else if (data.status === 'failed') {
             toast({
                variant: 'destructive',
                title: 'Analysis Failed',
                description: data.error || 'An unknown error occurred during processing.',
            });
        }
      } catch (e: any) {
        setError(e.message);
        setStatus('failed');
        console.error('Status check failed:', e);
      }
    }, 2000); // Poll every 2 seconds as suggested

    return () => clearInterval(interval);
  }, [jobId, status, toast]);

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
    formData.append('social_distance', 'true');
    formData.append('abnormal_detection', 'true');

    setProgress(0);
    setStatus('queued');
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || `Upload failed with status ${response.status}`);
      }
      
      const result = await response.json();
      setJobId(result.job_id);
      toast({
        title: 'Upload Successful',
        description: `Analysis started with Job ID: ${result.job_id}`,
      });
    } catch (e: any) {
      console.error('Upload failed:', e);
      setError(e.message);
      setStatus('failed');
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: e.message || 'Could not start the analysis.',
      });
    }
  };

  const renderStatus = () => {
    if (!jobId) return null;

    let statusContent = null;

    if (status === 'queued' || status === 'processing') {
      statusContent = (
        <div className="space-y-4 text-center">
            <div className="flex justify-center items-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
            <p className="text-lg font-semibold capitalize">{status}...</p>
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground">{progress}% complete</p>
        </div>
      );
    } else if (status === 'completed') {
       statusContent = (
            <div className="space-y-4 text-center">
                <div className="flex justify-center items-center">
                   <CheckCircle className="h-10 w-10 text-green-500" />
                </div>
                <p className="text-lg font-semibold">Analysis Complete</p>
                <Progress value={100} className="w-full" />
            </div>
       )
    } else if (status === 'failed') {
         statusContent = (
            <div className="space-y-4 text-center">
                <div className="flex justify-center items-center">
                    <XCircle className="h-10 w-10 text-destructive" />
                </div>
                 <p className="text-lg font-semibold">Analysis Failed</p>
                {error && <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
            </div>
         )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Analysis Status</CardTitle>
                <CardDescription>Job ID: {jobId}</CardDescription>
            </CardHeader>
            <CardContent>
                {statusContent}
            </CardContent>
        </Card>
    )

  }

  const renderResults = () => {
      if(status !== 'completed' || !resultFiles) return null;
      
      const processedVideo = resultFiles.processed_video;

      return (
          <Card>
              <CardHeader>
                  <CardTitle>Results</CardTitle>
                  <CardDescription>The analysis is complete. View or download the results below.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                  {processedVideo?.available && (
                      <div className="space-y-2">
                        <h3 className="font-semibold">Processed Video</h3>
                        <video 
                            src={`${API_BASE_URL}${processedVideo.download_url}`} 
                            controls 
                            className="w-full rounded-md" 
                        />
                      </div>
                  )}

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {Object.entries(resultFiles).map(([key, file]) => {
                          if(!file.available || key === 'processed_video') return null;

                          return (
                              <Card key={key}>
                                  <CardHeader className="pb-2">
                                    <CardTitle className="text-base">{file.filename}</CardTitle>
                                    <CardDescription>{(file.size_mb).toFixed(2)} MB</CardDescription>
                                  </CardHeader>
                                  <CardContent>
                                    <a href={`${API_BASE_URL}${file.download_url}`} download={file.filename} target="_blank" rel="noopener noreferrer">
                                        <Button variant="outline" className="w-full">
                                            Download
                                        </Button>
                                    </a>
                                  </CardContent>
                              </Card>
                          )
                      })}
                  </div>
              </CardContent>
          </Card>
      )
  }

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
                        <CardDescription>Upload a video to analyze for crowd behavior.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div 
                            className={cn(
                                "relative flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-md border-muted-foreground/50 bg-muted cursor-pointer transition-colors",
                                {"bg-primary/10 border-primary": isDragging}
                            )}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={handleUploadClick}
                        >
                            <FileVideo className="w-16 h-16 text-muted-foreground" />
                            {selectedFile ? (
                                <p className="mt-2 text-center">{selectedFile.name}</p>
                            ) : (
                                <p className="mt-2 text-center">Drag & drop or click to upload</p>
                            )}
                             <Input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileInputChange}
                                className="hidden"
                                accept="video/mp4,video/avi,video/mov,video/mkv"
                                disabled={!!jobId && status !== 'completed' && status !== 'failed'}
                            />
                        </div>

                        <div className="flex gap-2">
                             <Button onClick={handleUploadClick} variant="outline" disabled={!!jobId && status !== 'completed' && status !== 'failed'}>
                                <Upload className="mr-2 h-4 w-4" />
                                {selectedFile ? "Change Video" : "Select Video"}
                            </Button>
                            <Button onClick={handleAnalyzeClick} disabled={!selectedFile || (!!jobId && status !== 'completed' && status !== 'failed')}>
                                <Sparkles className="mr-2 h-4 w-4" />
                                Analyze
                            </Button>
                            {jobId && (
                                <Button onClick={resetState} variant="ghost">
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Start New Analysis
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {renderStatus()}
                {renderResults()}
            </div>
        </main>
        </div>
    </div>
  );
}
