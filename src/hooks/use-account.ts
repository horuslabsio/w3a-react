import type { Address } from "../types/chains";
import type { AccountInterface } from "starknet";
import { useStarknetAccount } from "../context/account";
import { useStarknet } from "../context/starknet";
import { getAddress } from "../utils";

import {
  type IUseWeb3AuthConnect,
  type IUseWeb3AuthDisconnect,
} from "@web3auth/modal/react";
import type { AuthUserInfo, Web3AuthError } from "@web3auth/modal";

/** Account connection status. */
export type AccountStatus =
  | "connected"
  | "disconnected"
  | "connecting"
  | "reconnecting";

/** Value returned from `useAccount`. */
export type UseAccountResult = {
  /** The connected account object. */
  account?: AccountInterface;
  /** The address of the connected account. */
  address?: Address;
  /** Connector's chain id */
  chainId?: bigint;
  /** True if connecting. */
  isConnecting?: boolean;
  /** True if connected. */
  isConnected?: boolean;
  /** True if disconnected. */
  isDisconnected?: boolean;
  /** The web3auth connection. */
  web3AuthConnection: IUseWeb3AuthConnect | undefined;
  /** The web3auth disconnect. */
  web3AuthDisconnect: IUseWeb3AuthDisconnect | undefined;
  /** The web3auth user info. */
  userInfo?: Partial<AuthUserInfo> | null;
  /** The web3auth connector error. */
  web3AuthConnectorError?: Web3AuthError | null;
};

/**
 * Hook for accessing the account and its connection status.
 *
 * @remarks
 *
 * This hook is used to access the `AccountInterface` object provided by the
 * currently connected wallet.
 */
export function useAccount(): UseAccountResult {
  const { chain } = useStarknet();

  const {
    address: connectedAddress,
    account: connectedAccount,
    userInfo,
    web3AuthConnection,
    web3AuthDisconnect,
  } = useStarknetAccount();

  // Build the result object directly without useState to avoid stale values
  const result: UseAccountResult = {
    account: connectedAccount,
    address: connectedAddress ? getAddress(connectedAddress) : undefined,
    chainId: web3AuthConnection?.isConnected ? chain.id : undefined,
    isConnecting: web3AuthConnection?.loading,
    isConnected: web3AuthConnection?.isConnected,
    isDisconnected: !web3AuthConnection?.isConnected,
    web3AuthConnection,
    web3AuthDisconnect,
    userInfo,
    web3AuthConnectorError: web3AuthConnection?.error,
  };

  return result;
}
