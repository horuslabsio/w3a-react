import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  type IUseWeb3AuthDisconnect,
  useWeb3Auth,
  useWeb3AuthConnect,
  useWeb3AuthDisconnect,
  type IUseWeb3AuthConnect,
} from "@web3auth/modal/react";
import {
  Account,
  AccountInterface,
  PaymasterRpc,
  ProviderInterface,
  RpcProvider,
} from "starknet";
import type { IProvider } from "@web3auth/modal";
import type {
  ChainPaymasterFactory,
  ChainProviderFactory,
  StarknetManagerState,
  UseStarknetManagerProps,
} from "../types/starknet";
import { calculateAccountAddress, getPrivateKey, getStarkKey } from "../utils";
import { deployAccount, getDeploymentStatus } from "../utils";
import { AccountProvider } from "./account";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Address, Chain } from "../types/chains";
import { mainnet, sepolia } from "../chains";

const queryClient = new QueryClient();

interface StarknetContextType {
  /** Connected connector. */
  connector?: IUseWeb3AuthConnect;
  /** Connect the given connector. */
  connect: () => Promise<void>;
  /** Disconnect the currently connected connector. */
  disconnect: () => Promise<void>;

  /** Current explorer factory. */
  //   explorer?: ExplorerFactory;
  /** Chains supported by the app. */
  chains: Chain[];
  /** Current chain. */
  chain: Chain;
  /** Current provider. */
  provider: ProviderInterface;
  /** Current paymaster provider */
  paymasterProvider?: PaymasterRpc;
  /** Current web3auth provider */
  web3AuthProvider?: IProvider | null;
  /** Error. */
  error?: Error;

  /** Web3Auth connection status */
  web3AuthStatus?: string | null;
  /** Web3Auth connection state */
  isWeb3AuthConnected?: boolean;
  /** Web3Auth initialization state */
  isWeb3AuthInitializing?: boolean;
  /** Web3Auth initialization error */
  web3AuthInitError?: Error | null;
}

const StarknetContext = createContext<StarknetContextType | undefined>(
  undefined
);

/**
 * @description Custom hook to manage Starknet account and provider
 * @param chains - List of chains to support
 * @param provider - Function to get a provider for a given chain
 * @param paymasterProvider - Function to get a paymaster provider for a given chain
 * @param autoConnect - Whether to automatically connect on mount
 * @param defaultChainId - The default chain ID to use
 */

