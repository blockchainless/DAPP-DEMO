// This is a server-side file.
'use server';

/**
 * @fileOverview Provides a Genkit flow for suggesting smart arbitrage amounts based on a user's gas budget.
 *
 * This file exports:
 * - `smartArbitrageSuggestion`: An async function that takes user inputs and returns suggested arbitrage amounts.
 * - `SmartArbitrageSuggestionInput`: The TypeScript type for the input to `smartArbitrageSuggestion`.
 * - `SmartArbitrageSuggestionOutput`: The TypeScript type for the output of `smartArbitrageSuggestion`.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartArbitrageSuggestionInputSchema = z.object({
  gasBudget: z
    .number()
    .describe('The user specified gas budget for the arbitrage trade.'),
  availableLiquidity: z
    .number()
    .describe('The available liquidity for the token pair on the selected DEXs.'),
  tokenPair: z.string().describe('The token pair to be used for arbitrage.'),
  dexs: z.array(z.string()).describe('The decentralized exchanges to trade on.'),
  borrowingProtocol: z
    .string()
    .describe('The lending protocol for borrowing funds.'),
  network: z.string().describe('The blockchain network to use.'),
});
export type SmartArbitrageSuggestionInput = z.infer<
  typeof SmartArbitrageSuggestionInputSchema
>;

const SmartArbitrageSuggestionOutputSchema = z.object({
  suggestedAmount: z
    .number()
    .describe(
      'The suggested arbitrage amount that maximizes potential profit within the gas budget.'
    ),
  estimatedProfit: z
    .number()
    .describe('The estimated profit for the suggested arbitrage amount.'),
  strategyExplanation: z
    .string()
    .describe('An explanation of the suggested trading strategy.'),
});
export type SmartArbitrageSuggestionOutput = z.infer<
  typeof SmartArbitrageSuggestionOutputSchema
>;

export async function smartArbitrageSuggestion(
  input: SmartArbitrageSuggestionInput
): Promise<SmartArbitrageSuggestionOutput> {
  return smartArbitrageSuggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'smartArbitrageSuggestionPrompt',
  input: {schema: SmartArbitrageSuggestionInputSchema},
  output: {schema: SmartArbitrageSuggestionOutputSchema},
  prompt: `You are an AI-powered arbitrage trading strategy assistant. A user will provide you with their gas budget, available liquidity, the token pair they want to trade, the decentralized exchanges (DEXs) to trade on, the borrowing protocol, and the blockchain network to use.

  Based on this information, suggest an arbitrage amount that maximizes potential profit within the user's gas budget. Also provide an estimated profit and a brief explanation of the suggested strategy.

  Gas Budget: {{{gasBudget}}}
  Available Liquidity: {{{availableLiquidity}}}
  Token Pair: {{{tokenPair}}}
  DEXs: {{#each dexs}}{{{this}}} {{/each}}
  Borrowing Protocol: {{{borrowingProtocol}}}
  Network: {{{network}}}
  
  Consider the trade-offs between gas costs and profit potential when suggesting the arbitrage amount.
  Provide the output in JSON format, following the schema descriptions.`,
});

const smartArbitrageSuggestionFlow = ai.defineFlow(
  {
    name: 'smartArbitrageSuggestionFlow',
    inputSchema: SmartArbitrageSuggestionInputSchema,
    outputSchema: SmartArbitrageSuggestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
