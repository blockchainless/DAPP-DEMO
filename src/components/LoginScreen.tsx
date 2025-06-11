'use client';

import type { WalletState } from '@/app/page';
import { WALLET_CONNECT_OPTIONS } from '@/lib/constants';
import { Button } from '@/components/ui/button'; // Using ShadCN Button for consistency
import { useEffect, useState } from 'react';

interface LoginScreenProps {
  onConnect: (provider: 'MetaMask' | 'WalletConnect' | 'Coinbase') => void;
  walletStatus: string;
  statusType: WalletState['statusType'];
  connectedAddress: string | null;
}

export default function LoginScreen({ onConnect, walletStatus, statusType, connectedAddress }: LoginScreenProps) {
  const [displayAddress, setDisplayAddress] = useState<string | null>(null);

  useEffect(() => {
    if (connectedAddress) {
      // Format address to be shorter for display if it's a full address
      if (connectedAddress.length > 20) { // Basic check for a long address string
         setDisplayAddress(`${connectedAddress.substring(0, 6)}...${connectedAddress.substring(connectedAddress.length - 4)}`);
      } else {
        setDisplayAddress(connectedAddress); // Use as is if short (e.g. simulated random string)
      }
    } else {
      setDisplayAddress(null);
    }
  }, [connectedAddress]);
  
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-sm mx-auto">
      <div 
        className="flex flex-col items-center gap-6 p-8 border-2 border-primary rounded-2xl bg-background/80 shadow-primary-glow-md"
        style={{ backdropFilter: 'blur(5px)' }}
      >
        <h2 className="text-2xl font-headline text-primary text-center" style={{ textShadow: '0 0 15px hsl(var(--primary))' }}>
          Connect Your Wallet
        </h2>
        <p className="text-center text-foreground/80 text-sm">
          Connect your Web3 wallet to access the DeFi arbitrage platform.
        </p>
        
        {WALLET_CONNECT_OPTIONS.map((wallet) => (
          <Button
            key={wallet.id}
            onClick={() => onConnect(wallet.name as 'MetaMask' | 'WalletConnect' | 'Coinbase')}
            variant="outline"
            className="custom-btn btn-glow-primary w-[280px] text-lg relative overflow-hidden shimmer-effect flex items-center justify-center gap-2 group"
          >
            <span className="text-xl">{wallet.iconEmoji}</span>
            {wallet.name}
          </Button>
        ))}
        
        {walletStatus && (
          <div className={`mt-5 p-2.5 border rounded-md text-center text-sm w-[280px]
            ${statusType === 'connected' ? 'border-green-500 text-green-400 bg-green-500/10 shadow-[0_0_10px_#0f0]' : ''}
            ${statusType === 'error' ? 'border-red-500 text-red-400 bg-red-500/10 shadow-[0_0_10px_#f00]' : ''}
            ${statusType === 'connecting' ? 'border-primary text-primary bg-primary/10' : ''}
          `}>
            <p>{walletStatus}</p>
            {statusType === 'connected' && displayAddress && (
              <div className="mt-2 p-2 text-xs bg-primary/10 border border-primary rounded-md font-code break-all">
                Address: {displayAddress}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
