'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { smartArbitrageSuggestion, type SmartArbitrageSuggestionOutput } from '@/ai/flows/smart-arbitrage-suggestion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import SuggestionDisplay from './SuggestionDisplay';
import { NETWORK_OPTIONS, BORROWING_PROTOCOL_OPTIONS, DEX_OPTIONS, TOKEN_PAIR_OPTIONS } from '@/lib/constants';
import { Loader2, Settings, Search, BarChartBig } from 'lucide-react';

const formSchema = z.object({
  network: z.string().min(1, "Network selection is required."),
  borrowingProtocol: z.string().min(1, "Borrowing protocol is required."),
  dexs: z.array(z.string()).min(1, "At least one DEX must be selected."),
  tokenPair: z.string().min(1, "Token pair selection is required."),
  availableLiquidity: z.coerce.number().positive("Available liquidity must be a positive number."),
  gasBudget: z.coerce.number().positive("Gas budget must be a positive number."),
});

type ArbitrageFormValues = z.infer<typeof formSchema>;

export default function ArbitrageForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<SmartArbitrageSuggestionOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<ArbitrageFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      network: '',
      borrowingProtocol: '',
      dexs: [],
      tokenPair: '',
      availableLiquidity: 1000,
      gasBudget: 50,
    },
  });

  async function onSubmit(values: ArbitrageFormValues) {
    setIsLoading(true);
    setSuggestion(null);
    setError(null);
    try {
      const result = await smartArbitrageSuggestion({
        network: values.network,
        borrowingProtocol: values.borrowingProtocol,
        dexs: values.dexs,
        tokenPair: values.tokenPair,
        availableLiquidity: values.availableLiquidity,
        gasBudget: values.gasBudget,
      });
      setSuggestion(result);
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
  }

  return (
    <>
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center justify-center">
            <Settings className="mr-2 h-7 w-7 icon-glow-primary" />
            Arbitrage Configuration
          </CardTitle>
          <CardDescription className="text-center">
            Set your parameters to get an AI-powered arbitrage suggestion.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="network"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Blockchain Network</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="text-base">
                          <SelectValue placeholder="Select a network" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {NETWORK_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value} className="text-base">
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="borrowingProtocol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Borrowing Protocol</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="text-base">
                          <SelectValue placeholder="Select a protocol" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {BORROWING_PROTOCOL_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value} className="text-base">
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="tokenPair"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Token Pair</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="text-base">
                          <SelectValue placeholder="Select a token pair" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TOKEN_PAIR_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value} className="text-base">
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel className="text-lg">Decentralized Exchanges (DEXs)</FormLabel>
                <div className="grid grid-cols-2 gap-4 pt-2">
                {DEX_OPTIONS.map((item) => (
                  <FormField
                    key={item.id}
                    control={form.control}
                    name="dexs"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={item.id}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(item.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...(field.value || []), item.id])
                                  : field.onChange(
                                      (field.value || []).filter(
                                        (value) => value !== item.id
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal text-base">
                            {item.label}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
                </div>
                <FormMessage>{form.formState.errors.dexs?.message}</FormMessage>
              </FormItem>

              <FormField
                control={form.control}
                name="availableLiquidity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Available Liquidity (e.g., in USD)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 1000" {...field} className="text-base font-code" />
                    </FormControl>
                    <FormDescription>
                      The amount of liquidity you plan to use for the arbitrage.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gasBudget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Gas Budget (e.g., in USD)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 50" {...field} className="text-base font-code" />
                    </FormControl>
                    <FormDescription>
                      Your maximum budget for transaction gas fees.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" disabled={isLoading} className="w-full py-6 text-xl btn-glow-primary">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <BarChartBig className="mr-2 h-6 w-6" />
                    Get Smart Suggestion
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <SuggestionDisplay suggestion={suggestion} isLoading={isLoading} error={error} />
    </>
  );
}
