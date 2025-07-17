import { StarknetProvider, type StarknetProviderProps } from "./starknet";
import { Web3AuthProvider } from "./web-3-auth";

export type StarknetConfigProps = StarknetProviderProps;

export function StarknetConfig({ children, ...config }: StarknetConfigProps) {
  return (
    <Web3AuthProvider>
      <StarknetProvider {...config}>{children}</StarknetProvider>
    </Web3AuthProvider>
  );
}
