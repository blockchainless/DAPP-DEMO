
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
  amountTo: z.coerce.number().positive("Amount must be positive.").optional(), // New field for target amount
  gasFeeAmount: z.coerce.number().positive("Gas fee budget must be positive.").optional(),
}).refine(data => data.amountFrom || data.amountTo || data.gasFeeAmount, {
  message: "Either Source Amount, Target Amount, or Gas Fee Budget must be provided.",
  path: ["amountFrom"], // Error shown under the first amount field or gas fee if both amounts are empty
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
      amountFrom: undefined,
      amountTo: undefined,
      gasFeeAmount: undefined,
    },
  });

  const watchedFormValues = form.watch();
  const watchedCoinFromLabel = COIN_OPTIONS.find(c => c.value === watchedFormValues.arbitrageCoinFrom)?.label;
  const watchedCoinToLabel = COIN_OPTIONS.find(c => c.value === watchedFormValues.arbitrageCoinTo)?.label;

  useEffect(() => {
    const {
      amountFrom: currentAmountFrom,
      amountTo: currentAmountTo,
      network: currentNetwork,
      arbitrageFromSwap: currentArbitrageFromSwap,
      arbitrageToSwap: currentArbitrageToSwap,
      arbitrageCoinFrom: currentCoinFrom,
      arbitrageCoinTo: currentCoinTo,
      gasFeeAmount: currentGasFeeAmount
    } = watchedFormValues;

    const shouldShowGasInput = !(currentAmountFrom && currentAmountFrom > 0) && !(currentAmountTo && currentAmountTo > 0);
    if (showGasInput !== shouldShowGasInput) {
      setShowGasInput(shouldShowGasInput);
    }
    
    const tradeAmount = (currentAmountFrom && currentAmountFrom > 0) ? currentAmountFrom : ((currentAmountTo && currentAmountTo > 0) ? currentAmountTo : 0);
    
    let calculatedGasFeeValue = 0;
    if (!shouldShowGasInput) {
      const networkFee = currentNetwork === 'ethereum' ? 50 : (currentNetwork === 'arbitrum' || currentNetwork === 'optimism' ? 5 : (currentNetwork === 'polygon' ? 1 : 10));
      const dexFee = (currentArbitrageFromSwap && currentArbitrageToSwap && tradeAmount > 0) ? 
                     ((currentArbitrageFromSwap === 'uniswap' || currentArbitrageToSwap === 'uniswap') ? 0.003 * tradeAmount : 0.002 * tradeAmount) 
                     : 0;
      calculatedGasFeeValue = networkFee + dexFee;
      const newGasFeeDisplay = `$${calculatedGasFeeValue.toFixed(2)}`;
      if (gasFeeDisplay !== newGasFeeDisplay) {
        setGasFeeDisplay(newGasFeeDisplay);
      }
    } else {
      if (gasFeeDisplay !== '$0.00') {
        setGasFeeDisplay('$0.00');
      }
    }

    let priceDiff = 0;
    if (currentCoinFrom && currentCoinTo && currentCoinFrom !== currentCoinTo) {
      priceDiff = (currentArbitrageFromSwap === 'uniswap' && currentArbitrageToSwap === 'sushiswap') ? 0.05 : 0.03; // Simplified
    }
    const grossProfit = tradeAmount * priceDiff;
    
    const gasFeeForProfitCalc = shouldShowGasInput ? (currentGasFeeAmount || 0) : calculatedGasFeeValue;
    
    const newEstimatedProfitDisplay = `$${(grossProfit - gasFeeForProfitCalc).toFixed(2)}`;
    if (estimatedProfitDisplay !== newEstimatedProfitDisplay) {
      setEstimatedProfitDisplay(newEstimatedProfitDisplay);
    }

  }, [watchedFormValues, showGasInput, gasFeeDisplay, estimatedProfitDisplay, setShowGasInput, setGasFeeDisplay, setEstimatedProfitDisplay]);


  const handleFormSubmit = async (values: ArbitrageFormValues) => {
    if (isExecuted) {
      form.reset({ // Reset with default values, explicitly undefined for optionals
          network: NETWORK_OPTIONS[0]?.value || '',
          borrowingProtocol: BORROWING_PROTOCOL_OPTIONS[0]?.value || '',
          arbitrageFromSwap: ARBITRAGE_FROM_SWAP_OPTIONS[0]?.value || '',
          arbitrageToSwap: ARBITRAGE_TO_SWAP_OPTIONS[0]?.value || '',
          arbitrageCoinFrom: COIN_OPTIONS[0]?.value || '',
          arbitrageCoinTo: COIN_OPTIONS[1]?.value || '',
          amountFrom: undefined,
          amountTo: undefined,
          gasFeeAmount: undefined,
      });
      setIsLoading(false);
      setIsExecuted(false);
      // States like estimatedProfitDisplay, gasFeeDisplay, showGasInput will be reset by useEffect
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
        description: `Trade for ${values.amountFrom ? values.amountFrom : values.amountTo} ${values.amountFrom ? values.arbitrageCoinFrom : values.arbitrageCoinTo} processed.`,
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
                    placeholder={`Enter amount (${watchedCoinFromLabel || 'Source Coin'})`}
                    {...field} 
                    value={field.value ?? ""}
                    onChange={e => {
                        const val = e.target.value;
                        field.onChange(val === "" ? undefined : parseFloat(val));
                    }}
                    className="custom-btn !text-base !text-primary !bg-background !border !border-primary !shadow-primary-glow-sm hover:!shadow-primary-glow-md focus:!ring-ring text-center"
                  />
                </FormControl>
                <FormMessage className="text-accent text-center" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amountTo"
            render={({ field }) => (
              <FormItem className="w-full form-item-center">
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder={`Enter amount (${watchedCoinToLabel || 'Target Coin'})`}
                    {...field} 
                    value={field.value ?? ""}
                    onChange={e => {
                      const val = e.target.value;
                      field.onChange(val === "" ? undefined : parseFloat(val));
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
                      value={field.value ?? ""}
                      onChange={e => {
                        const val = e.target.value;
                        const gasValue = val === "" ? undefined : parseFloat(val);
                        field.onChange(gasValue);
                        
                        const currentAmountFrom = form.getValues('amountFrom');
                        const currentAmountTo = form.getValues('amountTo');

                        if ((!currentAmountFrom || currentAmountFrom <= 0) && (!currentAmountTo || currentAmountTo <= 0)) {
                           if (gasValue && gasValue > 0) {
                               let suggestedAmount = 0;
                               if (gasValue <= 10) suggestedAmount = 500;
                               else if (gasValue <= 50) suggestedAmount = 2000;
                               else suggestedAmount = 5000;
                               form.setValue('amountFrom', suggestedAmount, { shouldValidate: true });
                               form.setValue('amountTo', suggestedAmount, { shouldValidate: true });
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
