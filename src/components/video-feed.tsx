"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateHeatmapOverlay } from "@/ai/flows/generate-heatmap-overlay";

export function VideoFeed() {
  const { toast } = useToast();
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [heatmapUrl, setHeatmapUrl] = useState<string | null>(null);

  const handleHeatmapToggle = async (checked: boolean) => {
    setShowHeatmap(checked);
    if (checked) {
      setIsLoading(true);
      setHeatmapUrl(null);
      try {
        // In a real app, you would get the video frame data URI here
        const fakeVideoDataUri =
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

        const result = await generateHeatmapOverlay({
          videoDataUri: fakeVideoDataUri,
          keywords: "high density areas, crowd congestion",
        });

        // The AI returns a placeholder, we'll use our own for better viz
        // setHeatmapUrl(result.heatmapOverlayDataUri);
        setHeatmapUrl("https://placehold.co/1280x720/ff0000/ff0000.png?text=+");
      } catch (error) {
        console.error("Failed to generate heatmap", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not generate heatmap overlay.",
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
    <Card>
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
              disabled={isLoading}
              aria-label="Toggle heatmap"
            />
            <Label htmlFor="heatmap-toggle">Show Heatmap</Label>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
          <Image
            src="https://placehold.co/1280x720"
            alt="Live video feed of a public space"
            fill
            className="object-cover"
            data-ai-hint="crowd event"
          />
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          {heatmapUrl && (
            <Image
              src={heatmapUrl}
              alt="Crowd density heatmap"
              fill
              className="object-cover opacity-50"
              data-ai-hint="heatmap overlay"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
