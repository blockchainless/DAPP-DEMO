import Header from '@/components/Header';
import WalletConnectButtons from '@/components/WalletConnectButtons';
import ArbitrageForm from '@/components/ArbitrageForm';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center min-h-screen p-4 sm:p-6 lg:p-8 space-y-8 bg-background">
      <Header />
      <WalletConnectButtons />
      <ArbitrageForm />
      <footer className="py-8 text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} D-0-X Mobile. All rights reserved.</p>
        <p className="font-code text-xs mt-1">
          Disclaimer: Trading cryptocurrencies involves significant risk. Use this tool at your own discretion.
        </p>
      </footer>
    </div>
  );
}
