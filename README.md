# W3A React SDK

A React SDK for Web3Auth integration with Starknet blockchain. This package provides React hooks and utilities for seamless Web3Auth integration in React applications.

## Installation

```bash
npm install w3a-react
# or
yarn add w3a-react
# or
pnpm add w3a-react
```

## Quick Start

```tsx
import React from "react";
import { useWeb3AuthStatus, useConnect, useAccount } from "w3a-react";

function App() {
  const { isConnected, isLoading } = useWeb3AuthStatus();
  const { connect, disconnect } = useConnect();
  const { account } = useAccount();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {!isConnected ? (
        <button onClick={connect}>Connect Wallet</button>
      ) : (
        <div>
          <p>Connected: {account?.address}</p>
          <button onClick={disconnect}>Disconnect</button>
        </div>
      )}
    </div>
  );
}
```

## Available Hooks

- `useWeb3AuthStatus()` - Get connection status
- `useConnect()` - Connect/disconnect functionality
- `useAccount()` - Get current account information
- `useBalance()` - Get account balance
- `useNetwork()` - Get network information
- `useProvider()` - Get Starknet provider
- `useContract()` - Interact with smart contracts
- `useCall()` - Make read calls to contracts
- `useSendTransaction()` - Send transactions
- `useBlockNumber()` - Get current block number
- `useInvalidateOnBlock()` - Invalidate queries on new blocks

## Configuration

The SDK supports both mainnet and testnet (sepolia) configurations:

```tsx
import { mainnet, sepolia } from "w3a-react";

// Use mainnet
const mainnetConfig = mainnet;

// Use testnet
const testnetConfig = sepolia;
```

## Development

### Prerequisites

1. Install dependencies:

```bash
pnpm install
```

2. Build the SDK:

```bash
pnpm run build
```

3. Start development server:

```bash
pnpm dev
```

## License

MIT
