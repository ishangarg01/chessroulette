import { useState, useEffect, useCallback, useRef } from "react";
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
    const [myStream, setMyStream] = useState<MediaStream|null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream|null>(null);
    const [recievedOffer, setRecievedOffer] = useState<boolean>(false);


    // const sendStreams = useCallback(async (stream: MediaStream) => {
    //     console.log("trying to send stream 1 ");
    //     if(!stream) return;
    //     console.log("trying to send stream 2");
    //     for (const track of stream.getTracks()) {
    //         peer.peer?.addTrack(track, stream);
    //         console.log("Sending stream");
    //     }
    // }, []);




    // useEffect(() => {
    //     if (myStream && socket) {
    //         sendStreams(myStream);
    //         console.log("Sending stream but is there a stream? :", myStream);
    //         (async () => {
    //             const offer = await peer.getOffer();
    //             console.log("Sending offer from sendOffer():", offer);
    //             socket.send(JSON.stringify({ type: OFFER, data: offer }));
    //         })();
    //     }
    // }, [myStream, sendStreams, socket]);
    
    const sendOffer = useCallback(async () => {
        if (!socket || !peer.peer) return;
        console.log("sendOffer : --------- ");
        const stream = await navigator.mediaDevices.getUserMedia({
            // audio: true,
            video: true,
        });
        setMyStream(stream);
        console.log("sendOffer : started a stream : ", stream);

        for (const track of stream.getTracks()) {
            peer.peer?.addTrack(track, stream);
        }
        peer.peer.getSenders().forEach(sender => {
            const track = sender.track;
            if (track) {
                console.log(`sendOffer : sender track: ${track.kind}, ID: ${track.id}`);
            }
        });

        const offer = await peer.peer.createOffer();
        console.log("sendOffer : createed offer : ", offer);
    
        await peer.peer.setLocalDescription(new RTCSessionDescription(offer));
        console.log("sendOffer : set local description : ", peer.peer.localDescription);
        
        socket.send(JSON.stringify({ type: OFFER, data: offer }));
        console.log("sendOffer : --------- ");
    }, [socket, peer.peer!==null]);

    // useEffect(() => {
    //     if (!myStream || !socket || !recievedOffer) return;
    
    //     const sendAnswer = async () => {
    //         sendStreams(myStream);
    
    //         console.log("Offer received, sending answer:", recievedOffer);
    //         const ans = await peer.getAnswer(recievedOffer);
    //         socket.send(JSON.stringify({ type: ANSWER, data: ans }));
    //     };
    
    //     sendAnswer();
    // }, [myStream, socket, recievedOffer,sendStreams]);
    
    // const handleOffer = async (offer: any) => {
    //     const stream = await navigator.mediaDevices.getUserMedia({
    //         audio: true,
    //         video: true,
    //     });
    //     setMyStream(stream);
    //     // setRecievedOffer(offer);
    // };


    const handleOffer = useCallback(async (offer : RTCSessionDescriptionInit) => {
        if (!socket || !peer.peer) return;

        console.log("handleOffer : --------- ");
        const stream = await navigator.mediaDevices.getUserMedia({
            // audio: true,
            video: true,
        });
        
        console.log("handleOffer : started a stream : ", stream);

        for (const track of stream.getTracks()) {
            peer.peer?.addTrack(track, stream);
        }
        peer.peer.getSenders().forEach(sender => {
            const track = sender.track;
            if (track) {
                console.log(`handleOffer : sender track: ${track.kind}, ID: ${track.id}`);
            }
        });

        await peer.peer.setRemoteDescription(new RTCSessionDescription(offer));
        console.log("handleOffer : set remote description : ", peer.peer.remoteDescription);

        const ans = await peer.peer.createAnswer();
        console.log("handleOffer : createed answer : ", ans);

        await peer.peer.setLocalDescription(new RTCSessionDescription(ans));
        console.log("handleOffer: set local description : ", peer.peer.localDescription);

        socket.send(JSON.stringify({ type: ANSWER, data: ans }));
        console.log("handleOffer : sent answer : ", ans);
        setMyStream(stream);
        console.log("handleOffer : --------- ");
    },[socket, peer.peer!==null]);
    
    const handleAnswer = useCallback(async (ans : RTCSessionDescriptionInit) => {
        peer.peer?.setRemoteDescription(new RTCSessionDescription(ans));
        console.log("Call Accepted!");
        // sendStreams();
    },[]); 

    const handleNegotiationOffer = useCallback(async () => {
        // if(!socket) return;
        // console.log("Negotiation Offer getting sent");
        // const offer = await peer.getOffer();
        // // socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
        // socket.send(JSON.stringify({ type: NEGO_OFFER, data: offer }));

        console.log("Negotiation needed");
    },[socket]);

    // const handleNegotiationAnswer = useCallback(async (offer : RTCSessionDescriptionInit) => {
    //     if(!socket) return;
    //     const ans = await peer.getAnswer(offer);
    //     // socket.emit("peer:nego:done", { to: from, ans });
    //     socket.send(JSON.stringify({ type: NEGO_ANSWER, data: ans }));
    // },[socket]);

    // const handleNegotiationFinal = useCallback(async (ans : RTCSessionDescriptionInit) => {
    //     await peer.setLocalDescription(ans);
    //     // socket?.send(JSON.stringify({ type: ADD_TRACKS }));
    // },[]);

    // const handleAddTracks = useCallback(async () => {
    //     if(!myStream) return;
    //     console.log("hopefully sends tracks from black to white");
    //     for (const track of myStream.getTracks()) {
    //         peer.peer?.addTrack(track, myStream);
    //     }
    // },[myStream]);

    useEffect(() => {
        peer.peer?.addEventListener("negotiationneeded", handleNegotiationOffer);
        return () => {
          peer.peer?.removeEventListener("negotiationneeded", handleNegotiationOffer);
        };
    }, [handleNegotiationOffer]);

    useEffect(() => {
        if (started && colour === "white") {
          sendOffer();
        }
    }, [started]);

    useEffect(() => {
        peer.peer?.addEventListener("track", async (ev) => {
            const [remote] = ev.streams;

            // console.log("track event is triggered? : ", ev.streams[0]);

            // console.log("GOT TRACKS!!");
            // console.log("myStream :" ,myStream);
            // console.log("remote stream",remoteStream);
            const remoteVideoRef = document.querySelector<HTMLVideoElement>('#remote-video');
            if (remoteVideoRef === null) {
                console.error('Remote video element not found');
                return;
            }
            setRemoteStream(remote);
            
            remoteVideoRef.srcObject = remote;
            console.log("remoteStream3: ", remoteVideoRef.srcObject);


            console.log("track event is triggered? : ", remote);
            
            
            // setRemoteStream(ev.streams[0]);
            // const remoteVideoRef = document.querySelector<HTMLVideoElement>('#remote-video');
            // if (remoteVideoRef === null) {
            //     console.error('Remote video element not found');
            //     return;
            // }
            // remoteVideoRef.srcObject = remote[0];
            // remoteVideoRef.play().catch(error => console.error('Error playing remote stream:', error));

        });
      }, []);

    // let remoteVideoRef : HTMLVideoElement | null = null;
    
    // useEffect(() => {
    //     console.log("remoteStream1: ", remoteStream);
    //     // console.log("remoteVideoRef: ", remoteVideoRef);
    //     if (remoteStream) {
    //         const remoteVideoRef = document.querySelector<HTMLVideoElement>('#remote-video');
    //         console.log("remoteStream2: ", remoteStream);
    //         if (remoteVideoRef === null) {
    //             console.error('Remote video element not found');
    //             return;
    //         }
    //         remoteVideoRef.srcObject = remoteStream;
    //         console.log("remoteStream3: ", remoteVideoRef.srcObject);
    //         // remoteVideoRef.play().catch(error => console.error('Error playing remote stream:', error));
    
    //     }
    // }, [remoteStream ]);

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
            // localVideoRef.play().catch(error => console.error('Error playing local stream:', error));
            // localVideoRef.play().catch(error => console.error('Error playing local stream:', error));
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
                case NEGO_OFFER:
                    // handleNegotiationAnswer(message.data);
                    break;
                case NEGO_ANSWER:
                    // handleNegotiationFinal(message.data);
                    break;
                case ADD_TRACKS:
                    // handleAddTracks();
                    break;
            }
        }

        return () => {
            socket.onmessage = null;
        }
    }, [socket]);

    // handleOffer, 
    // handleAnswer, 
    // handleNegotiationOffer, 
    // handleNegotiationAnswer, 
    // handleAddTracks


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
                        {/* {myStream && <Button onclick={()=>{sendStreams(myStream)}}>Send Stream</Button>} */}
                        {/* {<Button onclick={()=>{sendOffer()}}>CALL</Button>} */}
                        {/* {myStream && started && (
                            <>
                            <h1>My Stream</h1>
                            <ReactPlayer
                                playing
                                muted
                                height="100px"
                                width="200px"
                                url={myStream}
                            />
                            </>
                        )} */}
                        {remoteStream && started && (
                            <>
                            <h1>Remote Stream</h1>
                            <ReactPlayer
                                playing
                                muted
                                height="100px"
                                width="200px"
                                url={remoteStream}
                            />
                            </>
                        )}

                        {/* <button onClick={()=>{
                            // setRemoteStream(ev.streams[0]);
                            const remoteVideoRef = document.querySelector<HTMLVideoElement>('#remote-video');
                            if (remoteVideoRef === null) {
                                console.error('Remote video element not found');
                                return;
                            }
                            remoteVideoRef.play().catch(error => console.error('Error playing remote stream:', error));
                            console.log("does it play? : ", remoteVideoRef);
                        }}>Call</button>    */}
                        {/* <h1>My Stream</h1> */}
                        <video id="local-video" autoPlay playsInline controls></video>

                        <video id="remote-video" autoPlay playsInline controls></video>
                    </div>
                </div>
            </div>
        </div>
    </div>
    </div>

}