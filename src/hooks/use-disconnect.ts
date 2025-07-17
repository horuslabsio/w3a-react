import { useCallback } from "react";

import { useStarknet } from "../context/starknet";

/** Value returned from `useConnect`. */
export type UseDisconnectResult = {
  disconnect: () => void;

  disconnectAsync: () => Promise<void>;
};

/**
 * Hook for connecting to a StarkNet wallet.
 *
 * @remarks
 *
 * Use this to implement a "connect wallet" component.
 *
 * ```
 */
export function useDisconnect(): UseDisconnectResult {
  const { disconnect } = useStarknet();

  const disconnectAsync = useCallback(() => disconnect(), [disconnect]);

  return {
    disconnect,
    disconnectAsync,
  };
}
