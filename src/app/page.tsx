'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import LoginScreen from '@/components/LoginScreen';
import MainApplication from '@/components/MainApplication';
import HelpScreen from '@/components/HelpScreen';
import { useToast } from '@/hooks/use-toast';

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  providerName: string | null;
  statusMessage: string;
  statusType: 'connected' | 'error' | 'connecting' | '';
}

export default function HomePage() {
  const [currentView, setCurrentView] = useState<'login' | 'app' | 'help'>('login');
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    providerName: null,
    statusMessage: '',
    statusType: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    // In a real app, you might check for previously connected wallet here
    // e.g., using localStorage or by querying the wallet provider.
    // For this simulation, we start fresh or can simulate a persisted connection if desired.
    // const checkPersistedConnection = async () => {
    //   if (typeof window.ethereum !== 'undefined') {
    //     try {
    //       const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    //       if (accounts.length > 0) {
    //         setWalletState({
    //           isConnected: true,
    //           address: accounts[0],
    //           providerName: 'MetaMask', // Assuming MetaMask if accounts found
    //           statusMessage: `Reconnected to MetaMask`,
    //           statusType: 'connected',
    //         });
    //         setCurrentView('app');
    //       }
    //     } catch (error) {
    //       console.warn('Could not check for persisted MetaMask connection:', error);
    //     }
    //   }
    // };
    // checkPersistedConnection();
  }, []);

  const handleConnectWallet = async (provider: 'MetaMask' | 'WalletConnect' | 'Coinbase') => {
    setWalletState(prev => ({ ...prev, statusMessage: `Connecting to ${provider}...`, statusType: 'connecting' }));
    
    // Simulate connection
    // Actual Web3 connection logic would go here
    if (provider === 'MetaMask') {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          setWalletState({
            isConnected: true,
            address: accounts[0],
            providerName: provider,
            statusMessage: `Connected to ${provider}`,
            statusType: 'connected',
          });
          setCurrentView('app');
          toast({ title: "Wallet Connected", description: `Successfully connected to ${provider}.` });
        } catch (error: any) {
          console.error("MetaMask connection error:", error);
          setWalletState(prev => ({ ...prev, statusMessage: `Failed to connect to ${provider}: ${error.message || 'User rejected connection.'}`, statusType: 'error' }));
          toast({ variant: "destructive", title: "Connection Failed", description: `Could not connect to ${provider}.` });
        }
      } else {
        setWalletState(prev => ({ ...prev, statusMessage: 'MetaMask not found. Please install the extension.', statusType: 'error' }));
        toast({ variant: "destructive", title: "MetaMask Not Found", description: "Please install the MetaMask extension." });
      }
    } else {
      // Simulate WalletConnect and Coinbase
      setTimeout(() => {
        const simulatedAddress = '0x' + Math.random().toString(16).substring(2, 10) + '...' + Math.random().toString(16).substring(2,6);
        setWalletState({
          isConnected: true,
          address: simulatedAddress,
          providerName: provider,
          statusMessage: `Connected to ${provider}`,
          statusType: 'connected',
        });
        setCurrentView('app');
        toast({ title: "Wallet Connected", description: `Successfully connected to ${provider} (Simulated).` });
      }, 1500);
    }
  };

  const handleDisconnectWallet = () => {
    setWalletState({
      isConnected: false,
      address: null,
      providerName: null,
      statusMessage: '',
      statusType: '',
    });
    setCurrentView('login');
    toast({ title: "Wallet Disconnected" });
  };

  const navigateToHelp = () => setCurrentView('help');
  const navigateToApp = () => setCurrentView('app');

  return (
    <div className="flex flex-col items-center min-h-screen w-full pt-12 px-4 sm:px-6 lg:px-8 bg-background">
      {(currentView === 'login' || currentView === 'app') && <Header />}
      
      <div className="w-full max-w-md flex flex-col items-center space-y-6">
        {currentView === 'login' && (
          <LoginScreen 
            onConnect={handleConnectWallet} 
            walletStatus={walletState.statusMessage}
            statusType={walletState.statusType}
            connectedAddress={walletState.address}
          />
        )}
        {currentView === 'app' && walletState.isConnected && (
          <MainApplication 
            onDisconnect={handleDisconnectWallet} 
            onShowHelp={navigateToHelp}
          />
        )}
        {currentView === 'help' && (
          <HelpScreen onReturnToMain={navigateToApp} />
        )}
      </div>

      {currentView === 'app' && (
         <footer className="w-full mt-10 py-8 text-center text-muted-foreground text-sm">
            <p>&copy; {new Date().getFullYear()} D-0-X Mobile. All rights reserved.</p>
            <p className="font-code text-xs mt-1">
              Disclaimer: Trading cryptocurrencies involves significant risk. Use this tool at your own discretion.
            </p>
        </footer>
      )}
    </div>
  );
}
