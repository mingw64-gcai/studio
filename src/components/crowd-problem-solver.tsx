
'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, Wand } from 'lucide-react';
import { solveCrowdProblem, SolveCrowdProblemOutput } from '@/ai/flows/solve-crowd-problem';
import { useToast } from '@/hooks/use-toast';
import { Separator } from './ui/separator';

export function CrowdProblemSolver() {
  const { toast } = useToast();
  const [problem, setProblem] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SolveCrowdProblemOutput | null>(null);

  const handleSolve = async () => {
    if (!problem.trim()) {
      toast({
        variant: 'destructive',
        title: 'Input required',
        description: 'Please describe the crowding problem.',
      });
      return;
    }
    setIsLoading(true);
    setResult(null);
    try {
      const response = await solveCrowdProblem({ problemDescription: problem });
      setResult(response);
    } catch (error) {
      console.error('Failed to solve problem', error);
      setResult({
        analysis: 'Error: Could not retrieve analysis.',
        solution: 'Error: Could not retrieve solution.',
      });
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: 'There was a problem communicating with the AI model.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crowd Problem Solver</CardTitle>
        <CardDescription>
          Describe a crowding issue, and the AI will suggest a solution.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="e.g., 'Long queues are forming at the main entrance, causing blockages.'"
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          disabled={isLoading}
          rows={3}
        />
        <Button onClick={handleSolve} disabled={isLoading} className="w-full">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Wand className="mr-2 h-4 w-4" />
          )}
          Find Solution
        </Button>

        {(isLoading || result) && (
          <div className="mt-4 rounded-md border bg-muted/50 p-4 space-y-4">
            {isLoading && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Generating solution...</span>
              </div>
            )}
            {result && (
              <div className="space-y-4">
                <div>
                    <h3 className="font-semibold text-foreground">Problem Analysis</h3>
                    <p className="text-sm text-foreground">{result.analysis}</p>
                </div>
                <Separator />
                 <div>
                    <h3 className="font-semibold text-foreground">Suggested Solution</h3>
                    <p className="text-sm text-foreground">{result.solution}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
