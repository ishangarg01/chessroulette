class PeerService {
    peer: RTCPeerConnection | null = null;
    socket: WebSocket | null = null;

    constructor(socket: WebSocket | null) {
        this.socket = socket;
        if (!this.peer) {
            this.peer = new RTCPeerConnection({
                iceServers: [{
                    urls: ['stun:stun.l.google.com:19302', 'stun:global.stun.twilio.com:3478'],
                    // urls: ['stun:stun.l.google.com:19302'],
                }],
            });
        

            this.peer.addEventListener('icecandidate', event => {
                if(!socket) return;
                if (event.candidate) {
                    console.log('New ICE candidate:', event.candidate);
                    // console.log('print local description on getting new ice candidate : ', this.peer?.localDescription);
                    // Send the ICE candidate to the remote peer via WebSocket
                    socket.send(JSON.stringify({ type: 'ice_candidate', candidate: event.candidate }));
                }
            });
        
        }
    }
}

export default PeerService;
