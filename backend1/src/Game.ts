import { Chess } from "chess.js";
import { WebSocket } from "ws";
import { ADD_TRACKS, ANSWER, GAME_OVER, INIT_GAME, NEGO_ANSWER, NEGO_OFFER, OFFER, RESET_BOARD } from "./messages";
import { MOVE } from "./messages";

export class Game {
    public player1 : WebSocket;
    public player2 : WebSocket;
    public board : Chess;
    private startTime : Date;
    private moveCount : number;
    
    constructor(player1: WebSocket, player2: WebSocket){
        this.player1 = player1;
        this.player2 = player2;
        this.board = new Chess();
        this.startTime = new Date();
        this.player1.send(JSON.stringify({
            type: INIT_GAME,
            payload: {color: "white"}
        }));
        this.player2.send(JSON.stringify({
            type: INIT_GAME,
            payload: {color: "black"}
        }));   
        this.moveCount = 0;
    }

    makeMove(socket: WebSocket, move:{from: string, to: string}){
        //validate the move using zod
        if(this.moveCount % 2 === 0 && socket === this.player2){
            return;
        }
        if(this.moveCount % 2 === 1 && socket === this.player1){
            return;
        }
        try{
            this.board.move(move);
        }
        catch(e){
            return;
        }

        this.player2.send(JSON.stringify({
                type: MOVE,
                payload : move
            }));
            this.player1.send(JSON.stringify({
                type: MOVE,
                payload : move
            }));

        //game over 
        if (this.board.isGameOver()){
            //send the game over message to both players

            this.player1.send(JSON.stringify({
                type: GAME_OVER,
                winner: this.board.turn() === "w" ? "black" : "white"
            }));

            this.player2.send(JSON.stringify({
                type: GAME_OVER,
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

    recieveOffer(socket: WebSocket, offer: any){
        //send the offer to the other player
        console.log("Offer received on backend in game.ts : ", offer);
        this.player2.send(JSON.stringify({
            type: OFFER,
            data: offer
        }));
    }

    recieveAnswer(socket: WebSocket, answer: any){
        //send the answer to the other player
        this.player1.send(JSON.stringify({
            type: ANSWER,
            data: answer
        }));
    }

    recieveNegotiationOffer(socket: WebSocket, offer: any){
        //send the offer to the other player = black player
        this.player2.send(JSON.stringify({
            type: NEGO_OFFER,
            data: offer
        }));
    }

    recieveNegotiationFinal(socket: WebSocket, answer: any){
        //send the answer to the other player = white player
        this.player1.send(JSON.stringify({
            type: NEGO_ANSWER,
            data: answer
        }));
    }

    addTracks(socket: WebSocket){
        this.player2.send(JSON.stringify({
            type: ADD_TRACKS,
        }));
    }

    sendIceCandidateToPlayer2(socket: WebSocket, candidate: any){
        this.player2.send(JSON.stringify({
            type: "ice_candidate",
            candidate: candidate
        }));
    }

    sendIceCandidateToPlayer1(socket: WebSocket, candidate: any){
        this.player1.send(JSON.stringify({
            type: "ice_candidate",
            candidate: candidate
        }));
    }

    resetBoard(socket: WebSocket) {
        // Reset the board
        this.board.reset();
        
        // Randomly swap player1 and player2
        const random = Math.random();
        let newPlayer1 = random > 0.5 ? this.player1 : this.player2;
        let newPlayer2 = random > 0.5 ? this.player2 : this.player1;

        // Send reset signal and assign new colors
        newPlayer1.send(JSON.stringify({
            type: RESET_BOARD,
            payload: { color: "white" }
        }));
        newPlayer2.send(JSON.stringify({
            type: RESET_BOARD,
            payload: { color: "black" }
        }));

        // Update the internal player references
        this.player1 = newPlayer1;
        this.player2 = newPlayer2;

        // Reset move count and game state
        this.moveCount = 0;
    }
}