function useStarknetManager({
  chains,
  provider,
  paymasterProvider,
  autoConnect = false,
  defaultChainId,
}: UseStarknetManagerProps): StarknetContextType & {
  account?: AccountInterface;
  address?: Address;
  web3AuthConnection?: IUseWeb3AuthConnect;
  web3AuthDisconnect?: IUseWeb3AuthDisconnect;
} {
  const defaultChain = defaultChainId
    ? chains.find((c) => c.id === defaultChainId) ?? chains[0]
    : chains[0];
  if (defaultChain === undefined) {
    throw new Error("Must provide at least one chain.");
  }

  // check for duplicated ids in the chains list
  const seen = new Set<bigint>();

  for (const chain of chains) {
    if (seen.has(chain.id)) {
      throw new Error(`Duplicated chain id found: ${chain.id}`);
    }
    seen.add(chain.id);
  }

  const { provider: defaultProvider } = providerForChain(
    defaultChain,
    provider
  );

  const { paymasterProvider: defaultPaymasterProvider } =
    paymasterProviderForChain(defaultChain, paymasterProvider);

  // The currently connected connector needs to be accessible from the
  // event handler.
  const connectorRef = useRef<IUseWeb3AuthConnect | undefined>(undefined);
  const web3authProviderRef = useRef<IProvider | null>(undefined);
  const Web3AuthDisconnectRef = useRef<IUseWeb3AuthDisconnect | undefined>(
    undefined
  );
  const [state, setState] = useState<StarknetManagerState>({
    currentChain: defaultChain,
    currentProvider: defaultProvider,
    currentPaymasterProvider: defaultPaymasterProvider,
    currentWeb3AuthProvider: null,
    currentAccount: undefined,
    error: undefined,
  });

  const {
    provider: web3authProvider,
    status, //not_ready connecting connected ready
    isConnected, //boolean
    isInitializing, //boolean
    initError, //Error | null
  } = useWeb3Auth();
  web3authProviderRef.current = web3authProvider;
  state.currentWeb3AuthProvider = web3authProvider;

  useEffect(() => {
    if (!connectorRef.current) {
      // Only update currentChain if no wallet is connected
      setState((state) => ({
        ...state,
        currentChain: defaultChain,
        currentProvider: providerForChain(defaultChain, provider).provider,
        currentPaymasterProvider: paymasterProviderForChain(
          defaultChain,
          paymasterProvider
        ).paymasterProvider,
      }));
    }
  }, [defaultChain, paymasterProvider, provider]);

  const web3AuthConnection = useWeb3AuthConnect();
  connectorRef.current = web3AuthConnection;

  const web3AuthDisconnect = useWeb3AuthDisconnect();
  Web3AuthDisconnectRef.current = web3AuthDisconnect;

  const connect = useCallback(async () => {
    if (!defaultProvider) {
      throw new Error("No default provider found");
    }

    try {
      await web3AuthConnection.connect();

      if (!web3authProvider) {
        throw new Error("No web3auth provider found");
      }

      const privateKey = await getPrivateKey({
        provider: web3authProvider,
      });

      const starkKeyPub = getStarkKey({ privateKey: privateKey });
      if (!starkKeyPub) {
        throw new Error("StarkKey is undefined or null");
      }

      const { AXcontractAddress } = calculateAccountAddress({
        starkKeyPubAX: starkKeyPub,
      });

      const account = new Account(
        defaultProvider,
        AXcontractAddress,
        privateKey,
        undefined,
        undefined,
        defaultPaymasterProvider
      );

      // Verify account was created properly
      if (!account || !account.address) {
        throw new Error("Failed to create valid account instance");
      }

      const isDeployed = await getDeploymentStatus({
        contractAddress: AXcontractAddress,
        starknetProvider: defaultProvider,
      });

      if (!isDeployed) {
        try {
          await deployAccount({
            web3authProvider,
            starknetProvider: defaultProvider,
            paymasterRpc: defaultPaymasterProvider,
          });
        } catch (deployError) {
          console.error("Failed to deploy account:", deployError);
          // Still set the account and address even if deployment fails
          // The user can retry deployment later
        }
      }

      // Set the state regardless of deployment status
      setState((state) => ({
        ...state,
        currentAddress: AXcontractAddress as Address,
        currentAccount: account,
      }));
    } catch (error) {
      console.error("Error connecting account:", error);
      setState((state) => ({
        ...state,
        error: error as Error,
      }));
    }
  }, [
    defaultPaymasterProvider,
    defaultProvider,
    web3AuthConnection,
    web3authProvider,
  ]);

  // AutoConnect implementation
  useEffect(() => {
    if (
      autoConnect &&
      web3AuthConnection?.isConnected &&
      !state.currentAddress
    ) {
      connect();
    }
  }, [
    autoConnect,
    web3AuthConnection?.isConnected,
    state.currentAddress,
    connect,
  ]);

  const disconnect = useCallback(
    async (options?: { cleanup: boolean }) => {
      /**
       * @description Function to initiate the disconnection process.
       * @param options - Options for the disconnect.
       * @param options.cleanup - Whether  to remove all user data.
       */
      web3AuthDisconnect.disconnect(options);

      // Clear the account state when disconnecting
      setState((state) => ({
        ...state,
        currentAddress: undefined,
        currentAccount: undefined,
      }));
    },
    [web3AuthDisconnect]
  );

  return {
    address: state.currentAddress,
    account: state.currentAccount,
    provider: state.currentProvider,
    paymasterProvider: state.currentPaymasterProvider,
    chain: state.currentChain,
    connector: connectorRef.current,
    web3AuthConnection: connectorRef.current,
    web3AuthDisconnect: Web3AuthDisconnectRef.current,
    web3AuthProvider: state.currentWeb3AuthProvider,
    connect,
    disconnect,
    chains,
    error: state.error,
    web3AuthStatus: status,
    isWeb3AuthConnected: isConnected,
    isWeb3AuthInitializing: isInitializing,
    web3AuthInitError: initError as Error | null,
  };
}

