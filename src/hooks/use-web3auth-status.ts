// todo expose web3 auth types
import { useStarknet } from "../context/starknet";

/**
 * Hook for accessing Web3Auth connection status and error states.
 * Useful for error handling and user feedback.
 */
export function useWeb3AuthStatus() {
  const {
    web3AuthStatus,
    isWeb3AuthConnected,
    isWeb3AuthInitializing,
    web3AuthInitError,
    error,
  } = useStarknet();

  return {
    /** Current Web3Auth connection status */
    status: web3AuthStatus,
    /** Whether Web3Auth is connected */
    isConnected: isWeb3AuthConnected,
    /** Whether Web3Auth is initializing */
    isInitializing: isWeb3AuthInitializing,
    /** Web3Auth initialization error */
    initError: web3AuthInitError,
    /** General Starknet connection error */
    error,
    /** Helper to check if there are any errors */
    hasError: !!(web3AuthInitError || error),
    /** Helper to get the most relevant error message */
    getErrorMessage: () => {
      if (web3AuthInitError) return web3AuthInitError.message;
      if (error) return error.message;
      return null;
    },
    /** Helper to check if ready to connect */
    isReady:
      !isWeb3AuthInitializing &&
      !web3AuthInitError &&
      web3AuthStatus !== "not_ready" &&
      web3AuthStatus !== null &&
      web3AuthStatus !== undefined,
  };
}
