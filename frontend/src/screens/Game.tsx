import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "../components/Button"
import { ChessBoard } from "../components/ChessBoard"
import { useSocket } from "../hooks/useSocket"
import { Chess } from "chess.js";
import PeerService from '../services/peer';
import {MOVESOUND1} from '../../public/Sounds/sounds';
import { DashBoard } from "../components/DashBoard";
import { SkeletonGame } from "../components/Skeleton";
// import { useNavigate } from "react-router-dom";


export const INIT_GAME = "init_game";
export const MOVE = "move";
export const GAME_OVER = "game_over";
export const OFFER = "offer";
export const ANSWER = "answer";
export const NEGO_OFFER = "offer_for_negotiation";
export const NEGO_ANSWER = "answer_for_negotiation";
export const ADD_TRACKS = "add_tracks";
export const RESET_BOARD = "reset_board";
// const peer = new PeerService();



export const Game = () => {
    
    const { socket, isConnected, resetSocket } = useSocket();
    // const navigate = useNavigate();


    const peer = useRef<PeerService | null>(null); // Use useRef to store PeerService instance
    const iceCandidates = useRef<RTCIceCandidate[]>([]);

    const chess = new Chess();
    const [board, setBoard] = useState(chess.board());
    const [started, setStarted] = useState(false);
    const [colour, setColour] = useState<string>("white");
    // Specify MediaStream as the type for both state variables
    const [myStream, setMyStream] = useState<MediaStream|null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream|null>(null);
    // const [isConnecting, setIsConnecting] = useState(true); // Track connection state
    const [noOfMoves, setNoOfMoves] = useState(0);
    const [waitingForOtherPlayer, setWaitingForOtherPlayer] = useState(false);
    const [lastMove, setLastMove] = useState<any | null>(null);

    // const [, setAnswerHandled] = useState(false);

    useEffect(() => {
        if (socket) {
            peer.current = new PeerService(socket); // Initialize PeerService with socket
        }
    }, [socket]);

    const sendOffer = useCallback(async () => {
        if (!socket || !peer.current?.peer) return;
        console.log("sendOffer : --------- ");
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
        });
        setMyStream(stream);
        console.log("sendOffer : started a stream : ", stream);

        for (const track of stream.getTracks()) {
            peer.current.peer?.addTrack(track, stream);
        }
        peer.current.peer.getSenders().forEach(sender => {
            const track = sender.track;
            if (track) {
                console.log(`sendOffer : sender track: ${track.kind}, ID: ${track.id}`);
            }
        });

        peer.current?.peer?.addEventListener("track", async (ev) => {
            const [remote] = ev.streams;
            console.log("track got triggered: ", ev.streams[0]);
            // console.log("remoteStream1: ");
            const remoteVideoRef = document.querySelector<HTMLVideoElement>('#remote-video');
            if (remoteVideoRef === null) {
                console.error('Remote video element not found');
            }
            else{
                console.log("remoteStream3: ", remoteVideoRef.srcObject);
                remoteVideoRef.srcObject = remote;
            }
            console.log("remoteStream2: ", remote);
            setRemoteStream(remote);
            
            console.log("track event ------------ ");

        });



        const offer = await peer.current.peer.createOffer();
        console.log("sendOffer : createed offer : ", offer);
    
        await peer.current.peer.setLocalDescription(new RTCSessionDescription(offer));
        console.log("sendOffer : set local description : ", peer.current.peer.localDescription);
        
        socket.send(JSON.stringify({ type: OFFER, data: offer }));
        console.log("sendOffer : --------- ");
    }, [socket, peer.current?.peer!==null]);

    const handleOffer = useCallback(async (offer : RTCSessionDescriptionInit) => {
        if (!socket || !peer.current?.peer) return;

        console.log("handleOffer : --------- ");
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
        });
        setMyStream(stream);
        
        console.log("handleOffer : started a stream : ", stream);
        

        for (const track of stream.getTracks()) {
            peer.current.peer?.addTrack(track, stream);
        }
        peer.current.peer.getSenders().forEach(sender => {
            const track = sender.track;
            if (track) {
                console.log(`handleOffer : sender track: ${track.kind}, ID: ${track.id}`);
            }
        });


        peer.current?.peer?.addEventListener("track", async (ev) => {
            const [remote] = ev.streams;
            console.log("track got triggered: ", ev.streams[0]);
            // console.log("remoteStream1: ");
            const remoteVideoRef = document.querySelector<HTMLVideoElement>('#remote-video');
            if (remoteVideoRef === null) {
                console.error('Remote video element not found');
            }
            else{
                console.log("remoteStream3: ", remoteVideoRef.srcObject);
                remoteVideoRef.srcObject = remote;
            }
            console.log("remoteStream2: ", remote);
            setRemoteStream(remote);
            
            console.log("track event ------------ ");

        });

        await peer.current.peer.setRemoteDescription(new RTCSessionDescription(offer));
        console.log("handleOffer : set remote description : ", peer.current.peer.remoteDescription);
        
        // if (iceCandidates.current.length > 0) {
        //     console.log('Adding stored ICE candidates...');
        //     for (const candidate of iceCandidates.current) {
        //         await peer.current?.peer?.addIceCandidate(candidate);
        //         console.log('Adding ICE candidate...in hadle offer 1: ', candidate);
        //     }
        //     iceCandidates.current = []; // Clear the list after adding
        // }
        

        const ans = await peer.current.peer.createAnswer();
        console.log("handleOffer : createed answer : ", ans);

        await peer.current.peer.setLocalDescription(new RTCSessionDescription(ans));
        console.log("handleOffer: set local description : ", peer.current.peer.localDescription);

        socket.send(JSON.stringify({ type: ANSWER, data: ans }));
        console.log("handleOffer : sent answer : ", ans);
        
        console.log("handleOffer : --------- ");

        // Now that remote description is set, add any stored ICE candidates
        if (iceCandidates.current.length > 0) {
            console.log('Adding stored ICE candidates...: ', iceCandidates.current.length);
            for (const candidate of iceCandidates.current) {
                await peer.current?.peer?.addIceCandidate(candidate);
                console.log('Adding ICE candidate...in hadle offer: ', candidate);
            }
            iceCandidates.current = []; // Clear the list after adding
        }

        // const remoteVideoRef = document.querySelector<HTMLVideoElement>('#remote-video');
        // if (remoteVideoRef === null) {
        //     console.error('Remote video element not found');
        //     return;
        // }
        // remoteVideoRef.srcObject = remoteStream;
    },[socket, peer.current?.peer!==null]);
    
    const handleAnswer = useCallback(async (ans : RTCSessionDescriptionInit) => {
        console.log("Call Accepted!1");
        await peer.current?.peer?.setRemoteDescription(new RTCSessionDescription(ans));
        console.log("Call Accepted!2 : ", peer.current?.peer?.remoteDescription);
        // setAnswerHandled(true);
        if (iceCandidates.current.length > 0) {
            console.log('Adding stored ICE candidates... : ', iceCandidates.current.length);
            for (const candidate of iceCandidates.current) {
                await peer.current?.peer?.addIceCandidate(candidate);
                console.log('Adding ICE candidate...in hadle answer: ', candidate);
            }
            iceCandidates.current = []; // Clear the list after adding
        }
        console.log("Call Accepted!");
        // const remoteVideoRef = document.querySelector<HTMLVideoElement>('#remote-video');
        // if (remoteVideoRef === null) {
        //     console.error('Remote video element not found');
        //     return;
        // }
        // remoteVideoRef.srcObject = remoteStream;
    },[]); 

    const restartGame = useCallback(() => {
        if (!socket) return;
        chess.reset(); // Reset the chess game to the initial position
        setBoard(chess.board()); // Update the board state
        setNoOfMoves(0); // Reset the move counter
        setLastMove(null); // Clear the last move
        console.log("Game Restarted");
    }, [chess, colour, socket]);


    useEffect(() => {
        if (started && colour === "white") {
          sendOffer();
        }
    }, [started]);

    // useEffect(() => {
    //     console.log(peer.current);
    //     console.log("track listener added ------------ ");
    //     peer.current?.peer?.addEventListener("track", async (ev) => {
    //         const [remote] = ev.streams;
    //         console.log("track got triggered: ", ev.streams[0]);
    //         // console.log("remoteStream1: ");
    //         const remoteVideoRef = document.querySelector<HTMLVideoElement>('#remote-video');
    //         if (remoteVideoRef === null) {
    //             console.error('Remote video element not found');
    //         }
    //         else{
    //             console.log("remoteStream3: ", remoteVideoRef.srcObject);
    //             remoteVideoRef.srcObject = remote;
    //         }
    //         console.log("remoteStream2: ", remote);
    //         setRemoteStream(remote);
            
    //         console.log("track event ------------ ");

    //     });
    // }, [peer.current?.peer!==null, peer.current!==null]);
    
    useEffect(() => {
        if (remoteStream) {
            console.log("remoteStream assigned to video element: ");
            const remoteVideoRef = document.querySelector<HTMLVideoElement>('#remote-video');
            if (remoteVideoRef) {
                remoteVideoRef.srcObject = remoteStream;
                console.log("remoteStream assigned to video element:", remoteStream);
            }
        }
    }, [remoteStream]);


    useEffect(() => {  
        console.log("local stream is set: ", myStream);
        if (myStream) {
            const localVideoRef = document.querySelector<HTMLVideoElement>('#local-video');
            // console.log("myStream2: ", myStream);
            if (localVideoRef === null) {
                console.error('Local video element not found');
                return;
            }
            localVideoRef.srcObject = myStream;
            // console.log("myStream3: ", localVideoRef.srcObject);
        }
    }, [myStream]);

    useEffect(() => {
        if(!socket) return;

        // socket.onopen = () => {
        //     setIsConnecting(false); // Connection established
        // };

        // socket.onclose = () => {
        //     setIsConnecting(true); // Connection closed or lost
        // };

        socket.onmessage = async (event) => {
            const message = await JSON.parse(event.data);
            console.log("Message received: ", message);
            switch(message.type) {
                case INIT_GAME:
                    setBoard(chess.board());
                    setColour(message.payload.color);
                    console.log("Game Initialized");
                    setStarted(true);
                    break;
                case MOVE:
                    const move = message.payload;
                    chess.move(move);
                    setLastMove(move);
                    setBoard(chess.board());
                    console.log(move);
                    console.log(MOVESOUND1);
                    MOVESOUND1.play();
                    setNoOfMoves(prevMoves => prevMoves + 1);
                    break;
                case GAME_OVER:
                    console.log("Game Over");
                    setStarted(false);
                    break;
                case OFFER:
                    // getting offer from white and sending answer
                    console.log("Offer received on frontend / message.data: ", message.data);
                    handleOffer(message.data);
                    break;
                case ANSWER:
                    // getting answer from black
                    handleAnswer(message.data);
                    break;
                case 'ice_candidate':
                    const candidate = new RTCIceCandidate(message.candidate);
                    if (peer.current?.peer?.remoteDescription) {
                        console.log('Adding ICE candidate...after message: ', candidate);
                        // If remote description is already set, add ICE candidate directly
                        await peer.current?.peer.addIceCandidate(candidate);
                    } else {
                        // Otherwise, store the candidate to add it later
                        iceCandidates.current.push(candidate);
                        console.log('Storing ICE candidate...: ', candidate, iceCandidates.current);
                    }
                    break;
                case RESET_BOARD:
                    setColour(message.payload.color);
                    restartGame();
                    break;
                default:
                    console.log("Unknown message type in Game");
            }
        }

        return () => {
            socket.onmessage = null;
        }
    }, [socket]);

    const resetGame = useCallback(() => {
        // Stop and reset streams
        myStream?.getTracks().forEach(track => track.stop());
        remoteStream?.getTracks().forEach(track => track.stop());
    
        // Reset states
        setStarted(false);
        setNoOfMoves(0);
        setWaitingForOtherPlayer(false);
        setMyStream(null);
        setRemoteStream(null);
        setLastMove(null);
        setColour("white");
        setBoard(chess.board());
    
        // Reset refs
        peer.current = null;
        iceCandidates.current = [];
    
        // Reset socket connection
        resetSocket();
      }, [myStream, remoteStream, resetSocket, chess]);

    // if(!socket) {return <div>Connecting...</div>}
    if(!socket) {return <SkeletonGame/>}
    
    return <div className="bg-black h-screen">
    <div className="flex justify-center">
        <div className="pt-8 max-w-screen-lg w-full">
            <div className="grid grid-cols-6 gap-4 w-full m-8">
                <div className="col-span-4 w-full flex justify-center">
                    <div className="w-full flex flex-col items-center">
                    <ChessBoard colour={colour} socket={socket} board = {board} lastMove = {lastMove}/>
                    <div className="flex flex-row mt-4 items-start">
                        {started && <Button onclick={()=>{resetGame()}}>New Player</Button>}
                        { started && 
                                <div className="ml-4"><Button onclick={()=>{// Notify the opponent about the restart
                                    socket.send(JSON.stringify({
                                        type : RESET_BOARD,
                                    }));}}>
                                    Play another game
                                </Button></div>
                        }
                    </div>
                    </div>
                </div>
                <div className="col-span-2 w-full bg-slate-900 flex justify-center">
                    <div className="pt-4 pb-4">
                        { started && myStream && <video id="local-video" autoPlay playsInline controls muted className="rounded-lg"></video>}
                        { started && remoteStream && <video id="remote-video" autoPlay playsInline controls className="rounded-lg mt-4"></video>}
                        {!isConnected && <div className="text-white">Connecting...</div>}
                        <div className="flex flex-col items-center justify-center">
                            {!started && isConnected && (
                                <Button
                                    onclick={() => {
                                        socket.send(JSON.stringify({
                                            type: INIT_GAME,
                                        }));
                                        setWaitingForOtherPlayer(true);
                                    }}
                                >
                                    Play
                                </Button>
                            )}

                            {!started && waitingForOtherPlayer && (
                                <div className="text-white break-words whitespace-normal mt-4">
                                    Waiting for somebody to join...
                                </div>
                            )}
                        </div>

                        <DashBoard noOfMoves={noOfMoves} started={started} colour={colour}/>
                        {/* { started && <div className="flex justify-center"><Button onclick={()=>{
                            console.log("remote stream : ", remoteStream);
                            if (iceCandidates.current.length > 0) {
                                console.log('Adding stored ICE candidates...');
                                for (const candidate of iceCandidates.current) {
                                    const addPeerCandidate = async () => {
                                        await peer.current?.peer?.addIceCandidate(candidate);
                                    }
                                    addPeerCandidate();
                                }
                                iceCandidates.current = []; // Clear the list after adding
                            }
                            setRemoteStream(remoteStream);

                            // console.log("remoteStream assigned to video element: ");
                            const remoteVideoRef = document.querySelector<HTMLVideoElement>('#remote-video');
                            if (remoteVideoRef) {
                                remoteVideoRef.srcObject = remoteStream;
                                console.log("remoteStream assigned to video element:", remoteStream);
                            }
                        }}>Refresh</Button></div>} */}

                        
                        
                    </div>
                </div>
                
            </div>

            

            
            
        
        </div>
    </div>
    </div>

}