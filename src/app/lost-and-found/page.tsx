
'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Upload, Loader2, Sparkles, UserSearch, PanelLeft, Search, Video } from 'lucide-react';
import { UserNav } from '@/components/user-nav';
import { Sidebar } from '@/components/sidebar';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { findPersonInCrowd } from '@/ai/flows/find-person-in-crowd';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

type Screen = 'upload' | 'scanning' | 'result';

export default function LostAndFoundPage() {
  const { toast } = useToast();
  const [personImage, setPersonImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [screen, setScreen] = useState<Screen>('upload');
  const [result, setResult] = useState<{videoResultDataUri: string, found: boolean} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setPersonImage(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSearchClick = async () => {
    if (!personImage) {
      toast({
        variant: 'destructive',
        title: 'No Image Selected',
        description: 'Please upload an image of the person to find.',
      });
      return;
    }
    setIsLoading(true);
    setScreen('scanning');
    
    try {
        // This is where you would call your backend.
        // For now, we use the placeholder flow.
        const fakeVideoDataUri = "data:video/mp4;base64,..."; // In a real app, this would be the live feed.
        const response = await findPersonInCrowd({ personImageDataUri: personImage, videoDataUri: fakeVideoDataUri });
        setResult(response);
        setScreen('result');
    } catch (error) {
        console.error('Failed to find person', error);
        toast({
            variant: 'destructive',
            title: 'Search Failed',
            description: 'There was an error during the search process.',
        });
        setScreen('upload');
    }
    finally {
        setIsLoading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleReset = () => {
    setPersonImage(null);
    setResult(null);
    setScreen('upload');
  }

  const renderUploadScreen = () => (
    <Card>
        <CardHeader>
            <CardTitle>Find a Person</CardTitle>
            <CardDescription>Upload a photo of the person you are looking for.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="relative aspect-square w-full max-w-sm mx-auto overflow-hidden rounded-md border-2 border-dashed border-muted-foreground/50 bg-muted">
            {personImage ? (
                <Image src={personImage} alt="Person to find" fill style={{objectFit:'contain'}} />
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <UserSearch className="h-16 w-16" />
                    <p className="mt-2">Upload a clear photo</p>
                </div>
            )}
            </div>

            <Input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
                accept="image/*"
            />
            <div className="flex justify-center gap-2">
                 <Button onClick={handleUploadClick} variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Photo
                </Button>
                <Button onClick={handleSearchClick} disabled={!personImage || isLoading}>
                    <Search className="mr-2 h-4 w-4" />
                    Start Search
                </Button>
            </div>
        </CardContent>
    </Card>
  );

  const renderScanningScreen = () => (
      <Card>
          <CardHeader>
              <CardTitle>Scanning Video Feed</CardTitle>
              <CardDescription>Our AI is analyzing the live feed to find the person. Please wait.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
                  <Image
                    src="https://placehold.co/1280x720"
                    alt="Live video feed"
                    fill
                    className="object-cover"
                    data-ai-hint="crowd event"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80">
                      <Loader2 className="h-12 w-12 animate-spin text-primary" />
                      <p className="mt-4 text-lg font-semibold">Scanning...</p>
                  </div>
              </div>
          </CardContent>
      </Card>
  );

  const renderResultScreen = () => (
      <Card>
          <CardHeader>
              <CardTitle>Search Results</CardTitle>
              <CardDescription>The scan has completed.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              {result?.found ? (
                   <div className="space-y-4">
                        <Alert variant="default" className="bg-green-100 border-green-400 text-green-800">
                           <Sparkles className="h-4 w-4 !text-green-800" />
                           <AlertTitle>Person Found!</AlertTitle>
                           <AlertDescription>
                               The individual has been located in the video feed.
                           </AlertDescription>
                        </Alert>
                       <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
                           <video src={result.videoResultDataUri} autoPlay loop muted className="w-full h-full object-contain" />
                       </div>
                   </div>
              ) : (
                <Alert variant="destructive">
                    <AlertTitle>Person Not Found</AlertTitle>
                    <AlertDescription>
                        We could not locate the person in the current video feed. You can try again.
                    </AlertDescription>
                </Alert>
              )}
               <Button onClick={handleReset} variant="outline">Start New Search</Button>
          </CardContent>
      </Card>
  );

  const renderScreen = () => {
    switch(screen) {
        case 'scanning':
            return renderScanningScreen();
        case 'result':
            return renderResultScreen();
        case 'upload':
        default:
            return renderUploadScreen();
    }
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
                    <h1 className="text-xl font-semibold whitespace-nowrap">Lost and Found</h1>
                </div>
                <UserNav />
            </header>
            <main className="flex-1 p-4 sm:px-6 sm:py-0 md:gap-8">
                <div className="grid gap-4 md:grid-cols-1">
                   {renderScreen()}
                </div>
            </main>
        </div>
    </div>
  );
}
