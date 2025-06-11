import type { SmartArbitrageSuggestionOutput } from '@/ai/flows/smart-arbitrage-suggestion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'; // Card might not be used if simplified.
import { Lightbulb, TrendingUp, ShieldCheck, MessageSquareText, AlertTriangle } from 'lucide-react';

interface SuggestionDisplayProps {
  suggestion: SmartArbitrageSuggestionOutput | null;
  isLoading: boolean;
  error: string | null;
}

// This component can be simplified or its content integrated elsewhere
// as the new design has a more direct "Estimated Profit" display.
// For now, keeping it for displaying detailed AI strategy explanation if needed.
export default function SuggestionDisplay({ suggestion, isLoading, error }: SuggestionDisplayProps) {
  if (isLoading) {
    return (
      <div className="w-full max-w-md mt-6 p-4 border border-primary rounded-lg shadow-primary-glow-sm bg-background/50 text-center">
        <Lightbulb className="mr-2 h-6 w-6 inline animate-pulse text-primary" />
        <span className="font-headline text-xl text-primary">Generating Smart Suggestion...</span>
        <div className="mt-2 h-3 bg-primary/30 rounded w-3/4 mx-auto animate-pulse"></div>
        <div className="mt-1 h-3 bg-primary/30 rounded w-1/2 mx-auto animate-pulse"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-md mt-6 p-4 border border-accent rounded-lg shadow-accent-glow-sm bg-background/50 text-center">
         <AlertTriangle className="mr-2 h-6 w-6 inline text-accent" />
        <span className="font-headline text-xl text-accent">Error Generating Suggestion</span>
        <p className="text-sm text-accent/80 mt-1">{error}</p>
      </div>
    );
  }

  if (!suggestion) {
    return null; // No suggestion to display yet
  }

  // This detailed display might be shown below the form for the AI's explanation.
  // The primary profit and suggested amount might be directly in the form.
  return (
    <div className="w-full max-w-md mt-6 p-4 border-2 border-primary rounded-lg shadow-primary-glow-md bg-background/50 space-y-4">
      <div className="text-center">
        <h2 className="font-headline text-2xl flex items-center justify-center text-primary">
          <Lightbulb className="mr-2 h-7 w-7" />
          AI Arbitrage Suggestion
        </h2>
        <p className="text-muted-foreground text-md">
          AI-Optimized Trading Strategy Details:
        </p>
      </div>
      
      <div className="space-y-3 text-sm">
        <div className="flex items-start space-x-2 p-2 bg-primary/10 rounded-md">
          <TrendingUp className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-foreground">Suggested Arbitrage Amount:</h3>
            <p className="font-code text-primary">{suggestion.suggestedAmount.toLocaleString()}</p>
          </div>
        </div>
        <div className="flex items-start space-x-2 p-2 bg-green-500/10 rounded-md">
          <ShieldCheck className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-foreground">Estimated Profit:</h3>
            <p className="font-code text-green-400">{suggestion.estimatedProfit.toLocaleString()}</p>
          </div>
        </div>
        <div className="flex items-start space-x-2 p-2 bg-primary/10 rounded-md">
          <MessageSquareText className="h-5 w-5 text-foreground mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-foreground">Strategy Explanation:</h3>
            <p className="text-muted-foreground">{suggestion.strategyExplanation}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
