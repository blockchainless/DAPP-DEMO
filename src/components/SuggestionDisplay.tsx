import type { SmartArbitrageSuggestionOutput } from '@/ai/flows/smart-arbitrage-suggestion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, TrendingUp, ShieldCheck, MessageSquareText } from 'lucide-react';

interface SuggestionDisplayProps {
  suggestion: SmartArbitrageSuggestionOutput | null;
  isLoading: boolean;
  error: string | null;
}

export default function SuggestionDisplay({ suggestion, isLoading, error }: SuggestionDisplayProps) {
  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mt-8 shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center justify-center">
            <Lightbulb className="mr-2 h-7 w-7 icon-glow-primary" />
            Generating Smart Suggestion...
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mx-auto mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-2xl mt-8 shadow-xl border-destructive">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-destructive flex items-center justify-center">
            Error
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center text-destructive-foreground">
          <p>{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!suggestion) {
    return null;
  }

  return (
    <Card className="w-full max-w-2xl mt-8 shadow-2xl border-2 border-primary element-glow-primary">
      <CardHeader className="text-center">
        <CardTitle className="font-headline text-3xl flex items-center justify-center text-primary">
          <Lightbulb className="mr-3 h-8 w-8 icon-glow-primary" />
          Smart Arbitrage Suggestion
        </CardTitle>
        <CardDescription className="text-muted-foreground text-lg">
          AI-Optimized Trading Strategy
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 text-lg">
        <div className="flex items-start space-x-3 p-4 bg-card/50 rounded-lg">
          <TrendingUp className="h-8 w-8 text-primary mt-1 icon-glow-primary flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-xl text-foreground">Suggested Amount:</h3>
            <p className="font-code text-primary text-2xl">{suggestion.suggestedAmount.toLocaleString()}</p>
          </div>
        </div>
        <div className="flex items-start space-x-3 p-4 bg-card/50 rounded-lg">
          <ShieldCheck className="h-8 w-8 text-green-400 mt-1 icon-glow-primary flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-xl text-foreground">Estimated Profit:</h3>
            <p className="font-code text-green-400 text-2xl">{suggestion.estimatedProfit.toLocaleString()}</p>
          </div>
        </div>
        <div className="flex items-start space-x-3 p-4 bg-card/50 rounded-lg">
          <MessageSquareText className="h-8 w-8 text-foreground mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-xl text-foreground">Strategy Explanation:</h3>
            <p className="text-muted-foreground">{suggestion.strategyExplanation}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
