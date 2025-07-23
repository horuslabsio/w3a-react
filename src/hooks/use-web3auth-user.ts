import { useWeb3AuthUser as _useWeb3AuthUser } from "@web3auth/modal/react";
/**
 * Custom hook that wraps the Web3Auth user hook and provides additional functionality
 * @returns Object containing user state and functions
 */
export const useWeb3AuthUser = (): {
  loading: boolean;
  error: any;
  userInfo: any;
  isMFAEnabled: boolean;
  getUserInfo: () => Promise<any>;
} => {
  const { loading, error, userInfo, isMFAEnabled, getUserInfo } =
    _useWeb3AuthUser();

  return {
    loading,
    error,
    userInfo,
    isMFAEnabled,
    getUserInfo,
  };
};
