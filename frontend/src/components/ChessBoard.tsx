import { Color, PieceSymbol, Square } from "chess.js";
import { useState } from "react";
import { MOVE } from "../screens/Game";

export const ChessBoard = ({colour,board, socket} : 
    { 
    colour: string;
    board: (
        {
        square: Square;
        type: PieceSymbol;
        color: Color;
        } | null)[][];

    socket: WebSocket;
    } 

) => {
    const rotationStyle = colour === "black" ? { transform: "rotate(180deg)", transformOrigin: "center" } : {};
    const [from, setFrom] = useState<null | Square>(null);
    return <div>
        <div style={rotationStyle}>
        {board.map((row, i) => {
            return <div key={i} className="flex">
                {row.map((square, j) => {
                    const squareRepresentation = String.fromCharCode(97 + (j%8)) +""+ (8 - i) as Square;
                    return <div onClick={() => {
                        if(!from){
                            setFrom(squareRepresentation);
                        }
                        else {
                            socket.send(JSON.stringify({
                                type: MOVE,
                                payload: {
                                    move : {from: from,
                                    to: squareRepresentation,}
                                }
                            }));
                            setFrom(null);
                        }
                    }
                } key={j} className={`w-16 h-16  ${(i+j)%2===0? "bg-green-100" : " bg-green-500" }` }>
                        <div className="w-full justify-center flex h-full">
                            <div className="h-full justify-center flex flex-col">
                                <div style={rotationStyle}>
                                {square ? <img className="w-9" src={`/${square?.color==="b" ? 
                                square?.type : `${square?.type?.toUpperCase()} copy`}.png`}/>: null}
                                </div>
                            </div>
                        </div>
                    </div>
                })}
            </div>
        })}
        </div>
    </div>
};