/** Arguments for `StarknetProvider`. */
export interface StarknetProviderProps {
  /** Chains supported by the app. */
  chains: Chain[];
  /** Provider to use. */
  provider: RpcProvider;
  /** Paymaster provider to use. */
  paymasterProvider?: PaymasterRpc;

  /** Connect the first available connector on page load. */
  autoConnect?: boolean;

  children?: React.ReactNode;
  /** Default chain to use when wallet is not connected */
  defaultChainId?: bigint;

  /**W3a api key - Required for web3auth functionality */
  paymasterApiKey: string;

  /**Web3auth client id - Required for web3auth functionality */
  web3AuthClientId: string;
}

/** Root Starknet context provider. */
export function StarknetProvider({
  chains,
  provider,
  paymasterProvider,
  autoConnect,
  defaultChainId,
  children,
  paymasterApiKey,
}: StarknetProviderProps): React.ReactNode {
  // Validate that paymasterApiKey is provided
  if (!paymasterApiKey || paymasterApiKey.trim() === "") {
    throw new Error(
      "paymasterApiKey is required for web3auth provider. Please provide a valid API key."
    );
  }

  const _paymasterProvider =
    paymasterProvider ?? avnuPaymasterProvider(undefined, paymasterApiKey);

  // Create factory functions that return the provided instances
  const providerFactory: ChainProviderFactory = () => provider;
  const paymasterFactory: ChainPaymasterFactory = () => _paymasterProvider;

  const { account, address, web3AuthConnection, web3AuthDisconnect, ...state } =
    useStarknetManager({
      chains,
      provider: providerFactory,
      paymasterProvider: paymasterFactory,
      autoConnect,
      defaultChainId,
    });

  return (
    <QueryClientProvider client={queryClient}>
      <StarknetContext.Provider value={state}>
        <AccountProvider
          address={address}
          account={account}
          web3AuthConnection={web3AuthConnection}
          web3AuthDisconnect={web3AuthDisconnect}
        >
          {children}
        </AccountProvider>
      </StarknetContext.Provider>
    </QueryClientProvider>
  );
}

export function useStarknet(): StarknetContextType {
  const state = useContext(StarknetContext);
  if (!state) {
    throw new Error(
      "useStarknet must be used within a StarknetProvider or StarknetConfig"
    );
  }
  return state;
}

// Helper functions
function avnuPaymasterProvider(chain?: Chain, paymasterApiKey?: string) {
  if (!paymasterApiKey) {
    throw new Error(
      "paymasterApiKey is required for paymaster provider. Please provide a valid API key."
    );
  }

  let nodeUrl: string;

  if (!chain) {
    // Default to Sepolia if no chain provided
    nodeUrl = "https://sepolia.paymaster.avnu.fi";
  } else {
    // Determine URL based on chain ID
    switch (chain.id) {
      case mainnet.id:
        nodeUrl = "https://starknet.paymaster.avnu.fi/";
        break;
      case sepolia.id:
        nodeUrl = "https://sepolia.paymaster.avnu.fi";
        break;
      default:
        // Fallback to Sepolia for unknown chains
        nodeUrl = "https://sepolia.paymaster.avnu.fi";
        break;
    }
  }

  const myPaymasterRpc = new PaymasterRpc({
    nodeUrl,
    headers: {
      "x-paymaster-api-key": paymasterApiKey,
    },
  });

  return myPaymasterRpc;
}

function providerForChain(
  chain: Chain,
  factory: ChainProviderFactory
): { chain: Chain; provider: ProviderInterface } {
  const provider = factory(chain);
  if (provider) {
    return { chain, provider };
  }

  throw new Error(`No provider found for chain ${chain.name}`);
}

function paymasterProviderForChain(
  chain: Chain,
  factory: ChainPaymasterFactory
): { chain: Chain; paymasterProvider: PaymasterRpc } {
  const paymasterProvider = factory(chain);
  if (paymasterProvider) {
    return { chain, paymasterProvider };
  }

  throw new Error(`No paymaster provider found for chain ${chain.name}`);
}
