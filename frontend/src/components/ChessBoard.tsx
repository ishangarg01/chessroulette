import { Color, PieceSymbol, Square } from "chess.js";
import { useState } from "react";
import { MOVE } from "../screens/Game";

export const ChessBoard = ({colour,board, socket, lastMove} : 
    { 
    colour: string;
    board: (
        {
        square: Square;
        type: PieceSymbol;
        color: Color;
        } | null)[][];

    socket: WebSocket;
    lastMove: {from: Square, to: Square} | null;
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
                    const isLastMoveSquare = lastMove && (squareRepresentation === lastMove.from || squareRepresentation === lastMove.to);
                    const baseColor = (i + j) % 2 === 0 ? "bg-green-100" : "bg-green-500";
                    const highlightColor = isLastMoveSquare ? "bg-yellow-200" : baseColor;


                    return <div onClick={() => {
                        // if the square is empty from should not be set
                        // if from is set but the square if filled by the same color piece then that should be from.
                        if(!from){
                            setFrom(squareRepresentation);
                            console.log("move from ",squareRepresentation);
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
                } key={j} className={`w-16 h-16  ${highlightColor}` }>
                        <div className="w-full justify-center flex h-full">
                            <div className="h-full justify-center flex flex-col">
                                <div style={rotationStyle}>
                                {square ? <img className="w-9" src={`/${square?.color==="b" ? square?.type : `${square?.type?.toUpperCase()} copy`}.png`}/>: null}
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