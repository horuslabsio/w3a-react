import { useWeb3AuthUser } from "@web3auth/modal/react";
/**
 * Custom hook that wraps the Web3Auth user hook and provides additional functionality
 * @returns Object containing user state and functions
 */
export const useWeb3AuthUserHook = () => {
  const { loading, error, userInfo, isMFAEnabled, getUserInfo } =
    useWeb3AuthUser();

  return {
    loading,
    error,
    userInfo,
    isMFAEnabled,
    getUserInfo,
  };
};
