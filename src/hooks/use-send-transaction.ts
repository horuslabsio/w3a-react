import { type Call } from "starknet";
import { useMutation } from "../query";
import { useAccount } from "./use-account";

export type UseSendTransactionProps = {
  /** List of smart contract calls to execute. */
  calls?: Call[];
};

export function useSendTransaction({
  calls: initialCalls,
}: UseSendTransactionProps = {}) {
  const { account } = useAccount();

  const mutation = useMutation({
    mutationFn: async (calls: Call[]) => {
      if (!account) {
        throw new Error("No account connected");
      }
      const result = await account.execute(calls);
      return result;
    },
  });

  const send = (calls?: Call[]) => {
    const callsToExecute = calls || initialCalls;

    if (!callsToExecute) {
      throw new Error("No calls provided");
    }
    if (!account) {
      throw new Error("Cannot send transaction: No account connected");
    }
    mutation.mutate(callsToExecute);
  };

  const sendAsync = async (calls?: Call[]) => {
    const callsToExecute = calls || initialCalls;

    if (!callsToExecute) {
      throw new Error("No calls provided");
    }
    if (!account) {
      throw new Error("Cannot send transaction: No account connected");
    }
    return mutation.mutateAsync(callsToExecute);
  };

  const result = {
    send,
    sendAsync,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
    isReady: !!account,
  };

  return result;
}
