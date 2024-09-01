import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "../components/Button"
import { ChessBoard } from "../components/ChessBoard"
import { useSocket } from "../hooks/useSocket"
import { Chess, WHITE } from "chess.js";
import PeerService from '../services/peer';
import { useNavigate } from "react-router-dom";


export const INIT_GAME = "init_game";
export const MOVE = "move";
export const GAME_OVER = "game_over";
export const OFFER = "offer";
export const ANSWER = "answer";
export const NEGO_OFFER = "offer_for_negotiation";
export const NEGO_ANSWER = "answer_for_negotiation";
export const ADD_TRACKS = "add_tracks";

export const Game = () => {
    const socket = useSocket();
    const navigate = useNavigate();


    const peer = useRef<PeerService | null>(null); // Use useRef to store PeerService instance
    const iceCandidates = useRef<RTCIceCandidate[]>([]);

    const chess = new Chess();
    const [board, setBoard] = useState(chess.board());
    const [started, setStarted] = useState(false);
    const [colour, setColour] = useState<string>("white");
    // Specify MediaStream as the type for both state variables
    const [myStream, setMyStream] = useState<MediaStream|null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream|null>(null);
    
    const [answerHandled, setAnswerHandled] = useState(false);

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

        await peer.current.peer.setRemoteDescription(new RTCSessionDescription(offer));
        console.log("handleOffer : set remote description : ", peer.current.peer.remoteDescription);

        

        const ans = await peer.current.peer.createAnswer();
        console.log("handleOffer : createed answer : ", ans);

        await peer.current.peer.setLocalDescription(new RTCSessionDescription(ans));
        console.log("handleOffer: set local description : ", peer.current.peer.localDescription);

        socket.send(JSON.stringify({ type: ANSWER, data: ans }));
        console.log("handleOffer : sent answer : ", ans);
        setMyStream(stream);
        console.log("handleOffer : --------- ");

        // Now that remote description is set, add any stored ICE candidates
        if (iceCandidates.current.length > 0) {
            console.log('Adding stored ICE candidates...');
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
        setAnswerHandled(true);
        if (iceCandidates.current.length > 0) {
            console.log('Adding stored ICE candidates...');
            for (const candidate of iceCandidates.current) {
                await peer.current?.peer?.addIceCandidate(candidate);
            }
            iceCandidates.current = []; // Clear the list after adding
        }
        console.log("Call Accepted!");
        const remoteVideoRef = document.querySelector<HTMLVideoElement>('#remote-video');
        if (remoteVideoRef === null) {
            console.error('Remote video element not found');
            return;
        }
        remoteVideoRef.srcObject = remoteStream;
    },[]); 

    useEffect(() => {
        if (started && colour === "white") {
          sendOffer();
        }
    }, [started]);

    useEffect(() => {
        peer.current?.peer?.addEventListener("track", async (ev) => {
            const [remote] = ev.streams;
            // console.log("remoteStream1: ");
            // const remoteVideoRef = document.querySelector<HTMLVideoElement>('#remote-video');
            // if (remoteVideoRef === null) {
            //     console.error('Remote video element not found');
            //     return;
            // }
            console.log("remoteStream2: ", remote);
            setRemoteStream(remote);
            
            // remoteVideoRef.srcObject = remote;
            // console.log("remoteStream3: ", remoteVideoRef.srcObject);
            console.log("track event ------------ ");

        });
      }, [peer.current?.peer]);
    
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
        console.log("myStream1: ", myStream);
        if (myStream) {
            const localVideoRef = document.querySelector<HTMLVideoElement>('#local-video');
            console.log("myStream2: ", myStream);
            if (localVideoRef === null) {
                console.error('Local video element not found');
                return;
            }
            localVideoRef.srcObject = myStream;
            console.log("myStream3: ", localVideoRef.srcObject);
        }
    }, [myStream]);

    useEffect(() => {
        if(!socket) return;

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
                    setBoard(chess.board());
                    console.log("Move");
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
                    }
                    break;
                default:
                    console.log("Unknown message type in Game");
            }
        }

        return () => {
            socket.onmessage = null;
        }
    }, [socket]);


    if(!socket) {return <div>Connecting...</div>}
    
    return <div className="bg-black h-screen">
    <div className="flex justify-center">
        <div className="pt-8 max-w-screen-lg w-full">
            <div className="grid grid-cols-6 gap-4 w-full">
                <div className="col-span-4 w-full flex justify-center">
                    <ChessBoard colour={colour}chess={chess} setBoard={setBoard} socket={socket} board = {board} />
                </div>
                <div className="col-span-2 w-full bg-slate-900 flex justify-center">
                    <div className="pt-8">
                        {!started && <Button 
                            onclick={()=>{
                                socket.send(JSON.stringify({
                                    type : INIT_GAME,
                                }));
                            }} >
                            Play
                        </Button>}
                        {started && colour && <div className="text-white flex justify-center">{colour}</div>}
                        { started && myStream && <video id="local-video" autoPlay playsInline controls></video>}
                        { started && remoteStream && <video id="remote-video" autoPlay playsInline controls></video>}
                    </div>
                </div>
            </div>
        </div>
    </div>
    </div>

}