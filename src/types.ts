export type WebsocketPayload = SubscribePayload | UnsubscribePayload;

export interface SubscribePayload {
    type: "subscribe";
}

export interface UnsubscribePayload {
    type: "unsubscribe";
}

export const EVENT_NAMES: Record<string, string> = {
    "0x009149d2123147c5f43d258257fef0b7b969db78269369ebcf5ebb9eef8592f2": "Deposit",
    "0x002eed7e29b3502a726faf503ac4316b7101f3da813654e8df02c13449e03da8": "Withdrawal",
    "0x0010d548d5b372dbf64527bc5957acb242e0adc358d07b41be6c88fca4f80f42": "Merge",
    "0x0099cd8bde557814842a3121e8ddfd433a539b8c9f14bf31ebf108d12e6196e9": "Transfer",
    "0xFEE_WITHDRAWAL_EVENT_KEY": "FeeWithdrawal",
    "0x01390fd803c110ac71730ece1decfc34eb1d0088e295d4f1b125dda1e0c5b9ff": "OwnershipTransferred"
};
