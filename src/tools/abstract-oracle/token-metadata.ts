import { z } from "zod";
import { ABSTRACT_API_ENDPOINT } from "../../const/abstract-api.js";
import { createTool } from "../../utils/tool-wrapper.js";

interface TokenMetadata {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  chainId: number;
  price?: number;
  marketCap?: number;
  volume24h?: number;
  change24h?: number;
}

/**
 * Get metadata for a specific token from the Abstract Portal API.
 * Returns an object containing address, symbol, name, decimals, chainId, price, marketCap, volume24h, and change24h.
 */
export const getTokenMetadataTool = createTool({
  description:
    "Get metadata and price information (such as price, market cap, volume, and change) for a specific token from the Abstract Portal API.",
  parameters: z.object({
    tokenAddress: z
      .string()
      .describe(
        "The contract address of the token to get metadata for starting with 0x"
      ),
  }),
  logPrefix: "Token Metadata",

  execute: async ({ tokenAddress }) => {
    return await getTokenMetadata(tokenAddress);
  },
});

export async function getTokenMetadata(tokenAddress: string) {
  const response = await fetch(
    `${ABSTRACT_API_ENDPOINT}/oracle/token/${tokenAddress}/metadata`
  );

  const data: TokenMetadata = await response.json();
  return data;
}
