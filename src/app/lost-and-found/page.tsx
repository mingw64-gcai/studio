
'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Upload, Loader2, Sparkles, UserSearch, PanelLeft, Search, Bell } from 'lucide-react';
import { UserNav } from '@/components/user-nav';
import { Sidebar } from '@/components/sidebar';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

type Screen = 'upload' | 'scanning' | 'result';

const initialFoundPeople = [
    {
      name: 'John Doe',
      location: 'Found near Main Stage',
      time: '10 mins ago',
      image: 'https://placehold.co/100x100.png',
      hint: 'man portrait',
    },
    {
      name: 'Jane Smith',
      location: 'Located at West Entrance',
      time: '25 mins ago',
      image: 'https://placehold.co/100x100.png',
      hint: 'woman portrait',
    },
    {
      name: 'Peter Jones',
      location: 'Identified near Food Court',
      time: '45 mins ago',
      image: 'https://placehold.co/100x100.png',
      hint: 'man smiling',
    },
];

export default function LostAndFoundPage() {
  const { toast } = useToast();
  const [personImage, setPersonImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [screen, setScreen] = useState<Screen>('upload');
  const [result, setResult] = useState<{text: string, found: boolean} | null>(null);
  const [foundPeople, setFoundPeople] = useState(initialFoundPeople);
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
    
    setTimeout(async () => {
      try {
        const response = await fetch('/api/find-person', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                image: personImage.split(',')[1],
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            // Use the error message from the API response if available
            throw new Error(data.error || `API request failed with status ${response.status}`);
        }
        
        setResult({
            text: data.text,
            found: data.found,
        });

        if (data.found && data.name) {
            const newPerson = {
                name: data.name.replace(/_/g, ' '), // Replace underscores with spaces for display
                location: "Located via Live Search",
                time: "Just now",
                image: personImage,
                hint: "person found"
            };
            setFoundPeople(prev => [newPerson, ...prev]);
        }

        setScreen('result');

      } catch (error: any) {
          console.error('Failed to find person', error);
          toast({
              variant: 'destructive',
              title: 'Search Failed',
              description: error.message || 'An unknown error occurred during the search.',
          });
          setScreen('upload');
      }
      finally {
          setIsLoading(false);
      }
    }, 7000);
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
              <CardTitle>Scanning for Person</CardTitle>
              <CardDescription>Our AI is analyzing the image to find the person. Please wait.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
                  <Image
                    src="https://placehold.co/1280x720.png"
                    alt="Scanning placeholder"
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
                               {result.text}
                           </AlertDescription>
                        </Alert>
                   </div>
              ) : (
                <Alert variant="destructive">
                    <AlertTitle>Person Not Found</AlertTitle>
                    <AlertDescription>
                        {result?.text || "We could not locate the person in our search. You can try again with a different image."}
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

  const handleReport = () => {
    toast({
        title: 'Feature Coming Soon',
        description: 'Reporting functionality will be available in a future update.',
    });
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <Sidebar />
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-64">
            <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:bg-transparent sm:px-6">
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
                <div className="flex-1">
                    <h1 className="text-3xl font-bold">Lost and Found</h1>
                </div>
                <UserNav />
            </header>
            <main className="flex-1 p-4 sm:px-6 sm:py-0 md:gap-8">
                <div className="grid gap-4 md:grid-cols-2">
                   {renderScreen()}
                   <Card className="border-t-8 border-t-[hsl(var(--chart-4))]">
                        <CardHeader>
                            <CardTitle>Recently Found</CardTitle>
                            <CardDescription>Individuals who have been recently located.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {foundPeople.map((person, index) => (
                                <div key={index} className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-16 w-16 border">
                                            <AvatarImage src={person.image} alt={person.name} data-ai-hint={person.hint} />
                                            <AvatarFallback>{person.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <p className="font-semibold">{person.name}</p>
                                            <p className="text-sm text-muted-foreground">{person.location}</p>
                                            <p className="text-xs text-muted-foreground">{person.time}</p>
                                        </div>
                                        <Button variant="outline" size="sm" onClick={handleReport}>
                                            <Bell className="mr-2 h-4 w-4" />
                                            Report
                                        </Button>
                                    </div>
                                    {index < foundPeople.length -1 && <Separator />}
                                </div>
                            ))}
                        </CardContent>
                   </Card>
                </div>
            </main>
        </div>
    </div>
  );
}
 
