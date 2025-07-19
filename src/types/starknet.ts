import type { ProviderInterface, PaymasterRpc } from "starknet";

import type { Chain } from "./chains";
import type { IProvider } from "@web3auth/modal";
import type { AccountInterface } from "starknet";
import type { Address } from "viem";

export interface StarknetManagerState {
  currentChain: Chain;
  currentAddress?: Address;
  currentProvider: ProviderInterface;
  currentPaymasterProvider?: PaymasterRpc;
  currentWeb3AuthProvider?: IProvider | null;
  currentAccount?: AccountInterface;
  error?: Error;
}

export interface UseStarknetManagerProps {
  chains: Chain[];
  provider: ChainProviderFactory;
  paymasterProvider: ChainPaymasterFactory;
  autoConnect?: boolean;
  defaultChainId?: bigint;
}

export type ChainPaymasterFactory<T extends PaymasterRpc = PaymasterRpc> = (
  chain: Chain
) => T | null;

export type ChainProviderFactory<
  T extends ProviderInterface = ProviderInterface
> = (chain: Chain) => T | null;
