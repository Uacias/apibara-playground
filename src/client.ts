import { StreamClient, StreamClientArgs } from "@apibara/protocol";
import { EventFilter, FieldElement, Filter, StarkNetCursor, v1alpha2 } from "@apibara/starknet";
import { QUIET_CASH_CONTRACT_ADDRESS, APIBARA_URL, APIBARA_TOKEN, QUIET_CASH_DEPLOYMENT_BLOCK_NUMBER } from "./config";
import { sendToClient } from "./ws_server";
import { EVENT_NAMES } from "./types";

class StarknetIndexer {
    private apibaraClient: StreamClient;
    private cursor: any;


    constructor() {
        this.cursor = StarkNetCursor.createWithBlockNumber(QUIET_CASH_DEPLOYMENT_BLOCK_NUMBER);
        this.apibaraClient = new StreamClient(this.getApibaraArgs());
    }

    public startListening() {
        this.apibaraClient.configure({
            filter: this.getFilter(),
            cursor: this.cursor,
            batchSize: 1,
            finality: "DATA_STATUS_ACCEPTED"
        });

        this.handleMessages();
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
        return Filter.create()
            .withHeader({ weak: false })
            .addEvent(new EventFilter().withFromAddress(FieldElement.fromBigInt(BigInt(QUIET_CASH_CONTRACT_ADDRESS))))
            .encode();
    }

    private async handleMessages() {
        for await (const message of this.apibaraClient) {
            if (message.message === "data" && message.data?.data) {
                for (const data of message.data.data) {
                    const block = v1alpha2.Block.decode(data);
                    if (!block.events) continue;

                    for (const event of block.events) {
                        if (!event.event || !event.event.data) continue;

                        const keys = event.event.keys ? event.event.keys.map((k) => FieldElement.toHex(k)) : [];

                        const eventKey = keys.length > 0 ? keys[0] : "unknown";

                        const eventName = EVENT_NAMES[eventKey] || "UnknownEvent";

                        const fromAddress = event.event.fromAddress ? FieldElement.toHex(event.event.fromAddress) : "unknown";

                        const eventPayload = {
                            type: "event",
                            block_number: Number(block.header?.blockNumber?.toString()),
                            event_name: eventName,
                            from_address: fromAddress,
                            keys: keys,
                            data: event.event.data.map((d) => FieldElement.toHex(d)),
                            transaction_hash: event.receipt?.transactionHash
                                ? FieldElement.toHex(event.receipt.transactionHash)
                                : "0x0",
                        };

                        console.log(`📡 Event in block #${block.header?.blockNumber || "unknown"}:`);
                        console.log(eventPayload);
                        console.log("================================================");

                        sendToClient(eventPayload);

                    }
                }
            }
        }
    }



}

export const client = new StarknetIndexer();
