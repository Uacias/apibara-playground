import WebSocket from "ws";
import { WEBSOCKET_PORT } from "./config";

let wsClient: WebSocket | null = null;

export function runWebsockets() {
    const server = new WebSocket.Server({ port: WEBSOCKET_PORT });

    server.on("connection", (ws) => {
        console.log("✅ WebSocket connected");
        wsClient = ws;

        ws.on("close", () => {
            console.log("❌ WebSocket disconnected");
            wsClient = null;
        });
    });

    return server;
}

export function sendToClient(data: any) {
    if (wsClient && wsClient.readyState === WebSocket.OPEN) {
        wsClient.send(JSON.stringify(data));
    }
}
