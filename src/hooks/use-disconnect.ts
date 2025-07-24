import { useStarknet } from "../context/starknet";

/** Value returned from `useDisconnect`. */
export type UseDisconnectResult = {
  disconnect: (options?: { cleanup: boolean }) => Promise<{ success: boolean }>;
};

/**
 * Hook for disconnecting from a StarkNet wallet.
 *
 * @remarks
 *
 * Use this to implement a "disconnect wallet" component.
 *
 * ```
 */
export function useDisconnect(): UseDisconnectResult {
  const { disconnect } = useStarknet();

  return {
    disconnect,
  };
}
