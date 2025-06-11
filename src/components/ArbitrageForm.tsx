'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { smartArbitrageSuggestion, type SmartArbitrageSuggestionOutput } from '@/ai/flows/smart-arbitrage-suggestion';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import SuggestionDisplay from './SuggestionDisplay'; // Will be shown below the form
import { 
  NETWORK_OPTIONS, 
  BORROWING_PROTOCOL_OPTIONS, 
  ARBITRAGE_FROM_SWAP_OPTIONS,
  ARBITRAGE_TO_SWAP_OPTIONS,
  COIN_OPTIONS
} from '@/lib/constants';
import { Loader2, BarChartBig, RotateCcw } from 'lucide-react';

const formSchema = z.object({
  network: z.string().min(1, "Network selection is required."),
  borrowingProtocol: z.string().min(1, "Borrowing protocol is required."),
  arbitrageFromSwap: z.string().min(1, "Source DEX is required."),
  arbitrageToSwap: z.string().min(1, "Target DEX is required."),
  arbitrageCoinFrom: z.string().min(1, "Source coin is required."),
  arbitrageCoinTo: z.string().min(1, "Target coin is required."),
  amountFrom: z.coerce.number().positive("Amount must be positive.").optional(),
  gasFeeAmount: z.coerce.number().positive("Gas fee budget must be positive.").optional(),
}).refine(data => data.amountFrom || data.gasFeeAmount, {
  message: "Either Amount or Gas Fee Budget must be provided.",
  path: ["amountFrom"], // You can point to one or a general path
}).refine(data => data.arbitrageCoinFrom !== data.arbitrageCoinTo, {
  message: "Source and Target coins must be different.",
  path: ["arbitrageCoinTo"],
}).refine(data => data.arbitrageFromSwap !== data.arbitrageToSwap, {
  message: "Source and Target DEXs must be different in a typical arbitrage.",
  path: ["arbitrageToSwap"],
});

type ArbitrageFormValues = z.infer<typeof formSchema>;

