import { JsonRpcProvider } from "ethers";
import dotenv from "dotenv";

dotenv.config();

export function getEthereumProvider() {
  if (!process.env.ETHEREUM_RPC_URL) {
    throw new Error("ETHEREUM_RPC_URL not set");
  }

  return new JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
}
