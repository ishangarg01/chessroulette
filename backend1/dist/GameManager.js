"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameManager = void 0;
const messages_1 = require("./messages");
const Game_1 = require("./Game");
class GameManager {
    constructor() {
        this.games = [];
        this.pendingUser = null;
        this.users = [];
    }
    addUser(socket) {
        this.users.push(socket);
        this.addHandler(socket);
    }
    removeUser(socket) {
        this.users = this.users.filter(user => user != socket);
        // stop the game because the user left...
    }
    addHandler(socket) {
        socket.on("message", (data) => {
            const message = JSON.parse(data.toString());
            if (message.type === messages_1.INIT_GAME) {
                if (this.pendingUser && this.pendingUser !== socket) {
                    // start a game
                    const game = new Game_1.Game(this.pendingUser, socket);
                    this.games.push(game);
                    this.pendingUser = null;
                    // you will recieve a 
                }
                else {
                    this.pendingUser = socket;
                }
            }
            if (message.type === messages_1.MOVE) {
                const game = this.games.find(game => game.player1 === socket || game.player2 === socket);
                if (game) {
                    game.makeMove(socket, message.payload.move);
                }
            }
            if (message.type === messages_1.OFFER) {
                const game = this.games.find(game => game.player1 === socket || game.player2 === socket);
                if (game) {
                    game.recieveOffer(socket, message.data);
                }
                console.log("Offer received on backend: ", message.data);
            }
            if (message.type === messages_1.ANSWER) {
                const game = this.games.find(game => game.player1 === socket || game.player2 === socket);
                if (game) {
                    game.recieveAnswer(socket, message.data);
                }
                console.log("Answer received on backend");
            }
            if (message.type === messages_1.NEGO_OFFER) {
                // sent by the white side
                const game = this.games.find(game => game.player1 === socket || game.player2 === socket);
                if (game) {
                    game.recieveNegotiationOffer(socket, message.data);
                }
                console.log("Negotiation Offer received on backend");
            }
            if (message.type === messages_1.NEGO_ANSWER) {
                // sent by the black side
                const game = this.games.find(game => game.player1 === socket || game.player2 === socket);
                console.log(message.data);
                if (game) {
                    game.recieveNegotiationFinal(socket, message.data);
                }
                console.log("Negotiation Answer received on backend");
            }
            if (message.type === messages_1.ADD_TRACKS) {
                const game = this.games.find(game => game.player1 === socket || game.player2 === socket);
                if (game) {
                    game.addTracks(socket);
                }
                console.log("white client asks the black client to add tracks");
            }
            if (message.type === "ice_candidate") {
                const game = this.games.find(game => game.player1 === socket);
                if (game) {
                    game.sendIceCandidateToPlayer2(socket, message.candidate);
                }
                const game2 = this.games.find(game => game.player2 === socket);
                if (game2) {
                    game2.sendIceCandidateToPlayer1(socket, message.candidate);
                }
                console.log("ICE candidate received on backend");
            }
            if (message.type === messages_1.RESET_BOARD) {
                const game = this.games.find(game => game.player1 === socket || game.player2 === socket);
                if (game) {
                    game.resetBoard(socket);
                }
                console.log("Board reset request received on backend");
            }
        });
    }
}
exports.GameManager = GameManager;
