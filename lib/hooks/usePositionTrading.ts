import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { CONTRACTS } from "../contracts/addresses";
import { PREDICTION_MARKET_ABI, MOCK_ERC20_ABI } from "../contracts/abis";
import { parseEther } from "viem";

// Hook to list a position for sale
export function useListPosition() {
  const { data: hash, writeContract, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const listPosition = (betId: number, price: string) => {
    writeContract({
      address: CONTRACTS.PREDICTION_MARKET,
      abi: PREDICTION_MARKET_ABI,
      functionName: "listPosition",
      args: [BigInt(betId), parseEther(price)],
    });
  };

  return {
    listPosition,
    isPending,
    isConfirming,
    isSuccess,
    hash,
  };
}

// Hook to cancel a position listing
export function useCancelListing() {
  const { data: hash, writeContract, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const cancelListing = (betId: number) => {
    writeContract({
      address: CONTRACTS.PREDICTION_MARKET,
      abi: PREDICTION_MARKET_ABI,
      functionName: "cancelListing",
      args: [BigInt(betId)],
    });
  };

  return {
    cancelListing,
    isPending,
    isConfirming,
    isSuccess,
    hash,
  };
}

// Hook to buy a position
export function useBuyPosition() {
  const { data: hash, writeContract, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const buyPosition = (betId: number, price: string, tokenAddress?: `0x${string}`) => {
    const priceWei = parseEther(price);

    // Check if ETH or ERC20 market
    const isEthMarket = !tokenAddress || tokenAddress === "0x0000000000000000000000000000000000000000";

    if (isEthMarket) {
      // ETH market - send ETH with transaction
      writeContract({
        address: CONTRACTS.PREDICTION_MARKET,
        abi: PREDICTION_MARKET_ABI,
        functionName: "buyPosition",
        args: [BigInt(betId)],
        value: priceWei,
      });
    } else {
      // ERC20 market - no ETH sent, requires prior approval
      writeContract({
        address: CONTRACTS.PREDICTION_MARKET,
        abi: PREDICTION_MARKET_ABI,
        functionName: "buyPosition",
        args: [BigInt(betId)],
      });
    }
  };

  return {
    buyPosition,
    isPending,
    isConfirming,
    isSuccess,
    hash,
  };
}

/** Approve ERC20 for buying a listed position (payment goes seller via transferFrom). */
export function useApprovePositionPurchase() {
  const { data: hash, writeContract, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const approve = (tokenAddress: `0x${string}`, price: string) => {
    writeContract({
      address: tokenAddress,
      abi: MOCK_ERC20_ABI,
      functionName: "approve",
      args: [CONTRACTS.PREDICTION_MARKET, parseEther(price)],
    });
  };

  return {
    approve,
    isPending,
    isConfirming,
    isSuccess,
    hash,
  };
}

export function usePositionPurchaseAllowance(
  tokenAddress: `0x${string}` | undefined,
  userAddress: `0x${string}` | undefined,
  price: bigint | undefined
) {
  const { data: allowance, ...rest } = useReadContract({
    address: tokenAddress,
    abi: MOCK_ERC20_ABI,
    functionName: "allowance",
    args:
      userAddress && tokenAddress
        ? [userAddress, CONTRACTS.PREDICTION_MARKET]
        : undefined,
    query: {
      enabled:
        !!tokenAddress &&
        !!userAddress &&
        tokenAddress !== "0x0000000000000000000000000000000000000000",
    },
  });

  const hasEnoughAllowance =
    allowance !== undefined && price !== undefined
      ? (allowance as bigint) >= price
      : false;

  return { allowance, hasEnoughAllowance, ...rest };
}
