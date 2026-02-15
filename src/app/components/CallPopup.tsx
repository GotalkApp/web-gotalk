'use client';

import React, { useEffect, useRef, useState } from 'react';
import { User } from '../types';
import { X, Mic, MicOff, Video, VideoOff, Phone, PhoneIncoming } from 'lucide-react';
import { ringtoneManager } from '../utils/ringtone';

interface CallPopupProps {
  user: User;
  type: 'video' | 'audio';
  status: 'calling' | 'incoming' | 'connected' | 'ended';
  isMuted: boolean;
  isVideoOff: boolean;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  onAnswer: () => void;
  onEnd: () => void;
  onToggleMute: () => void;
  onToggleVideo: () => void;
}

export const CallPopup: React.FC<CallPopupProps> = ({ 
  user, 
  type, 
  status, 
  isMuted, 
  isVideoOff, 
  localStream, 
  remoteStream, 
  onAnswer, 
  onEnd, 
  onToggleMute, 
  onToggleVideo 
}) => {
  const [duration, setDuration] = useState(0);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);

  // Handle Ringtones
  useEffect(() => {
    if (status === 'incoming') {
      try {
        ringtoneManager.playIncoming();
      } catch (e) {
        console.error('Failed to play incoming ringtone', e);
      }
    } else if (status === 'calling') {
      try {
        ringtoneManager.playCalling();
      } catch (e) {
        console.error('Failed to play calling tone', e);
      }
    } else {
      ringtoneManager.stop();
    }

    return () => {
      ringtoneManager.stop();
    };
  }, [status]);

  useEffect(() => {
    if (status === 'connected') {
      const interval = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
        setDuration(0);
    }
  }, [status]);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, type]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
    if (remoteAudioRef.current && remoteStream) {
        remoteAudioRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, type]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isIncoming = status === 'incoming';
  const avatarSrc = user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`;

  return (
    <div className="call-popup-overlay">
      <div className="call-popup">
        <div className="call-video-area">
          {type === 'video' ? (
            <>
              <div className="call-remote-video">
                 {status === 'connected' && remoteStream ? (
                     <video 
                        ref={remoteVideoRef} 
                        autoPlay 
                        playsInline 
                        className="remote-video-element"
                     />
                 ) : (
                    // Show avatar if not connected or no video yet
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarSrc} alt={user.name} className="call-avatar-placeholder" />
                 )}
              </div>
              <div className="call-local-video">
                 {localStream ? (
                     <video 
                        ref={localVideoRef} 
                        autoPlay 
                        playsInline 
                        muted 
                        className="local-video-element"
                     />
                 ) : (
                    <div className="call-local-placeholder">Bạn</div>
                 )}
              </div>
            </>
          ) : (
            <div className="call-audio-view">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={avatarSrc} alt={user.name} className="call-avatar-large" />
              <div className="call-audio-status">
                 {status === 'connected' ? 'Đang trong cuộc gọi' : (isIncoming ? 'Cuộc gọi đến...' : 'Đang gọi...')}
              </div>
              {status === 'connected' && remoteStream && (
                  <audio ref={remoteAudioRef} autoPlay />
              )}
            </div>
          )}
        </div>

        <div className="call-info">
          <h3>{user.name}</h3>
          <p className="call-status">
            {status === 'connected' ? formatDuration(duration) : (isIncoming ? 'Sẵn sàng kết nối' : 'Đang kết nối...')}
          </p>
        </div>

        <div className="call-controls">
           {isIncoming ? (
               <>
                 <button
                    className="call-control-button answer-call"
                    onClick={onAnswer}
                    title="Trả lời"
                    style={{ backgroundColor: '#2ecc71' }}
                 >
                    <PhoneIncoming size={24} />
                 </button>
                 <button
                    className="call-control-button end-call"
                    onClick={onEnd}
                    title="Từ chối"
                 >
                    <Phone size={24} />
                 </button>
               </>
           ) : (
               <>
                  <button
                    className={`call-control-button ${isMuted ? 'active' : ''}`}
                    onClick={onToggleMute}
                    title={isMuted ? 'Bật mic' : 'Tắt mic'}
                  >
                    {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                  </button>

                  {type === 'video' && (
                    <button
                      className={`call-control-button ${isVideoOff ? 'active' : ''}`}
                      onClick={onToggleVideo}
                      title={isVideoOff ? 'Bật camera' : 'Tắt camera'}
                    >
                      {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
                    </button>
                  )}

                  <button
                    className="call-control-button end-call"
                    onClick={onEnd}
                    title="Kết thúc"
                  >
                    <Phone size={24} />
                  </button>
               </>
           )}
        </div>
      </div>
    </div>
  );
};
