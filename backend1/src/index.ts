import { WebSocketServer } from 'ws';
import { GameManager } from './GameManager';
// const WebSocket = require('ws');
import WebSocket from 'ws';
console.log(WebSocket); // This should log the WebSocket class


const PORT = process.env.PORT || 8080;
const SELF_CONNECTION_INTERVAL = 30000; // 30 seconds

const wss = new WebSocketServer({ port: 8080});

const gameManager = new GameManager();

wss.on('connection', function connection(ws) {  
    gameManager.addUser(ws);
    
    // Handle WebSocket disconnection
    ws.on('close', () => gameManager.removeUser(ws));
});



// This is to stop the server from sleeping on onrender
function selfConnectToWebSocket() {
    console.log('Creating self WebSocket connection...');
    const wsClient = new WebSocket(`ws://localhost:${PORT}`);  // Create the WebSocket client

    // Once the connection is open, send a message and close the connection
    wsClient.onopen = () => {
        console.log('Self-connection established');
        wsClient.send(JSON.stringify({ message: 'Ping from self-connection' }));  // Send a JSON message

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
console.log(`WebSocket server is running on port ${PORT}`);

// Periodically make a self-connection to the WebSocket server
setInterval(selfConnectToWebSocket, 30000); // Connect every 30 seconds