import {useNavigate } from "react-router-dom"
import { Button } from "../components/Button";

export const Landing = () => {
    const navigate = useNavigate();
    return <>
        <div className="h-screen flex justify-center items-center bg-black">
            <div className="text-white">Landing</div>
            <Button onclick={()=>{navigate("/game")}}>Join Game</Button>
        </div>
        </>
}