'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  NETWORK_OPTIONS, 
  BORROWING_PROTOCOL_OPTIONS, 
  ARBITRAGE_FROM_SWAP_OPTIONS,
  ARBITRAGE_TO_SWAP_OPTIONS,
  COIN_OPTIONS
} from '@/lib/constants';
import { BarChartBig, RotateCcw, Loader2 } from 'lucide-react';

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
  path: ["amountFrom"],
}).refine(data => data.arbitrageCoinFrom !== data.arbitrageCoinTo, {
  message: "Source and Target coins must be different.",
  path: ["arbitrageCoinTo"],
}).refine(data => data.arbitrageFromSwap !== data.arbitrageToSwap, {
  message: "Source and Target DEXs must be different in a typical arbitrage.",
  path: ["arbitrageToSwap"],
});

type ArbitrageFormValues = z.infer<typeof formSchema>;

export default function ArbitrageForm() {
  const [isLoading, setIsLoading] = useState(false); // Kept for simulating processing
  const [isExecuted, setIsExecuted] = useState(false);
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
      arbitrageCoinTo: COIN_OPTIONS[1]?.value || '',
    },
  });

  const watchAmountFrom = form.watch('amountFrom');
  const watchedCoinFrom = form.watch('arbitrageCoinFrom');
  // const watchGasFeeAmount = form.watch('gasFeeAmount'); // Not directly used in button text anymore

  useEffect(() => {
    const currentAmountFrom = form.getValues('amountFrom');
    const currentNetwork = form.getValues('network');
    const currentArbitrageFromSwap = form.getValues('arbitrageFromSwap');
    const currentArbitrageToSwap = form.getValues('arbitrageToSwap');
    const currentCoinFrom = form.getValues('arbitrageCoinFrom');
    const currentCoinTo = form.getValues('arbitrageCoinTo');
    
    if (currentAmountFrom && currentAmountFrom > 0) {
      setShowGasInput(false);
      const networkFee = currentNetwork === 'ethereum' ? 50 : (currentNetwork === 'arbitrum' || currentNetwork === 'optimism' ? 5 : (currentNetwork === 'polygon' ? 1 : 10));
      const dexFee = (currentArbitrageFromSwap && currentArbitrageToSwap && currentAmountFrom > 0) ? ((currentArbitrageFromSwap === 'uniswap' || currentArbitrageToSwap === 'uniswap') ? 0.003 * currentAmountFrom : 0.002 * currentAmountFrom) : 0;
      const totalFees = networkFee + dexFee;
      setGasFeeDisplay(`$${totalFees.toFixed(2)}`);
    } else {
      setShowGasInput(true);
      setGasFeeDisplay('$0.00');
    }

    let priceDiff = 0;
    if (currentCoinFrom && currentCoinTo && currentCoinFrom !== currentCoinTo) {
      priceDiff = (currentArbitrageFromSwap === 'uniswap' && currentArbitrageToSwap === 'sushiswap') ? 0.05 : 0.03;
    }
    const grossProfit = (currentAmountFrom || 0) * priceDiff;
    const gasFeeNumber = parseFloat(gasFeeDisplay.replace(/[^0-9.]/g, '')) || parseFloat(form.getValues('gasFeeAmount')?.toString() || '0') || 0;
    
    setEstimatedProfitDisplay(`$${(grossProfit - gasFeeNumber).toFixed(2)}`);

  }, [form, gasFeeDisplay]); // Re-run when form values affecting fees/profit change

  const handleFormSubmit = async (values: ArbitrageFormValues) => {
    if (isExecuted) {
      form.reset();
      setIsLoading(false);
      setIsExecuted(false);
      setEstimatedProfitDisplay('$0.00');
      setGasFeeDisplay('$0.00');
      setShowGasInput(true);
      toast({ title: "Form Reset", description: "Ready for new arbitrage configuration." });
      return;
    }

    setIsLoading(true);
    // Simulate execution
    setTimeout(() => {
      setIsLoading(false);
      setIsExecuted(true);
      toast({
        title: "Arbitrage Executed! (Simulated)",
        description: "Your trade has been processed.",
      });
    }, 1500);
  };
  
  const renderSelect = (name: keyof ArbitrageFormValues, placeholder: string, options: {value: string, label: string}[]) => (
     <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <FormItem className="w-full form-item-center">
            <Select onValueChange={(value) => {
                field.onChange(value);
                form.trigger(); // Trigger re-validation and re-calculation
            }} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="custom-btn !text-left !justify-between !text-base !text-primary !bg-background !border !border-primary !shadow-primary-glow-sm hover:!shadow-primary-glow-md focus:!ring-ring">
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-background border-primary text-primary text-center">
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="hover:!bg-primary/20 focus:!bg-primary/30 text-center justify-center">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage className="text-accent text-center" />
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
              <FormItem className="w-full form-item-center">
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder={`Enter amount (${watchedCoinFrom || COIN_OPTIONS.find(c => c.value === form.getValues().arbitrageCoinFrom)?.label || 'Source Coin'})`}
                    {...field} 
                    onChange={e => {
                        field.onChange(parseFloat(e.target.value));
                        form.trigger(); // Trigger re-validation and re-calculation
                    }}
                    className="custom-btn !text-base !text-primary !bg-background !border !border-primary !shadow-primary-glow-sm hover:!shadow-primary-glow-md focus:!ring-ring text-center"
                  />
                </FormControl>
                <FormMessage className="text-accent text-center" />
              </FormItem>
            )}
          />
        
          {showGasInput ? (
            <FormField
              control={form.control}
              name="gasFeeAmount"
              render={({ field }) => (
                <FormItem className="w-full form-item-center">
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Enter gas fee budget (USD)" 
                      {...field} 
                      onChange={e => {
                        field.onChange(parseFloat(e.target.value));
                         form.trigger(); // Trigger re-validation and re-calculation
                         // If gas fee is entered and no amount, simulate adjustArbitrage logic from HTML
                         const currentAmountFrom = form.getValues('amountFrom');
                         if (!currentAmountFrom || currentAmountFrom <= 0) {
                            const gasValue = parseFloat(e.target.value);
                            if (gasValue > 0) {
                                let suggestedAmount = 0;
                                if (gasValue <= 10) suggestedAmount = 500;
                                else if (gasValue <= 50) suggestedAmount = 2000;
                                else suggestedAmount = 5000;
                                form.setValue('amountFrom', suggestedAmount, { shouldValidate: true });
                                setShowGasInput(false); // Hide gas input as amount is now set
                            }
                         }
                      }}
                      className="custom-btn !text-base !text-primary !bg-background !border !border-primary !shadow-primary-glow-sm hover:!shadow-primary-glow-md focus:!ring-ring text-center"
                    />
                  </FormControl>
                  <FormMessage className="text-accent text-center" />
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
              <><BarChartBig className="h-6 w-6" /> Execute</>
            )}
          </Button>
        </form>
      </Form>
    </>
  );
}
