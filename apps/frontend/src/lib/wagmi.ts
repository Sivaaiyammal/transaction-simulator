import { http, createConfig } from "wagmi";
import { arbitrum, arbitrumSepolia, mainnet, sepolia } from "wagmi/chains";
import { injected, metaMask } from "wagmi/connectors";

/**
 * Wagmi configuration for wallet connection
 * Primary support for Arbitrum One and Arbitrum Sepolia
 * Also supports Ethereum Mainnet and Sepolia for compatibility
 */
export const config = createConfig({
  chains: [arbitrum, arbitrumSepolia, mainnet, sepolia],
  connectors: [
    injected(),
    metaMask(),
  ],
  transports: {
    [arbitrum.id]: http(),
    [arbitrumSepolia.id]: http(),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
