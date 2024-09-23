import { useEffect, useState, useCallback } from "react";

const WS_URL = "https://chessroulette.onrender.com";

export const useSocket = () => {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);  // Track connection status

    useEffect(() => {
        const ws = new WebSocket(WS_URL);

        ws.onopen = () => {
            console.log("WebSocket connected!");
            setSocket(ws);
            setIsConnected(true);  // Mark the connection as open
        };

        ws.onclose = () => {
            console.log("WebSocket closed!");
            setSocket(null);
            setIsConnected(false); // Mark the connection as closed
        };

        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
            setIsConnected(false); // Mark the connection as failed
        };

        return () => {
            ws.close(); // Ensure socket is closed when component unmounts
        };
    }, []);

    const resetSocket = useCallback(() => {
        if (socket) {
            socket.close();  // Close existing socket
        }
        setIsConnected(false);
        const ws = new WebSocket(WS_URL); // Re-initialize the socket
        ws.onopen = () => {
            console.log("WebSocket reconnected!");
            setSocket(ws);
            setIsConnected(true);
        };
        setSocket(ws);
    }, [socket]);

    return { socket, isConnected, resetSocket };
};

