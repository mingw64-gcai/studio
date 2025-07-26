
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateHeatmapOverlay } from '@/ai/flows/generate-heatmap-overlay';
import { countFacesInImage } from '@/ai/flows/count-faces-in-image';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import type { ThreatLevel } from '@/app/page';

interface VideoFeedProps {
  setThreatLevel: (level: ThreatLevel) => void;
  setFaceCount: (count: number) => void;
}

export function VideoFeed({ setThreatLevel, setFaceCount }: VideoFeedProps) {
  const { toast } = useToast();
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [heatmapUrl, setHeatmapUrl] = useState<string | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const analyzeFrame = useCallback(async () => {
    if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) {
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const frameDataUri = canvas.toDataURL('image/jpeg');

    try {
      const { faceCount } = await countFacesInImage({ imageDataUri: frameDataUri });
      setFaceCount(faceCount);

      if (faceCount >= 3) {
        setThreatLevel('High');
      } else if (faceCount === 2) {
        setThreatLevel('Moderate');
      } else {
        setThreatLevel('Low');
      }
    } catch (error) {
      console.error('Face count analysis failed', error);
      // Don't show a toast here, as it would be annoying every 5 seconds.
    }
  }, [setThreatLevel, setFaceCount]);

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this app.',
        });
      }
    };

    getCameraPermission();

    // Start analysis loop when component mounts and permission is granted
    if (hasCameraPermission) {
        analysisIntervalRef.current = setInterval(analyzeFrame, 15000); // Analyze every 15 seconds
    }
    
    // Cleanup function
    return () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
        if (analysisIntervalRef.current) {
            clearInterval(analysisIntervalRef.current);
        }
    }
  }, [toast, hasCameraPermission, analyzeFrame]);


  const handleHeatmapToggle = async (checked: boolean) => {
    setShowHeatmap(checked);
    if (checked) {
      if (!videoRef.current) return;

      setIsLoading(true);
      setHeatmapUrl(null);

      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setIsLoading(false);
        return;
      }
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const videoDataUri = canvas.toDataURL('image/png');

      try {
        const result = await generateHeatmapOverlay({
          videoDataUri,
          keywords: 'high density areas, crowd congestion',
        });
        setHeatmapUrl(result.heatmapOverlayDataUri);
      } catch (error) {
        console.error('Failed to generate heatmap', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not generate heatmap overlay.',
        });
        setShowHeatmap(false);
      } finally {
        setIsLoading(false);
      }
    } else {
      setHeatmapUrl(null);
    }
  };

  return (
    <Card className="border-4 border-[hsl(var(--chart-3))]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Live Video Feed</CardTitle>
            <CardDescription>Central square monitoring</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="heatmap-toggle"
              checked={showHeatmap}
              onCheckedChange={handleHeatmapToggle}
              disabled={isLoading || !hasCameraPermission}
              aria-label="Toggle heatmap"
            />
            <Label htmlFor="heatmap-toggle">Show Heatmap</Label>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
           <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
            {hasCameraPermission === false && (
                <div className="absolute inset-0 flex items-center justify-center p-4">
                     <Alert variant="destructive">
                      <AlertTitle>Camera Access Required</AlertTitle>
                      <AlertDescription>
                        Please allow camera access in your browser settings to see the live feed.
                      </AlertDescription>
                    </Alert>
                </div>
            )}
            {heatmapUrl && (
              <Image
                src={heatmapUrl}
                alt="Heatmap overlay"
                fill
                className="pointer-events-none object-contain opacity-70"
              />
            )}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
