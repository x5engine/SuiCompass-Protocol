import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@mysten/dapp-kit/dist/index.css';
import { ReactNode } from 'react';
import { WalletProvider } from './blockchain/WalletProvider'; // CORRECTED IMPORT

const queryClient = new QueryClient();

export function SuiProviders({ children }: { children: ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            {/* The custom WalletProvider now handles the SuiClientProvider and DAppKitWalletProvider internally */}
            <WalletProvider autoConnect={true}> 
                {children}
            </WalletProvider>
        </QueryClientProvider>
    );
}