import * as dotenv from "dotenv";
dotenv.config();

export const WEBSOCKET_PORT = 3003;
export const APIBARA_URL = "sepolia.starknet.a5a.ch";
export const APIBARA_TOKEN = process.env.APIBARA_TOKEN;
export const STARKNET_RPC_URL = process.env.STAKNET_RPC_URL;
