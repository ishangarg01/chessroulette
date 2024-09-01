import { useState, useEffect, useCallback } from "react";
import { Button } from "../components/Button"
import { ChessBoard } from "../components/ChessBoard"
import { useSocket } from "../hooks/useSocket"
import { Chess } from "chess.js";
import ReactPlayer from "react-player";
import peer from '../services/peer';


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
    const chess = new Chess();
    const [board, setBoard] = useState(chess.board());
    const [started, setStarted] = useState(false);
    const [colour, setColour] = useState(null);
    // Specify MediaStream as the type for both state variables
    const [myStream, setMyStream] = useState<MediaStream>(new MediaStream());
    const [remoteStream, setRemoteStream] = useState<MediaStream>(new MediaStream());
    const [tempStream, setTempStream] = useState<MediaStream>(new MediaStream());
 

    const handleTrackEvent = useCallback(async (event : RTCTrackEvent) => {
        // const remoteStream = event.streams;
        console.log("Remote track received");  
        console.log(event.streams[0]);
        // console.log(event.streams.length);      
        const Stream = event.streams[0];
        console.log("Remote Stream Tracks:", Stream);
        setRemoteStream(Stream);
    }
    , []);

    const sendStreams = useCallback(() => {
        for (const track of myStream.getTracks()) {
          peer.peer?.addTrack(track, myStream);
        }
      }, [myStream]);


    useEffect(() => {
        if(peer.peer && socket) {
            console.log("Setting up peer event listeners");
            peer.peer.addEventListener('track', handleTrackEvent);
        }
    
        return () => {
            if(peer.peer) {
                peer.peer.removeEventListener('track', handleTrackEvent);
            }
        };
    }, [peer.peer, socket, handleTrackEvent]);


  

    const handleNegoNeeded = useCallback(async () => {
        console.log('Negotiation needed handling...');
    
            // Ensure that no other negotiation is in progress
            if (peer.peer?.signalingState !== "stable") {
                console.log("Signaling state not stable, negotiation deferred");
                return;
            }
    
            // Create a new offer
            const offer = await peer.peer.createOffer();
            console.log("Offer created:", offer);
            // Set the local description
            await peer.peer.setLocalDescription(offer);
    
            // Send the offer to the remote peer via WebSocket
            if (socket && offer) {
                socket.send(JSON.stringify({
                    type: NEGO_OFFER,
                    data: offer,
                }));
            }
    
            console.log("Negotiation offer sent:", offer);
        
    }, [socket]);
    
    useEffect(() => {
        const peerConnection = peer.peer;
    
        if (peerConnection) {
            peerConnection.addEventListener("negotiationneeded", handleNegoNeeded);
        }
    
        return () => {
            if (peerConnection) {
                peerConnection.removeEventListener("negotiationneeded", handleNegoNeeded);
            }
        };
    }, [handleNegoNeeded]);
    


    useEffect(() => {
        if(!socket) {return;}
        
        const handleMessage = async (event:any) => {
            const message = JSON.parse(event.data);
            console.log(message);
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
                    console.log("Offer recieved on black side?");
                    const startStream = (async () => {
                        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                        console.log("Stream:", stream);
                        setMyStream(stream);
                        setTempStream(stream);
                        return stream;
                    });
                    const addTracksToPeer = (async (stream : MediaStream) => {
                        if (peer.peer) {
                            // const existingSenders = peer.peer.getSenders().map(sender => sender.track);
                            for (const track of stream.getTracks()) {
                            //     if (!existingSenders.includes(track)) {
                                    peer.peer.addTrack(track, stream);
                                }
                            // }
                        }
                    });
                    startStream();
                    // addTracksToPeer(stream);




                    console.log(message.data);
                    const sendAnswer = async () => {
                        const answer = await peer.getAnswer(message.data);
                        if(answer) {
                            socket.send(JSON.stringify({
                                type: ANSWER,
                                data: answer
                            }));
                        }
                    };
                    sendAnswer();
                    break;
                case ANSWER:
                    console.log("Answer recieved on white side?");
                    console.log(message.data);
                    const setRemoteDescription = async () => {
                        await peer.setLocalDescription(message.data);
                    }
                    setRemoteDescription();
                    sendStreams();

                    break;
                case NEGO_OFFER:
                    console.log("Negotiation Offer recieved on black side?");
                    break;
                default:
                    console.log("Unknown message type in Game");

            };
        };

        socket.onmessage = handleMessage;

        if(started){
            const startStream = (async () => {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                console.log("Stream:", stream);
                setMyStream(stream);
                setTempStream(stream);
                return stream;
            });
            const addTracksToPeer = (async (stream : MediaStream) => {
                if (peer.peer) {
                    // const existingSenders = peer.peer.getSenders().map(sender => sender.track);
                    for (const track of stream.getTracks()) {
                    //     if (!existingSenders.includes(track)) {
                            peer.peer.addTrack(track, stream);
                        }
                    // }
                }
            });
            const initiateCall = (async () => {
        
                if (socket && colour === "white") {
                const stream = await startStream();
                // addTracksToPeer(stream);
                    const offer = await peer.getOffer();
                    socket.send(JSON.stringify({ type: OFFER, data: offer }));
                }
            });
            initiateCall();
        }

        return () => {
            // Clean up the message handler when the component unmounts or dependencies change
            socket.onmessage = null;
        };
    }, [socket, started]);
    // }, [socket, started, initiateCall, startStream, addTracksToPeer]);

 


    if(!socket) {return <div>Connecting...</div>}
    
    return <div className="bg-black h-screen">
    <div className="flex justify-center">
        <div className="pt-8 max-w-screen-lg w-full">
            <div className="grid grid-cols-6 gap-4 w-full">
                <div className="col-span-4 w-full flex justify-center">
                    <ChessBoard chess={chess} setBoard={setBoard} socket={socket} board = {board} />
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
                        {started && <Button onclick={()=>{
                           const addTracksToPeer = (async (stream : MediaStream) => {
                            if (peer.peer) {
                                // const existingSenders = peer.peer.getSenders().map(sender => sender.track);
                                for (const track of stream.getTracks()) {
                                //     if (!existingSenders.includes(track)) {
                                        peer.peer.addTrack(track, stream);
                                    }
                                // }
                            }
                            addTracksToPeer(myStream);
                        });
                        }}>Remote Stream</Button>}
                        {/* <Button onclick={addTracks}>Add Tracks</Button> */}
                        {started && myStream && (
                        <video
                            width="200px"
                            height="200px"
                            autoPlay
                            muted
                            ref={(el) => {
                            if (el) el.srcObject = myStream;
                            }}
                        />
                        )}
                        <div>Remote Stream</div>
                        {started && remoteStream && (
                        <video
                            width="300px"
                            height="500px"
                            autoPlay
                            ref={(el) => {
                            if (el) el.srcObject = remoteStream;
                            }}
                        />
                        )}
                        {started && remoteStream && <ReactPlayer url={remoteStream} playing />}

                    </div>
                </div>
            </div>
        </div>
    </div>
    </div>
}