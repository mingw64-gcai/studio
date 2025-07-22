
'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Map, Loader2, Sparkles, PanelLeft } from 'lucide-react';
import { UserNav } from '@/components/user-nav';
import { Sidebar } from '@/components/sidebar';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { APIProvider, Map as GoogleMap, Marker } from '@vis.gl/react-google-maps';
import { analyzeMapLocation } from '@/ai/flows/analyze-map-location';
import html2canvas from 'html2canvas';

export default function MapAnalysisPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [markerPosition, setMarkerPosition] = useState({ lat: 51.5074, lng: -0.1278 });
  const mapRef = useRef(null);

  const handleAnalyzeClick = async () => {
    if (!mapRef.current) {
        toast({
            variant: 'destructive',
            title: 'Map not ready',
            description: 'Please wait for the map to load.',
        });
        return;
    }
    setIsLoading(true);
    setAnalysisResult(null);

    try {
        const canvas = await html2canvas(mapRef.current, { useCORS: true });
        const mapImageDataUri = canvas.toDataURL('image/png');

        const result = await analyzeMapLocation({
            mapImageDataUri: mapImageDataUri,
            query: "Find nearby crowded areas"
        });
        setAnalysisResult(result.heatmapOverlayDataUri);
    } catch (error) {
      console.error('Failed to analyze map', error);
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: 'There was a problem communicating with the AI model.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleMapClick = (e: any) => {
    setMarkerPosition({ lat: e.detail.latLng.lat, lng: e.detail.latLng.lng });
  };

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
      return (
          <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40 p-4">
              <Card>
                  <CardHeader>
                      <CardTitle>Configuration Missing</CardTitle>
                      <CardDescription>
                          Please provide a Google Maps API key in your environment variables to use this feature.
                      </CardDescription>
                  </CardHeader>
                  <CardContent>
                      <p className="text-sm text-muted-foreground">
                          Add a <code className="font-mono bg-muted p-1 rounded-sm">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to your <code className="font-mono bg-muted p-1 rounded-sm">.env.local</code> file.
                      </p>
                  </CardContent>
              </Card>
          </div>
      )
  }


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
                <h1 className="text-xl font-semibold">Map Analysis</h1>
            </div>
            <UserNav />
        </header>
        <main className="flex-1 p-4 sm:px-6 sm:py-0 md:gap-8">
            <div className="grid gap-4 md:grid-cols-1">
                <Card>
                    <CardHeader>
                        <CardTitle>Location Analysis</CardTitle>
                        <CardDescription>Select a location on the map to analyze for potential crowd gatherings.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       <div ref={mapRef} className="relative aspect-video w-full overflow-hidden rounded-md border bg-muted">
                            <APIProvider apiKey={apiKey}>
                                <GoogleMap 
                                    center={markerPosition} 
                                    zoom={15} 
                                    mapId="drishti-ai-map"
                                    onClick={handleMapClick}
                                    gestureHandling={'greedy'}
                                >
                                    <Marker position={markerPosition} />
                                </GoogleMap>
                            </APIProvider>
                            {analysisResult && (
                                <Image src={analysisResult} alt="Analysis result" layout="fill" objectFit="contain" className="opacity-60 pointer-events-none" />
                            )}
                             {isLoading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    <p className="ml-2">Analyzing...</p>
                                </div>
                            )}
                       </div>
                       <Button onClick={handleAnalyzeClick} disabled={isLoading}>
                            {isLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Sparkles className="mr-2 h-4 w-4" />
                            )}
                            Analyze Selected Location
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </main>
        </div>
    </div>
  );
}

