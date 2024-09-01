import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "../components/Button";
import { ChessBoard } from "../components/ChessBoard";
import { useSocket } from "../hooks/useSocket";
import { Chess } from "chess.js";
import peer from '../services/peer';


export const Game = () => {
    const socket = useSocket();
    const chess = new Chess();
    const [board, setBoard] = useState(chess.board());
    const [started, setStarted] = useState(false);
    const [colour, setColour] = useState<string | null>(null);

    const [localVideoTrack, setLocalVideoTrack] = useState<MediaStreamTrack | null>(null);
    const [localAudioTrack, setLocalAudioTrack] = useState<MediaStreamTrack | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

    const localVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

    const startStream = useCallback(async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        const videoTrack = stream.getVideoTracks()[0];
        const audioTrack = stream.getAudioTracks()[0];

        setLocalVideoTrack(videoTrack);
        setLocalAudioTrack(audioTrack);

        if (peer.peer) {
            peer.peer.addTrack(videoTrack, stream);
            peer.peer.addTrack(audioTrack, stream);
        }

        return stream;
    }, []);

    const handleTrackEvent = useCallback((event: RTCTrackEvent) => {
        const stream = event.streams[0];
        setRemoteStream(stream);
    }, []);

    const initiateCall = useCallback(async () => {
        if (socket && colour === "white") {
            await startStream();
            const offer = await peer.getOffer();
            socket.send(JSON.stringify({ type: OFFER, data: offer }));
        }
    }, [socket, colour, startStream]);

    useEffect(() => {
        if (peer.peer && socket) {
            peer.peer.addEventListener('track', handleTrackEvent);
        }

        return () => {
            if (peer.peer) {
                peer.peer.removeEventListener('track', handleTrackEvent);
            }
        };
    }, [peer.peer, socket, handleTrackEvent]);

    useEffect(() => {
        if (!socket) return;

        const handleMessage = async (event: any) => {
            const message = JSON.parse(event.data);
            switch (message.type) {
                case INIT_GAME:
                    setBoard(chess.board());
                    setColour(message.payload.color);
                    setStarted(true);
                    break;
                case MOVE:
                    const move = message.payload;
                    chess.move(move);
                    setBoard(chess.board());
                    break;
                case GAME_OVER:
                    setStarted(false);
                    break;
                case OFFER:
                    await startStream();
                    const answer = await peer.getAnswer(message.data);
                    if (answer) {
                        socket.send(JSON.stringify({ type: ANSWER, data: answer }));
                    }
                    break;
                case ANSWER:
                    await peer.setRemoteDescription2(message.data);
                    break;
                default:
                    console.log("Unknown message type in Game");
            }
        };

        socket.onmessage = handleMessage;

        if (started) {
            initiateCall();
        }

        return () => {
            socket.onmessage = null;
        };
    }, [socket, started, initiateCall, startStream]);

    // Set the local video element's source object once the local video track is available
    useEffect(() => {
        if (localVideoTrack && localVideoRef.current) {
            const localStream = new MediaStream([localVideoTrack]);
            localVideoRef.current.srcObject = localStream;
            localVideoRef.current.play();
        }
    }, [localVideoTrack]);

    // Set the remote video element's source object once the remote stream is available
    useEffect(() => {
        if (remoteStream && remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
            remoteVideoRef.current.play();
        }
    }, [remoteStream]);

    if (!socket) return <div>Connecting...</div>;

    return (
        <div className="bg-black h-screen">
            <div className="flex justify-center">
                <div className="pt-8 max-w-screen-lg w-full">
                    <div className="grid grid-cols-6 gap-4 w-full">
                        <div className="col-span-4 w-full flex justify-center">
                            <ChessBoard chess={chess} setBoard={setBoard} socket={socket} board={board} />
                        </div>
                        <div className="col-span-2 w-full bg-slate-900 flex justify-center">
                            <div className="pt-8">
                                {!started && (
                                    <Button
                                        onClick={() => {
                                            socket.send(JSON.stringify({ type: INIT_GAME }));
                                        }}
                                    >
                                        Play
                                    </Button>
                                )}
                                {started && (
                                    <video
                                        width="200px"
                                        height="200px"
                                        autoPlay
                                        muted
                                        ref={localVideoRef}
                                    />
                                )}
                                <div>Remote Stream</div>
                                {started && (
                                    <video
                                        width="300px"
                                        height="500px"
                                        autoPlay
                                        ref={remoteVideoRef}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
