import { StreamClient, StreamClientArgs } from "@apibara/protocol";
import { Filter, StarkNetCursor, v1alpha2 } from "@apibara/starknet";
import { APIBARA_URL, APIBARA_TOKEN, STARKNET_RPC_URL } from "./config";
import { sendToClient } from "./ws_server";
class StarknetIndexer {
    private apibaraClient: StreamClient;
    private cursor: any;

    constructor() {
        this.apibaraClient = new StreamClient(this.getApibaraArgs());
    }

    public async init() {
        const latestBlockNumber = await this.getLatestBlockNumber();
        console.log("✅ Event indexing started, current block number is:", latestBlockNumber);


        this.cursor = StarkNetCursor.createWithBlockNumber(latestBlockNumber);

        this.apibaraClient.configure({
            filter: this.getFilter(),
            cursor: this.cursor,
            batchSize: 1,
            finality: "DATA_STATUS_ACCEPTED"
        });

        this.handleMessages();
    }


    private async getLatestBlockNumber(): Promise<number> {
        if (!STARKNET_RPC_URL) {
            throw new Error("❌ STARKNET_RPC_URL is not defined!");
        }

        try {
            const response = await fetch(STARKNET_RPC_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    jsonrpc: "2.0",
                    method: "starknet_blockNumber",
                    params: [],
                    id: 1
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            return data.result;
        } catch (error) {
            console.error("❌ Failed to fetch latest block number:", error);
            return 0;
        }
    }


    private getApibaraArgs(): StreamClientArgs {
        return {
            url: APIBARA_URL,
            token: APIBARA_TOKEN,
            async onReconnect(err, retryCount) {
                console.log("♻️ Reconnecting...", err, retryCount);
                await new Promise((resolve) => setTimeout(resolve, 1000));
                return { reconnect: true };
            },
        };
    }

    private getFilter() {
        return Filter.create().withHeader({ weak: false }).encode();
    }

    private async handleMessages() {
        for await (const message of this.apibaraClient) {
            if (message.message === "data" && message.data?.data) {
                for (const data of message.data.data) {
                    const block = v1alpha2.Block.decode(data);
                    const blockNumber = block.header?.blockNumber?.toString();

                    if (!blockNumber) continue;

                    const blockPayload = {
                        type: "new_block",
                        block_number: Number(blockNumber),
                    };

                    console.log(`📡 New block detected: #${blockNumber}`);
                    sendToClient(blockPayload);
                }
            }
        }
    }
}

export const client = new StarknetIndexer();
