'use client';

import ArbitrageForm from '@/components/ArbitrageForm';
import { Button } from '@/components/ui/button';
import { LogOut, HelpCircle } from 'lucide-react';

interface MainApplicationProps {
  onDisconnect: () => void;
  onShowHelp: () => void;
}

export default function MainApplication({ onDisconnect, onShowHelp }: MainApplicationProps) {
  return (
    <div className="w-full max-w-md flex flex-col items-center space-y-5">
      <ArbitrageForm />
      <div className="w-full space-y-2.5">
        <Button 
          onClick={onShowHelp}
          className="custom-btn btn-glow-primary w-full flex items-center justify-center gap-2"
        >
          <HelpCircle size={20} /> Help Page
        </Button>
        <Button 
          onClick={onDisconnect}
          className="custom-btn w-full flex items-center justify-center gap-2 bg-accent/20 border-accent text-accent hover:bg-accent/30 shadow-accent-glow-sm hover:shadow-accent-glow-md"
        >
          <LogOut size={20} /> Disconnect Wallet
        </Button>
      </div>
    </div>
  );
}
