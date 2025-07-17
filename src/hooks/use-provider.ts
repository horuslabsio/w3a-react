import type { PaymasterInterface, ProviderInterface } from "starknet";

import { useStarknet } from "../context/starknet";
import type { IProvider } from "@web3auth/modal";

/** Value returned from `useProvider`. */
export interface UseProviderResult {
  /** The current provider. */
  provider: ProviderInterface;
  /** The current paymaster provider. */
  paymasterProvider?: PaymasterInterface;
  /** The current web3auth provider. */
  web3AuthProvider?: IProvider | null;
}

/**
 * Hook for accessing the current provider.
 *
 * @remarks
 *
 * Use this hook to access the current provider object
 * implementing starknet.js `ProviderInterface`.
 */
export function useProvider(): UseProviderResult {
  const { provider, paymasterProvider, web3AuthProvider } = useStarknet();
  return { provider, paymasterProvider, web3AuthProvider };
}
