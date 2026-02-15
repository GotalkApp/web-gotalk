'use client';

import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { X, Mic, MicOff, Video, VideoOff, Phone } from 'lucide-react';

interface CallPopupProps {
  user: User;
  type: 'video' | 'audio';
  onClose: () => void;
}

export const CallPopup: React.FC<CallPopupProps> = ({ user, type, onClose }) => {
  const [status, setStatus] = useState<'calling' | 'connected'>('calling');
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  useEffect(() => {
    // Simulate call connecting after 2 seconds
    const connectTimer = setTimeout(() => {
      setStatus('connected');
    }, 2000);

    return () => clearTimeout(connectTimer);
  }, []);

  useEffect(() => {
    if (status === 'connected') {
      const interval = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [status]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    onClose();
  };

  return (
    <div className="call-popup-overlay">
      <div className="call-popup">
        <div className="call-video-area">
          {type === 'video' && (
            <>
              <div className="call-remote-video">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={user.avatar} alt={user.name} />
              </div>
              <div className="call-local-video">
                <div className="call-local-placeholder">Bạn</div>
              </div>
            </>
          )}
          {type === 'audio' && (
            <div className="call-audio-view">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={user.avatar} alt={user.name} className="call-avatar-large" />
            </div>
          )}
        </div>

        <div className="call-info">
          <h3>{user.name}</h3>
          <p className="call-status">
            {status === 'calling' ? 'Đang gọi...' : formatDuration(duration)}
          </p>
        </div>

        <div className="call-controls">
          <button
            className="call-control-button"
            onClick={() => setIsMuted(!isMuted)}
            title={isMuted ? 'Bật mic' : 'Tắt mic'}
          >
            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
          </button>

          {type === 'video' && (
            <button
              className="call-control-button"
              onClick={() => setIsVideoOff(!isVideoOff)}
              title={isVideoOff ? 'Bật camera' : 'Tắt camera'}
            >
              {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
            </button>
          )}

          <button
            className="call-control-button end-call"
            onClick={handleEndCall}
            title="Kết thúc cuộc gọi"
          >
            <Phone size={24} />
          </button>
        </div>

        <button className="call-close-button" onClick={handleEndCall}>
          <X size={24} />
        </button>
      </div>
    </div>
  );
};
