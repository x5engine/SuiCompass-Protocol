import { createContext, useContext, useState, ReactNode } from 'react';
import {
  useCurrentAccount,
  useDisconnectWallet,
  useSignTransaction,
  useSignAndExecuteTransaction,
  SuiClientProvider,
  WalletProvider as DAppKitWalletProvider
} from '@mysten/dapp-kit';
import { ConnectModal } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui/client';

// Adapter interface to match (roughly) what the app expects, 
// but updated for Sui types.
interface WalletContextType {
  publicKey: string | null; // Sui Address
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  signTransaction: (tx: any) => Promise<any>;
  signAndExecute: (tx: any) => Promise<any>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Internal wrapper to use hooks
function WalletContextWrapper({ children }: { children: ReactNode }) {
  const currentAccount = useCurrentAccount();
  const { mutate: disconnectWallet } = useDisconnectWallet();
  const { mutateAsync: signTransactionBlock } = useSignTransaction();
  const { mutateAsync: signAndExecuteTransactionBlock } = useSignAndExecuteTransaction();

  // We need a way to trigger connection UI.
  // dApp Kit usually uses <ConnectButton />, but if the app calls `connect()` programmatically,
  // we might need to show a modal or just instruct the user.
  // For now, we'll expose a state to show the modal if needed,
  // OR we rely on the UI using ConnectButton directly.
  const [showConnectModal, setShowConnectModal] = useState(false);

  const publicKey = currentAccount?.address || null;
  const isConnected = !!currentAccount;

  const connect = () => {
    setShowConnectModal(true);
  };

  const disconnect = () => {
    disconnectWallet();
  };

  return (
    <WalletContext.Provider
      value={{
        publicKey,
        isConnected,
        connect,
        disconnect,
        signTransaction: signTransactionBlock,
        signAndExecute: signAndExecuteTransactionBlock,
      }}
    >
      {/* We can embed the ConnectModal here and control it via state if the app expects a programmatic trigger */}
      <ConnectModal
        trigger={<span style={{ display: 'none' }} />}
        open={showConnectModal}
        onOpenChange={setShowConnectModal}
      />
      {children}
    </WalletContext.Provider>
  );
}

const networkConfig = {
  testnet: { url: getFullnodeUrl('testnet') },
  mainnet: { url: getFullnodeUrl('mainnet') },
};

export function WalletProvider({ children, autoConnect = false }: { children: ReactNode; autoConnect?: boolean }) {
  return (
    <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
      <DAppKitWalletProvider autoConnect={autoConnect}>
        <WalletContextWrapper>{children}</WalletContextWrapper>
      </DAppKitWalletProvider>
    </SuiClientProvider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