export default function ArbitrageForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isExecuted, setIsExecuted] = useState(false);
  const [suggestion, setSuggestion] = useState<SmartArbitrageSuggestionOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [estimatedProfitDisplay, setEstimatedProfitDisplay] = useState<string>('$0.00');
  const [gasFeeDisplay, setGasFeeDisplay] = useState<string>('$0.00');
  const [showGasInput, setShowGasInput] = useState(true);

  const { toast } = useToast();

  const form = useForm<ArbitrageFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      network: NETWORK_OPTIONS[0]?.value || '',
      borrowingProtocol: BORROWING_PROTOCOL_OPTIONS[0]?.value || '',
      arbitrageFromSwap: ARBITRAGE_FROM_SWAP_OPTIONS[0]?.value || '',
      arbitrageToSwap: ARBITRAGE_TO_SWAP_OPTIONS[0]?.value || '',
      arbitrageCoinFrom: COIN_OPTIONS[0]?.value || '',
      arbitrageCoinTo: COIN_OPTIONS[1]?.value || '', // Ensure different default
    },
  });

  const watchAmountFrom = form.watch('amountFrom');
  const watchGasFeeAmount = form.watch('gasFeeAmount');

  useEffect(() => {
    if (watchAmountFrom && watchAmountFrom > 0) {
      setShowGasInput(false);
      // Simulate client-side fee calculation based on HTML logic (simplified)
      const networkFee = form.getValues('network') === 'ethereum' ? 50 : 10;
      const dexFee = watchAmountFrom * 0.003; // Simplified
      setGasFeeDisplay(`$${(networkFee + dexFee).toFixed(2)}`);
    } else {
      setShowGasInput(true);
      setGasFeeDisplay('$0.00');
    }
    // Simple profit calculation for display, AI will provide more accurate
    if (watchAmountFrom) {
        const priceDiff = 0.03; // Highly simplified placeholder
        const grossProfit = watchAmountFrom * priceDiff;
        const gasFee = parseFloat(gasFeeDisplay.replace(/[^0-9.]/g, '')) || 0;
        setEstimatedProfitDisplay(`$${(grossProfit - gasFee).toFixed(2)}`);
    } else {
        setEstimatedProfitDisplay('$0.00');
    }

  }, [watchAmountFrom, form, gasFeeDisplay]);
  
  useEffect(() => {
    if (suggestion) {
        setEstimatedProfitDisplay(`$${suggestion.estimatedProfit.toLocaleString()}`);
        if (suggestion.suggestedAmount && showGasInput){ // AI suggested amount
             form.setValue('amountFrom', suggestion.suggestedAmount);
        }
    }
  }, [suggestion, form, showGasInput]);


  const handleFormSubmit = async (values: ArbitrageFormValues) => {
    if (isExecuted) { // Reset form
      form.reset();
      setSuggestion(null);
      setError(null);
      setIsLoading(false);
      setIsExecuted(false);
      setEstimatedProfitDisplay('$0.00');
      setGasFeeDisplay('$0.00');
      setShowGasInput(true);
      toast({ title: "Form Reset", description: "Ready for new arbitrage configuration." });
      return;
    }

    setIsLoading(true);
    setSuggestion(null);
    setError(null);

    const tokenPair = `${values.arbitrageCoinFrom}/${values.arbitrageCoinTo}`;
    const dexs = [values.arbitrageFromSwap, values.arbitrageToSwap];

    try {
      const result = await smartArbitrageSuggestion({
        network: values.network,
        borrowingProtocol: values.borrowingProtocol,
        dexs: dexs,
        tokenPair: tokenPair,
        availableLiquidity: values.amountFrom || 0, // AI needs one amount
        gasBudget: values.gasFeeAmount || parseFloat(gasFeeDisplay.replace(/[^0-9.]/g, '')) || 0,
      });
      setSuggestion(result);
      setIsExecuted(true); // Mark as "executed" to show reset button
      toast({
        title: "Suggestion Generated!",
        description: "AI has provided an arbitrage suggestion.",
      });
    } catch (err) {
      console.error("Error fetching suggestion:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to generate suggestion: ${errorMessage}`,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderSelect = (name: keyof ArbitrageFormValues, placeholder: string, options: {value: string, label: string}[]) => (
     <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <FormItem className="w-full">
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="custom-btn !text-left !justify-between !text-base !text-primary !bg-background !border !border-primary !shadow-primary-glow-sm hover:!shadow-primary-glow-md focus:!ring-ring">
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-background border-primary text-primary">
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="hover:!bg-primary/20 focus:!bg-primary/30">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage className="text-accent" />
          </FormItem>
        )}
      />
  );

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-3 w-full">
          {renderSelect("network", "Select Network", NETWORK_OPTIONS)}
          {renderSelect("borrowingProtocol", "Select Borrowing Protocol", BORROWING_PROTOCOL_OPTIONS)}
          {renderSelect("arbitrageFromSwap", "Select Arbitrage From DEX", ARBITRAGE_FROM_SWAP_OPTIONS)}
          {renderSelect("arbitrageToSwap", "Select Arbitrage To DEX", ARBITRAGE_TO_SWAP_OPTIONS)}
          {renderSelect("arbitrageCoinFrom", "Select Source Coin", COIN_OPTIONS)}
          {renderSelect("arbitrageCoinTo", "Select Target Coin", COIN_OPTIONS)}

          <FormField
            control={form.control}
            name="amountFrom"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Enter amount (e.g. Source Coin)" 
                    {...field} 
                    onChange={e => field.onChange(parseFloat(e.target.value))}
                    className="custom-btn !text-base !text-primary !bg-background !border !border-primary !shadow-primary-glow-sm hover:!shadow-primary-glow-md focus:!ring-ring"
                  />
                </FormControl>
                <FormMessage className="text-accent" />
              </FormItem>
            )}
          />
        
          {showGasInput ? (
            <FormField
              control={form.control}
              name="gasFeeAmount"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Enter gas fee budget (USD)" 
                      {...field} 
                      onChange={e => field.onChange(parseFloat(e.target.value))}
                      className="custom-btn !text-base !text-primary !bg-background !border !border-primary !shadow-primary-glow-sm hover:!shadow-primary-glow-md focus:!ring-ring"
                    />
                  </FormControl>
                  <FormMessage className="text-accent" />
                </FormItem>
              )}
            />
          ) : (
            <div className="w-full p-2.5 border border-primary rounded-md bg-background text-primary shadow-primary-glow-sm text-center">
              Gas Fee: {gasFeeDisplay}
            </div>
          )}

          <div className="w-full p-2.5 border border-primary rounded-md bg-background text-primary shadow-primary-glow-sm text-center text-lg">
            Estimated Arbitrage Profit: {estimatedProfitDisplay}
          </div>
          
          <Button type="submit" disabled={isLoading} className="custom-btn btn-glow-primary w-full !text-lg !py-3 flex items-center justify-center gap-2">
            {isLoading ? (
              <><Loader2 className="h-6 w-6 animate-spin" /> Processing...</>
            ) : isExecuted ? (
              <><RotateCcw className="h-6 w-6" /> Reset</>
            ) : (
              <><BarChartBig className="h-6 w-6" /> { watchGasFeeAmount && !watchAmountFrom ? 'Get Suggestion & Execute' : 'Execute'}</>
            )}
          </Button>
        </form>
      </Form>
      
      {/* SuggestionDisplay can be shown here if needed, or integrated into profit display */}
      {/* <SuggestionDisplay suggestion={suggestion} isLoading={isLoading} error={error} /> */}
      { suggestion && !isLoading && !error && (
        <div className="mt-4 w-full p-4 border-2 border-primary rounded-lg shadow-primary-glow-md bg-background/50 space-y-2">
            <h3 className="text-lg font-semibold text-primary text-center">AI Strategy Explanation:</h3>
            <p className="text-sm text-foreground/80">{suggestion.strategyExplanation}</p>
        </div>
      )}
       { error && !isLoading && (
        <div className="mt-4 w-full p-4 border-2 border-accent rounded-lg shadow-accent-glow-sm bg-background/50">
            <h3 className="text-lg font-semibold text-accent text-center">Error:</h3>
            <p className="text-sm text-accent/80">{error}</p>
        </div>
      )}

    </>
  );
}
