import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import LogoImage from "/K copy.png";
import { useNavigate } from "react-router-dom"

export const Landing = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4">
        <div className="absolute inset-0 overflow-hidden">
            {[...Array(64)].map((_, i) => (
            <div
                key={i}
                className="absolute w-16 h-16 bg-gray-800/20"
                style={{
                top: `${Math.floor(i / 8) * 12.5}%`,
                left: `${(i % 8) * 12.5}%`,
                }}
            />
            ))}
        </div>
        <motion.div
            className="flex items-center mb-4 relative z-10"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <img
            src={LogoImage}
            alt="Logo"
            className="w-16 h-16 md:w-24 md:h-24 mr-4" // Adjust size as needed
            />
            <h1 className="text-5xl md:text-7xl font-bold">ChessRoulette</h1>
        </motion.div>
        <motion.p
            className="text-xl md:text-2xl mb-8 text-center max-w-2xl relative z-10"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            Play chess with random opponents while video chatting. Experience the thrill of the game and make new connections!
        </motion.p>
        <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
        >
            <Button
                size="lg"
                className="text-2xl px-8 py-6 bg-green-600 hover:bg-green-700 transition-colors duration-300"
                onClick={() => {
                navigate("/game")
                }}
            >
                Play Now
            </Button>
        </motion.div>
        </div>
  );
}
