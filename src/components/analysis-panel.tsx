"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { analyzeHistoricalData } from "@/ai/flows/analyze-historical-data";
import { useToast } from "@/hooks/use-toast";

export function AnalysisPanel() {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!query.trim()) {
      toast({
        variant: "destructive",
        title: "Input required",
        description: "Please enter a query for analysis.",
      });
      return;
    }
    setIsLoading(true);
    setAnalysisResult(null);
    try {
      const result = await analyzeHistoricalData({ query });
      setAnalysisResult(result.analysisResult);
    } catch (error) {
      console.error("Failed to analyze data", error);
      setAnalysisResult("Error: Could not retrieve analysis at this time.");
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "There was a problem communicating with the AI model.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Predictive Analysis</CardTitle>
        <CardDescription>
          Query historical data for future crowd predictions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="e.g., 'Predict crowd density for the main concert tomorrow evening.'"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={isLoading}
        />
        <Button onClick={handleAnalyze} disabled={isLoading} className="w-full">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          Analyze
        </Button>

        {(isLoading || analysisResult) && (
          <div className="mt-4 rounded-md border bg-muted/50 p-4">
            {isLoading && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Analyzing...</span>
              </div>
            )}
            {analysisResult && (
              <p className="text-sm text-foreground">{analysisResult}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
