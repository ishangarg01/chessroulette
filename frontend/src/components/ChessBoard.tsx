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
                    const isFromSquare = from === squareRepresentation;  // Check if this is the "from" square           
                    let highlightColor = baseColor;  // Default to the base color

                    if (isFromSquare) {
                        // Apply special color for the "from" square
                        highlightColor = (i + j) % 2 === 0 ? "bg-green-200" : "bg-green-400";  // Yellow for white squares, green for dark squares
                    } else if (isLastMoveSquare) {
                        // Highlight last move squares with yellow
                        highlightColor = "bg-yellow-200";
                    }

                    return <div onClick={() => {
                        // if the square is empty from should not be set
                        // if from is set but the square if filled by the same color piece then that should be from.
                        // if(!from){
                        //     setFrom(squareRepresentation);
                        //     console.log("move from ",squareRepresentation);
                        // }
                        // else {
                        //     socket.send(JSON.stringify({
                        //         type: MOVE,
                        //         payload: {
                        //             move : {from: from,
                        //             to: squareRepresentation,}
                        //         }
                        //     }));
                        //     setFrom(null);
                        // }

                        if (!from) {
                            // If "from" is not set, only set it if the square has a piece of the player's color
                            if (square && square.color === colour[0]) {
                                setFrom(squareRepresentation);
                                console.log("move from ", squareRepresentation);
                            } else {
                                console.log("Invalid from selection");
                            }
                        } else {
                            // If "from" is already set
                            if (square && square.color === colour[0]) {
                                // If the clicked square has a piece of the player's color, update "from" to the new piece
                                setFrom(squareRepresentation);
                                console.log("updated move from ", squareRepresentation);
                            } else {
                                // Otherwise, attempt the move
                                socket.send(JSON.stringify({
                                    type: MOVE,
                                    payload: {
                                        move: {
                                            from: from,
                                            to: squareRepresentation,
                                        }
                                    }
                                }));
                                setFrom(null); // reset "from" after making the move
                            }
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