import { useIdentityToken as _useIdentityToken } from "@web3auth/modal/react";

export const useIdentityToken = () => {
  const { getIdentityToken, loading, error, token } = _useIdentityToken();

  return { getIdentityToken, loading, error, token };
};
