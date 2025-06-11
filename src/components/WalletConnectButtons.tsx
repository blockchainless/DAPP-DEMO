'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WALLET_OPTIONS } from '@/lib/constants';
import { Wallet, Landmark, Smartphone } from 'lucide-react'; // Using Smartphone for WalletConnect as an example

// Note: Actual wallet integration is complex and beyond the scope of this UI scaffold.
// These buttons are for illustrative purposes.
export default function WalletConnectButtons() {
  const getIcon = (walletId: string) => {
    switch (walletId) {
      case 'metamask':
        return <Wallet className="mr-2 h-5 w-5" />;
      case 'walletconnect':
        return <Smartphone className="mr-2 h-5 w-5" />;
      case 'coinbase':
        return <Landmark className="mr-2 h-5 w-5" />;
      default:
        return <Wallet className="mr-2 h-5 w-5" />;
    }
  };

  return (
    <Card className="w-full max-w-2xl shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-center">Connect Wallet</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {WALLET_OPTIONS.map((wallet) => (
            <Button
              key={wallet.id}
              variant="outline"
              className="w-full py-6 text-lg border-primary/50 hover:border-primary hover:bg-primary/10 transition-all duration-300 ease-in-out element-glow-accent"
              onClick={() => alert(`${wallet.name} connection initiated (illustrative).`)}
            >
              <span className="icon-glow-primary">{getIcon(wallet.id)}</span>
              {wallet.name}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
