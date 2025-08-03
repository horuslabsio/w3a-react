import type { IProvider } from "@web3auth/modal";
import {
  Account,
  CairoCustomEnum,
  CairoOption,
  CairoOptionVariant,
  CallData,
  ec,
  hash,
  type PaymasterDetails,
  PaymasterRpc,
  ProviderInterface,
} from "starknet";
import { keccak256 } from "js-sha3";
import type { Address } from "../types/chains";
import { validateAndParseAddress } from "starknet";

export const ARGENT_X_ACCOUNT_CLASS_HASH =
  "0x036078334509b514626504edc9fb252328d1a240e4e948bef8d0c08dff45927f";

/*
  Starknet uses a specific elliptic curve (Stark curve), which has a much smaller valid private key range than secp256k1 (used by EVM chains). The private key you receive from Web3Auth might be a random 32-byte value, which can sometimes be out of Starknet’s valid range.
  check out: https://web3auth.io/community/t/integrate-web3auth-on-starknet/11404/2?u=stephaniegb.dev for more context
  */

/**
 * Get a valid private key from the provider.
 *
 * @param provider - The provider to get the private key from.
 * @returns The valid private key.
 */

export async function getPrivateKey({ provider }: { provider: IProvider }) {
  try {
    const rawPrivKey = (await provider.request({
      method: "private_key",
    })) as string;

    if (!rawPrivKey) {
      throw new Error("Private key is undefined or null");
    }

    // Hash the private key
    const hashedPrivKey = keccak256(rawPrivKey);

    // Modulo with Stark curve order to ensure it's in range
    const starkCurveOrder =
      "3618502788666131213697322783095070105526743751716087489154079457884512865583";

    const validPrivKey = BigInt("0x" + hashedPrivKey) % BigInt(starkCurveOrder);

    return `0x${validPrivKey.toString(16)}`;
  } catch (error) {
    console.error("Error getting/grinding private key:", error);
    throw new Error("Failed to retrieve or grind private key");
  }
}

/**
 * Get the StarkNet public key from a valid private key.
 *
 * @param privateKey - The private key to get the public key from.
 * @returns The StarkNet public key.
 */

export function getStarkKey({ privateKey }: { privateKey: string }) {
  try {
    return ec.starkCurve.getStarkKey(privateKey);
  } catch (error) {
    console.error("Error generating StarkNet public key:", error);
    throw error;
  }
}

/**
 * Calculate the account address from a public key.
 *
 * @param starkKeyPubAX - The public key to calculate the account address from.
 * @returns The account address.
 */

export const calculateAccountAddress = ({
  starkKeyPubAX,
}: {
  starkKeyPubAX: string;
}) => {
  const axSigner = new CairoCustomEnum({ Starknet: { pubkey: starkKeyPubAX } });
  const axGuardian = new CairoOption<unknown>(CairoOptionVariant.None);
  const AXConstructorCallData = CallData.compile({
    owner: axSigner,
    guardian: axGuardian,
  });

  const AXcontractAddress = hash.calculateContractAddressFromHash(
    starkKeyPubAX,
    ARGENT_X_ACCOUNT_CLASS_HASH,
    AXConstructorCallData,
    0
  );

  return { AXcontractAddress, AXConstructorCallData };
};

/**
 * Deploy an account on Starknet.
 *
 * @param web3authProvider - The web3auth provider.
 * @param starknetProvider - The Starknet provider.
 * @param paymasterRpc - The paymaster RPC.
 * @returns The account address and transaction hash.
 */

export async function deployAccount({
  web3authProvider,
  starknetProvider,
  paymasterRpc,
}: {
  web3authProvider: IProvider;
  starknetProvider: ProviderInterface;
  paymasterRpc: PaymasterRpc;
}) {
  try {
    // ✅ 1. Get valid Starknet-compatible private key
    const validPrivateKey = await getPrivateKey({
      provider: web3authProvider,
    });

    // ✅ 2. Derive the matching public key
    const starkKeyPub = getStarkKey({ privateKey: validPrivateKey });

    // ✅ 3. Calculate the deterministic address
    const { AXcontractAddress, AXConstructorCallData } =
      calculateAccountAddress({ starkKeyPubAX: starkKeyPub });

    // ✅ 4. Create account instance with correct key
    const AXaccount = new Account(
      starknetProvider,
      AXcontractAddress,
      validPrivateKey,
      undefined,
      undefined,
      paymasterRpc
    );

    // ✅ 5. Calculate deploymentData
    const accountPayload = {
      class_hash: ARGENT_X_ACCOUNT_CLASS_HASH,
      calldata: AXConstructorCallData.map((x) => {
        const hex = BigInt(x).toString(16);
        return `0x${hex}`;
      }),
      address: AXcontractAddress,
      salt: starkKeyPub,
    };

    const feesDetails: PaymasterDetails = {
      feeMode: { mode: "sponsored" },
      deploymentData: { ...accountPayload, version: 1 as const },
    };
    const resp = await AXaccount.executePaymasterTransaction([], feesDetails);
    console.log("📤 Transaction submitted with hash:", resp.transaction_hash);

    console.log("⏳ Waiting for transaction confirmation...");
    await starknetProvider.waitForTransaction(resp.transaction_hash);
    console.log("✅ Transaction confirmed on blockchain");

    console.log(
      "✅ Account deployed successfully: I waited for the transaction"
    );

    console.log("🏁 deployAccount function about to return...");
    return {
      address: AXcontractAddress,
      transactionHash: resp.transaction_hash,
    };
  } catch (error) {
    console.error("❌ Account deployment failed:", error);
    throw error;
  }
}

/**
 * Get the deployment status of an account.
 *
 * @param starknetProvider - The Starknet provider.
 * @param contractAddress - The contract address to get the deployment status of.
 * @returns The deployment status.
 */

export const getDeploymentStatus = async ({
  starknetProvider,
  contractAddress,
}: {
  starknetProvider: ProviderInterface;
  contractAddress: string;
}) => {
  try {
    await starknetProvider.getClassHashAt(contractAddress);
    return true;
  } catch (error) {
    console.error("❌ Error getting deployment status:", error);
    return false;
  }
};

/**
 * Validate and format the address.
 *
 * @param address - The address string to validate.
 * @returns The validated and formatted address as Address type.
 */
export function getAddress(address: string): Address {
  return validateAndParseAddress(address) as Address;
}
