export const SkeletonChessBoard = () => {
    // Skeleton board size 8x8, alternating gray-950 and gray-900 for the squares.
    const board = Array.from({ length: 8 }, (_, rowIndex) =>
        Array.from({ length: 8 }, (_, colIndex) => ({
            color: (rowIndex + colIndex) % 2 === 0 ? "bg-gray-950" : "bg-gray-900",
        }))
    );

    return (
        <div>
            <div>
                {board.map((row, i) => {
                    return (
                        <div key={i} className="flex">
                            {row.map((square, j) => {
                                return (
                                    <div
                                        key={j}
                                        className={`w-16 h-16 ${square.color}`}
                                    />
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
