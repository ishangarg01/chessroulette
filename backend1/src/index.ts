import { WebSocketServer } from 'ws';
import { GameManager } from './GameManager';
// const WebSocket = require('ws');
import WebSocket from 'ws';
console.log(WebSocket); // This should log the WebSocket class


const SELF_CONNECTION_INTERVAL = 30000;
const WS_URL = "wss://chessroulette.onrender.com";


const wss = new WebSocketServer({ port: 8080});

const gameManager = new GameManager();

wss.on('connection', function connection(ws) {  
    gameManager.addUser(ws);
    
    // Handle WebSocket disconnection
    ws.on('close', () => gameManager.removeUser(ws));
});

