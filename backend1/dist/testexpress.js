"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const port = 4000;
// Define a simple route
app.get('/', (req, res) => {
    res.send('Hello, World!');
});
// Start the server on your local IP address
const localIP = "192.168.34.146"; // Use the correct local IP address
app.listen(port, localIP, () => {
    console.log(`Server is running on http://${localIP}:${port}`);
});
