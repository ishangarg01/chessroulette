import { WebSocket } from "ws";
import { ANSWER, INIT_GAME, MOVE, NEGO_OFFER, NEGO_ANSWER, OFFER, ADD_TRACKS } from "./messages";
import { Game } from "./Game";

export class GameManager {
    private games: Game[];
    private pendingUser : WebSocket | null;
    private users : WebSocket[];

    constructor() {
        this.games = [];
        this.pendingUser = null;
        this.users = []; 
    }

    addUser(socket : WebSocket){
        this.users.push(socket);
        this.addHandler(socket);
    }

    removeUser(socket : WebSocket){
        this.users = this.users.filter(user=>user!=socket)
        // stop the game because the user left...
    }
    
    private addHandler(socket : WebSocket) {
        socket.on("message", (data)=>{
            const message = JSON.parse(data.toString());
            
            if (message.type === INIT_GAME) {
                if(this.pendingUser && this.pendingUser!==socket){
                    // start a game
                    const game = new Game(this.pendingUser, socket);
                    this.games.push(game);
                    this.pendingUser = null;
                    // you will recieve a 

                } else {
                    this.pendingUser = socket; 
                }
            }

            if(message.type === MOVE){
                const game = this.games.find(game=>game.player1 === socket || game.player2 === socket);
                if (game) { game.makeMove(socket, message.payload.move);} 
            } 

            if(message.type === OFFER){
                const game = this.games.find(game=>game.player1 === socket || game.player2 === socket);
                if (game) { game.recieveOffer(socket, message.data);}
                console.log("Offer received on backend: ", message.data);
            }

            if(message.type === ANSWER){
                const game = this.games.find(game=>game.player1 === socket || game.player2 === socket);
                if (game) { game.recieveAnswer(socket, message.data);}
                console.log("Answer received on backend");
            }

            if(message.type === NEGO_OFFER){
                // sent by the white side
                const game = this.games.find(game=>game.player1 === socket || game.player2 === socket);
                if (game) { game.recieveNegotiationOffer(socket, message.data);}
                console.log("Negotiation Offer received on backend");
            }

            if(message.type === NEGO_ANSWER){
                // sent by the black side
                const game = this.games.find(game=>game.player1 === socket || game.player2 === socket);
                console.log(message.data);
                if (game) { game.recieveNegotiationFinal(socket, message.data);}
                console.log("Negotiation Answer received on backend");
            }

            if(message.type === ADD_TRACKS){
                const game = this.games.find(game=>game.player1 === socket || game.player2 === socket);
                if (game) { game.addTracks(socket);}
                console.log("white client asks the black client to add tracks");
            }

            if(message.type === "ice_candidate"){
                const game = this.games.find(game=>game.player1 === socket);
                if (game) { game.sendIceCandidateToPlayer2(socket, message.candidate);}

                const game2 = this.games.find(game=>game.player2 === socket);
                if (game2) { game2.sendIceCandidateToPlayer1(socket, message.candidate);}
                console.log("ICE candidate received on backend");
            }


        })
    }

}