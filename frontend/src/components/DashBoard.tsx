export const DashBoard = ({noOfMoves, started, colour} : {
    noOfMoves: number;
    started: boolean;
    colour: string;
}) => {
    const yourTurn = colour === "white" && noOfMoves % 2 === 0 || colour === "black" && noOfMoves % 2 === 1;
    return <>
        {started && colour && <div className="text-white flex justify-center">{colour}</div>}
        {/* {started && <div className="text-white flex justify-center">{noOfMoves}</div>} */}
        {started && <div className="text-white flex justify-center">{yourTurn ? "Your Turn" : "Opponent's Turn"}</div>}
    </>
};