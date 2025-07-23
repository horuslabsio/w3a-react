import { useCallback } from "react";

import { useStarknet } from "../context/starknet";
import type { ConnectionResult } from "../context/starknet";

/** Value returned from `useConnect`. */
export type UseConnectResult = {
  connect: () => Promise<ConnectionResult>;
  connectAsync: () => Promise<ConnectionResult>;
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
