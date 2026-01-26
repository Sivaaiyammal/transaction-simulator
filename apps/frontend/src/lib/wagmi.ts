import { http, createConfig } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { injected, metaMask } from "wagmi/connectors";

/**
 * Wagmi configuration for wallet connection
 * Supports Ethereum Mainnet and Sepolia Testnet
 */
export const config = createConfig({
  chains: [sepolia, mainnet],
  connectors: [
    injected(),
    metaMask(),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
