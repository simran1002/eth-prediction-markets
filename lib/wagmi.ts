import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { sepolia } from "wagmi/chains";
import { defineChain, type Chain } from "viem";

const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID || "11155111");
const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || "http://127.0.0.1:8545";

const localhost = defineChain({
  id: 31337,
  name: "Localhost",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: [rpcUrl] },
  },
});

const activeChain: Chain = chainId === 31337 ? localhost : sepolia;

export const config = getDefaultConfig({
  appName: "Prediction Market",
  projectId:
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ||
    "00000000000000000000000000000000",
  chains: [activeChain],
  ssr: true,
});
