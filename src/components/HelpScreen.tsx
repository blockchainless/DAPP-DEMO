'use client';

import { Button } from '@/components/ui/button';

interface HelpScreenProps {
  onReturnToMain: () => void;
}

export default function HelpScreen({ onReturnToMain }: HelpScreenProps) {
  return (
    <div className="w-full max-w-2xl text-foreground p-5 space-y-5 text-center">
      <h1 className="page-title !text-3xl !mb-5">D-0-X Mobile</h1>
      <h2 className="text-2xl font-headline text-primary text-center" style={{ textShadow: '0 0 15px hsl(var(--primary))' }}>
        D-0-X Mobile - DeFi Arbitrage Platform
      </h2>
      
      <div>
        <p className="font-bold text-lg">What is D-0-X Mobile?</p>
        <p className="text-foreground/80">
          D-0-X Mobile is a decentralized arbitrage trading platform that helps you profit from price differences across different decentralized exchanges (DEXs). Our platform automates the process of finding and executing profitable arbitrage opportunities.
        </p>
      </div>
      
      <div>
        <p className="font-bold text-lg">How it works:</p>
        <ul className="list-disc list-inside text-foreground/80 space-y-1 pl-4 inline-block text-left">
          <li><strong>Network Selection:</strong> Choose your preferred blockchain network (Ethereum, Arbitrum, Polygon, etc.)</li>
          <li><strong>Borrowing Protocol:</strong> Select a lending protocol to borrow funds for larger arbitrage opportunities</li>
          <li><strong>DEX Selection:</strong> Pick two exchanges where you want to execute the arbitrage trade</li>
          <li><strong>Token Pair:</strong> Choose which cryptocurrencies you want to arbitrage between</li>
          <li><strong>Amount Entry:</strong> Enter how much you want to trade, or set your gas budget first</li>
          <li><strong>Profit Calculation:</strong> The platform automatically calculates potential profits minus gas fees</li>
        </ul>
      </div>
      
      <div>
        <p className="font-bold text-lg">Smart Gas Fee System:</p>
        <p className="text-foreground/80">Our platform features an intelligent gas fee calculator that works two ways:</p>
        <ul className="list-disc list-inside text-foreground/80 space-y-1 pl-4 inline-block text-left">
          <li>Enter your trade amounts first → See calculated gas fees</li>
          <li>Set your gas budget first → Get suggested trade amounts that fit your budget</li>
        </ul>
      </div>

      <div>
        <p className="font-bold text-lg">Wallet Connection:</p>
        <p className="text-foreground/80">
          Connect your Web3 wallet (MetaMask, WalletConnect, or Coinbase Wallet) to access all platform features. Your wallet connection is secure and you maintain full control of your funds.
        </p>
      </div>
      
      <div>
        <p className="font-bold text-lg">Risk Warning:</p>
        <p className="text-foreground/80">
          Arbitrage trading involves financial risk. Always do your own research and never invest more than you can afford to lose. Gas fees and market volatility can affect profitability.
        </p>
      </div>
      
      <div className="pt-5">
        <Button 
          onClick={onReturnToMain}
          className="custom-btn btn-glow-primary w-full"
        >
          Return to Main Page
        </Button>
      </div>
    </div>
  );
}
