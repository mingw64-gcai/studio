
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
import { Loader2, Wand, Trash2 } from 'lucide-react';
import { solveCrowdProblem, SolveCrowdProblemOutput } from '@/ai/flows/solve-crowd-problem';
import { useToast } from '@/hooks/use-toast';
import { Separator } from './ui/separator';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

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
  
  const handleClear = () => {
    setProblem('');
    setResult(null);
  }

  return (
    <Card className="border-t-8 border-t-[hsl(var(--chart-4))]">
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
        <div className="flex gap-2">
            <Button onClick={handleSolve} disabled={isLoading} className="w-full">
            {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Wand className="mr-2 h-4 w-4" />
            )}
            Find Solution
            </Button>
            <Button 
                onClick={handleClear} 
                variant="outline" 
                disabled={isLoading}
                className="hover:bg-[#34A853]/10 hover:border-[#34A853]/50 hover:text-[#34A853]"
            >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear
            </Button>
        </div>

        {(isLoading || result) && (
          <div className="mt-4 rounded-md border bg-muted/50 p-4 space-y-4">
            {isLoading && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Generating solution...</span>
              </div>
            )}
            {result && (
              <div className="space-y-4 text-sm">
                <div>
                    <h3 className="font-semibold text-foreground">Problem Analysis</h3>
                    <ReactMarkdown className="prose-sm max-w-none text-foreground prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-ul:text-foreground prose-li:text-foreground">{result.analysis}</ReactMarkdown>
                </div>
                <Separator />
                 <div>
                    <h3 className="font-semibold text-foreground">Suggested Solution</h3>
                    <ReactMarkdown className="prose-sm max-w-none text-foreground prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-ul:text-foreground prose-li:text-foreground">{result.solution}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
