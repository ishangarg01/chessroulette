import { SkeletonChessBoard } from "../components/SkeletonBoard";

export const SkeletonGame = () => {
    return (
        <div className="bg-black h-screen">
            <div className="flex justify-center">
                <div className="pt-8 max-w-screen-lg w-full">
                    <div className="grid grid-cols-6 gap-4 w-full m-8">
                        <div className="col-span-4 w-full flex justify-center">
                            <div className="w-full flex flex-col items-center">
                                {/* Skeleton Chess Board */}
                                <SkeletonChessBoard />

                                {/* <div className="flex flex-row mt-4 items-start"> */}
                                    {/* Placeholder for buttons */}
                                    {/* <div className="w-32 h-10 bg-gray-900 rounded-lg"></div> */}
                                    {/* <div className="ml-4 w-32 h-10 bg-gray-900 rounded-lg"></div> */}
                                {/* </div> */}
                            </div>
                        </div>
                        <div className="col-span-2 w-full bg-gray-950 flex justify-center">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
