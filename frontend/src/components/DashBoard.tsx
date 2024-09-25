export const DashBoard = ({noOfMoves, started, colour} : {
    noOfMoves: number;
    started: boolean;
    colour: string;
}) => {
    const yourTurn = colour === "white" && noOfMoves % 2 === 0 || colour === "black" && noOfMoves % 2 === 1;
    return <div className="">
        {/* {started && colour && <div className="text-white flex justify-center mt-2">{colour}</div>} */}
        {/* {started && <div className="text-white flex justify-center">{noOfMoves}</div>} */}
        {started && <div className="text-white flex justify-center mt-2">{yourTurn ? "Your Turn" : "Opponent's Turn"}</div>}
    </div>
};