import { Cpu } from 'lucide-react';

export default function Header() {
  return (
    <header className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-center space-x-3">
        <Cpu className="h-10 w-10 text-primary icon-glow-primary" />
        <h1 className="font-headline text-4xl font-bold tracking-tighter text-primary">
          D-0-X Mobile
        </h1>
      </div>
      <p className="mt-2 text-center text-muted-foreground font-body">
        AI-Powered Decentralized Arbitrage Trading
      </p>
    </header>
  );
}
