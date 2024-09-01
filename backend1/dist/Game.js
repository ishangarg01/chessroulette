"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const chess_js_1 = require("chess.js");
const messages_1 = require("./messages");
const messages_2 = require("./messages");
class Game {
    constructor(player1, player2) {
        this.player1 = player1;
        this.player2 = player2;
        this.board = new chess_js_1.Chess();
        this.startTime = new Date();
        this.player1.send(JSON.stringify({
            type: messages_1.INIT_GAME,
            payload: { color: "white" }
        }));
        this.player2.send(JSON.stringify({
            type: messages_1.INIT_GAME,
            payload: { color: "black" }
        }));
        this.moveCount = 0;
    }
    makeMove(socket, move) {
        //validate the move using zod
        if (this.moveCount % 2 === 0 && socket === this.player2) {
            return;
        }
        if (this.moveCount % 2 === 1 && socket === this.player1) {
            return;
        }
        try {
            this.board.move(move);
        }
        catch (e) {
            return;
        }
        this.player2.send(JSON.stringify({
            type: messages_2.MOVE,
            payload: move
        }));
        this.player1.send(JSON.stringify({
            type: messages_2.MOVE,
            payload: move
        }));
        //game over 
        if (this.board.isGameOver()) {
            //send the game over message to both players
            this.player1.send(JSON.stringify({
                type: messages_1.GAME_OVER,
                winner: this.board.turn() === "w" ? "black" : "white"
            }));
            this.player2.send(JSON.stringify({
                type: messages_1.GAME_OVER,
                winner: this.board.turn() === "w" ? "black" : "white"
            }));
            return;
        }
        //send the move to both players client/frontend
        // if(this.moveCount % 2 === 0){
        // this.player2.send(JSON.stringify({
        //     type: MOVE,
        //     payload : move
        // }));
        // this.player1.send(JSON.stringify({
        //     type: MOVE,
        //     payload : move
        // }));
        // }
        // else{
        //     this.player1.send(JSON.stringify({
        //         type: MOVE,
        //         payload : move
        //     }));
        //     this.player2.send(JSON.stringify({
        //         type: MOVE,
        //         payload : move
        //     }));
        // }
        this.moveCount++;
    }
    recieveOffer(socket, offer) {
        //send the offer to the other player
        console.log("Offer received on backend in game.ts : ", offer);
        this.player2.send(JSON.stringify({
            type: messages_1.OFFER,
            data: offer
        }));
    }
    recieveAnswer(socket, answer) {
        //send the answer to the other player
        this.player1.send(JSON.stringify({
            type: messages_1.ANSWER,
            data: answer
        }));
    }
    recieveNegotiationOffer(socket, offer) {
        //send the offer to the other player = black player
        this.player2.send(JSON.stringify({
            type: messages_1.NEGO_OFFER,
            data: offer
        }));
    }
    recieveNegotiationFinal(socket, answer) {
        //send the answer to the other player = white player
        this.player1.send(JSON.stringify({
            type: messages_1.NEGO_ANSWER,
            data: answer
        }));
    }
    addTracks(socket) {
        this.player2.send(JSON.stringify({
            type: messages_1.ADD_TRACKS,
        }));
    }
    sendIceCandidateToPlayer2(socket, candidate) {
        this.player2.send(JSON.stringify({
            type: "ice_candidate",
            candidate: candidate
        }));
    }
    sendIceCandidateToPlayer1(socket, candidate) {
        this.player1.send(JSON.stringify({
            type: "ice_candidate",
            candidate: candidate
        }));
    }
}
exports.Game = Game;
