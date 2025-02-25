import { runWebsockets } from "./ws_server";
import { client } from "./client";

async function main() {
    console.log("🚀 Starting indexer...");

    console.log("🌐 Initializing WebSocket server...");
    runWebsockets();
    console.log("✅ WebSocket server started on port 3003");

    console.log("📡 Connecting to Apibara and starting event indexing...");
    client.startListening();
    console.log("✅ Event indexing started");

    process.on("SIGINT", () => {
        console.log("🛑 Shutting down gracefully...");
        process.exit(0);
    });
}

main().catch((err) => {
    console.error("❌ Error during startup:", err);
    process.exit(1);
});
