"use client";
import {
  type Web3AuthContextConfig,
  Web3AuthProvider as Web3AuthProviderModal,
} from "@web3auth/modal/react";

import { WEB3AUTH_NETWORK } from "@web3auth/modal";
import { Chain } from "src/types/chains";
import { mainnet, sepolia } from "src/chains";

interface Web3AuthProviderProps {
  children: React.ReactNode;
  clientId: string;
  chains: Chain[];
  defaultChainId?: bigint;
}

export function Web3AuthProvider({
  children,
  clientId,
  chains,
  defaultChainId,
}: Web3AuthProviderProps) {
  // Validate that clientId is provided
  if (!clientId || clientId.trim() === "") {
    throw new Error(
      "web3AuthClientId is required for Web3AuthProvider. Please provide a valid client ID."
    );
  }

  const defaultChain = defaultChainId
    ? chains.find((c) => c.id === defaultChainId) ?? chains[0]
    : chains[0];

  let network: (typeof WEB3AUTH_NETWORK)[keyof typeof WEB3AUTH_NETWORK];
  switch (defaultChain.id) {
    case mainnet.id:
      network = WEB3AUTH_NETWORK.SAPPHIRE_MAINNET;
      break;
    case sepolia.id:
      network = WEB3AUTH_NETWORK.SAPPHIRE_DEVNET;
      break;
    default:
      network = WEB3AUTH_NETWORK.SAPPHIRE_DEVNET;
      break;
  }

  const web3AuthContextConfig: Web3AuthContextConfig = {
    web3AuthOptions: {
      clientId,
      web3AuthNetwork: network,
    },
  };

  return (
    <Web3AuthProviderModal config={web3AuthContextConfig}>
      {children}
    </Web3AuthProviderModal>
  );
}
