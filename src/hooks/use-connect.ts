import { useCallback } from "react";

import { useStarknet } from "../context/starknet";

/** Value returned from `useConnect`. */
export type UseConnectResult = {
  connect: () => void;

  connectAsync: () => Promise<void>;
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
export function useConnect(): UseConnectResult {
  const { connect } = useStarknet();

  const connectAsync = useCallback(() => connect(), [connect]);

  return {
    connect,
    connectAsync,
  };
}
