"use client";
import {
  type Web3AuthContextConfig,
  Web3AuthProvider as Web3AuthProviderModal,
} from "@web3auth/modal/react";

import { WEB3AUTH_NETWORK } from "@web3auth/modal";

// TODO: add a way to change the clientId based on environment

const clientId =
  "BEQc78qNSC_nE4sh2YSf6MPK4mep2CLELdQ3jPU85y8YrRX3pGBxHV4Yx9hcEoEL_3gg8TUdTL0wST9HV0YHp3A";

if (!clientId) {
  throw new Error(
    "NEXT_PUBLIC_WEB3AUTH_CLIENT_ID is not set –– need to set in .env.local for web3auth to work"
  );
}

const web3AuthContextConfig: Web3AuthContextConfig = {
  web3AuthOptions: {
    clientId,
    web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
  },
};

export function Web3AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <Web3AuthProviderModal config={web3AuthContextConfig}>
      {children}
    </Web3AuthProviderModal>
  );
}
