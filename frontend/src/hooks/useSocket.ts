import { useEffect, useState } from "react";

const WS_URL = "ws://localhost:8080";
// const WS_URL = "ws://192.168.207.146:8080";

export const useSocket = () => {
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        const ws = new WebSocket(WS_URL);
        ws.onopen = () => {
             setSocket(ws);
        };

        ws.onclose = () => {
            setSocket(null);
        };

        setSocket(ws);
        return () => {
            ws.close();
        };
    }, []);

    return socket;
};
