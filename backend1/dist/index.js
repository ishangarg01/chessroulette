"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const GameManager_1 = require("./GameManager");
// const WebSocket = require('ws');
const ws_2 = __importDefault(require("ws"));
console.log(ws_2.default); // This should log the WebSocket class
const SELF_CONNECTION_INTERVAL = 30000;
const WS_URL = "wss://chessroulette.onrender.com";
const wss = new ws_1.WebSocketServer({ port: 8080 });
const gameManager = new GameManager_1.GameManager();
wss.on('connection', function connection(ws) {
    gameManager.addUser(ws);
    // Handle WebSocket disconnection
    ws.on('close', () => gameManager.removeUser(ws));
});
// This is to stop the server from sleeping on onrender
function selfConnectToWebSocket() {
    console.log('Creating self WebSocket connection...');
    const wsClient = new ws_2.default(WS_URL); // Create the WebSocket client
    // Once the connection is open, send a message and close the connection
    wsClient.onopen = () => {
        console.log('Self-connection established');
        wsClient.send(JSON.stringify({ message: 'Ping from self-connection' })); // Send a JSON message
        // Close the connection after sending the message
        wsClient.close();
    };
    // // Handle errors during the connection
    // wsClient.onerror = (error) => {
    //     console.error('Error in self WebSocket connection:', error);
    // };
    // Log disconnection
    wsClient.onclose = () => {
        console.log('Self WebSocket connection closed');
    };
}
// Start the WebSocket server
// console.log(`WebSocket server is running on port ${PORT}`);
// Periodically make a self-connection to the WebSocket server
setInterval(selfConnectToWebSocket, 30000); // Connect every 30 seconds
