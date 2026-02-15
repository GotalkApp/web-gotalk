'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import { User, UserResponse } from '../types';
import { userService } from '../services/userService';
import { CallPopup } from '../components/CallPopup';

interface CallContextType {
  callStatus: 'idle' | 'calling' | 'incoming' | 'connected' | 'ended';
  startCall: (user: User, type: 'video' | 'audio', conversationId: string) => void;
  answerCall: () => void;
  endCall: () => void;
  toggleMute: () => void;
  toggleVideo: () => void;
  isMuted: boolean;
  isVideoOff: boolean;
  callType: 'video' | 'audio';
  partner: User | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
}

const CallContext = createContext<CallContextType | null>(null);

const STUN_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
  ],
};

export const CallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { socket } = useSocket();
  const { user: currentUser } = useAuth();
  
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'incoming' | 'connected' | 'ended'>('idle');
  const [partner, setPartner] = useState<User | null>(null);
  const [callType, setCallType] = useState<'video' | 'audio'>('video');
  const [conversationId, setConversationId] = useState<string | null>(null);
  
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  
  // Refs for WebRTC to avoid closure staleness
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const pendingCandidates = useRef<RTCIceCandidate[]>([]);
  const offerSdpRef = useRef<RTCSessionDescriptionInit | null>(null);

  // Helper to stop all tracks
  const stopMedia = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
      setLocalStream(null);
    }
    setRemoteStream(null);
  }, []);

  const cleanupPeerConnection = useCallback(() => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.ontrack = null;
      peerConnectionRef.current.onicecandidate = null;
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    stopMedia();
    setCallStatus('idle');
    setPartner(null);
    setConversationId(null);
    pendingCandidates.current = [];
    offerSdpRef.current = null;
    setIsMuted(false);
    setIsVideoOff(false);
  }, [stopMedia]);

  const endCall = useCallback(() => {
    if (socket && conversationId && partner) {
      socket.emit('call_hangup', {
        to: partner.id,
        conversation_id: conversationId
      });
    }
    cleanupPeerConnection();
  }, [socket, conversationId, partner, cleanupPeerConnection]);

  // Initialize Media & PC
  const initializePeerConnection = useCallback(async (type: 'video' | 'audio') => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: type === 'video'
      });
      
      setLocalStream(stream);
      localStreamRef.current = stream;

      const pc = new RTCPeerConnection(STUN_SERVERS);
      peerConnectionRef.current = pc;

      // Add local tracks
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      // Handle remote tracks
      pc.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate && socket && partner && conversationId) {
          socket.emit('call_ice_candidate', {
            to: partner.id,
            conversation_id: conversationId,
            candidate: event.candidate
          });
        }
      };

      return pc;
    } catch (err) {
      console.error('Error accessing media devices:', err);
      // alert('Could not access camera/microphone');
      cleanupPeerConnection(); // Fail safe
      return null;
    }
  }, [socket, partner, conversationId, cleanupPeerConnection]);

  // --- Actions ---

  const startCall = useCallback(async (selectedUser: User, type: 'video' | 'audio', convId: string) => {
    setPartner(selectedUser);
    setCallType(type);
    setConversationId(convId);
    setCallStatus('calling');

    // Wait for state updates to reflect in initializePeerConnection via partner/convId refs if needed
    // But we passed dependencies correctly.
    // Actually `initializePeerConnection` depends on `partner` & `conversationId` state which is set asynchronously.
    // Better to pass them directly or use refs.
    // For safety, let's use a small timeout or just rely on the fact we set them.
    // Ideally, we should refactor `initializePeerConnection` to take arguments for partner/convId to avoid stale state.
    
    // Quick fix: Set refs manually if needed, or pass args.
    // Let's modify `initializePeerConnection` logic to use closed-over variables if possible, but it uses `socket.emit` which needs IDs.
    
    // Instead of complex refactoring, I'll pass IDs to `initializePeerConnection` or handling ICE inside the function scope.
    
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: type === 'video'
        });
        
        setLocalStream(stream);
        localStreamRef.current = stream;

        const pc = new RTCPeerConnection(STUN_SERVERS);
        peerConnectionRef.current = pc;

        stream.getTracks().forEach(track => pc.addTrack(track, stream));

        pc.ontrack = (event) => setRemoteStream(event.streams[0]);

        pc.onicecandidate = (event) => {
            if (event.candidate && socket) {
                socket.emit('call_ice_candidate', {
                    to: selectedUser.id,
                    conversation_id: convId,
                    candidate: event.candidate
                });
            }
        };

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        if (socket) {
            socket.emit('call_offer', {
                to: selectedUser.id,
                conversation_id: convId,
                sdp: offer,
                call_type: type
            });
        }
    } catch (err) {
        console.error('Failed to start call:', err);
        setCallStatus('idle');
    }

  }, [socket]);

  const answerCall = useCallback(async () => {
    if (!offerSdpRef.current || !partner || !conversationId) return;

    setCallStatus('connected');

    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: callType === 'video'
        });
        
        setLocalStream(stream);
        localStreamRef.current = stream;

        const pc = new RTCPeerConnection(STUN_SERVERS);
        peerConnectionRef.current = pc;

        stream.getTracks().forEach(track => pc.addTrack(track, stream));

        pc.ontrack = (event) => setRemoteStream(event.streams[0]);

        pc.onicecandidate = (event) => {
            if (event.candidate && socket) {
                socket.emit('call_ice_candidate', {
                    to: partner.id,
                    conversation_id: conversationId,
                    candidate: event.candidate
                });
            }
        };

        await pc.setRemoteDescription(new RTCSessionDescription(offerSdpRef.current));
        
        // Add pending candidates
        while (pendingCandidates.current.length > 0) {
            const candidate = pendingCandidates.current.shift();
            if (candidate) await pc.addIceCandidate(candidate);
        }

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        if (socket) {
            socket.emit('call_answer', {
                to: partner.id,
                conversation_id: conversationId,
                sdp: answer
            });
        }

    } catch (err) {
        console.error('Failed to answer call:', err);
        cleanupPeerConnection();
    }

  }, [callType, partner, conversationId, socket, cleanupPeerConnection]);


  // --- Socket Listeners ---

  useEffect(() => {
    if (!socket || !currentUser) return;

    const unsubscribe = socket.onMessage(async (event: any) => {
        const { type, payload } = event;

        if (type === 'call_offer') {
             // Incoming call
             // payload: { from, conversation_id, sdp, call_type }
             if (callStatus !== 'idle') {
                 // Busy - could emit busy signal or just ignore
                 return;
             }

             try {
                // Fetch caller info
                // We need to map 'from' to a User object.
                // Assuming we might not have it, we try to fetch or use placeholder.
                let caller: User = {
                    id: payload.from,
                    name: 'Guest',
                    avatar: '', // Use placeholder in UI
                    status: 'online'
                };

                try {
                     const userDetails = await userService.getUserById(payload.from);
                     caller = {
                         id: userDetails.id,
                         name: userDetails.name,
                         avatar: userDetails.avatar,
                         status: userDetails.is_online ? 'online' : 'offline',
                         lastSeen: userDetails.last_seen
                     };
                } catch (e) {
                    console.warn('Could not fetch caller details', e);
                }

                setPartner(caller);
                setConversationId(payload.conversation_id);
                setCallType(payload.call_type);
                offerSdpRef.current = payload.sdp;
                setCallStatus('incoming');

             } catch (err) {
                 console.error('Error handling incoming call:', err);
             }

        } else if (type === 'call_answer') {
            // payload: { to, conversation_id, sdp }
            if (callStatus === 'calling' && peerConnectionRef.current) {
                setCallStatus('connected');
                await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(payload.sdp));
            }

        } else if (type === 'call_ice_candidate') {
            // payload: { candidate, ... }
            if (peerConnectionRef.current) {
                if (peerConnectionRef.current.remoteDescription) {
                    await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(payload.candidate));
                } else {
                    pendingCandidates.current.push(new RTCIceCandidate(payload.candidate));
                }
            } else {
                 // Queue if PC not ready (mainly for callee before answer)
                 pendingCandidates.current.push(new RTCIceCandidate(payload.candidate));
            }

        } else if (type === 'call_hangup') {
             cleanupPeerConnection(); // End call
        }
    });

    return () => unsubscribe();
  }, [socket, currentUser, callStatus, cleanupPeerConnection]);

  // Media Controls
  const toggleMute = () => {
      if (localStreamRef.current) {
          localStreamRef.current.getAudioTracks().forEach(track => track.enabled = !track.enabled);
          setIsMuted(prev => !prev);
      }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
        localStreamRef.current.getVideoTracks().forEach(track => track.enabled = !track.enabled);
        setIsVideoOff(prev => !prev);
    }
  };

  return (
    <CallContext.Provider value={{
        callStatus,
        startCall,
        answerCall,
        endCall,
        toggleMute,
        toggleVideo,
        isMuted,
        isVideoOff,
        callType,
        partner,
        localStream,
        remoteStream
    }}>
      {children}
      {callStatus !== 'idle' && partner && (
          <CallPopup 
             user={partner}
             type={callType}
             status={callStatus}
             isMuted={isMuted}
             isVideoOff={isVideoOff}
             localStream={localStream}
             remoteStream={remoteStream}
             onAnswer={answerCall}
             onEnd={endCall}
             onToggleMute={toggleMute}
             onToggleVideo={toggleVideo}
          />
      )}
    </CallContext.Provider>
  );
};

export const useCall = () => {
    const context = useContext(CallContext);
    if (!context) throw new Error('useCall must be used within CallProvider');
    return context;
};
