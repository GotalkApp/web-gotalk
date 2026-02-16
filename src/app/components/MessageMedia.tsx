import React from 'react';
import { Play } from 'lucide-react';
import { MediaAttachment } from './MediaViewer';

interface MessageMediaProps {
  media: MediaAttachment[];
  onClick: (index: number) => void;
}

export const MessageMedia: React.FC<MessageMediaProps> = ({ media, onClick }) => {
  if (media.length === 0) return null;

  // Single media
  if (media.length === 1) {
    const item = media[0];
    return (
      <div className="message-media message-media-single" onClick={() => onClick(0)}>
        {item.type === 'image' ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.url} alt="" />
        ) : (
          <div className="message-media-video">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.thumbnail || item.url} alt="" />
            <div className="message-media-play">
              <Play size={32} fill="white" color="white" />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Two media - side by side
  if (media.length === 2) {
    return (
      <div className="message-media message-media-double">
        {media.map((item, index) => (
          <div key={item.id} className="message-media-item" onClick={() => onClick(index)}>
            {item.type === 'image' ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.url} alt="" />
            ) : (
              <div className="message-media-video">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.thumbnail || item.url} alt="" />
                <div className="message-media-play">
                  <Play size={24} fill="white" color="white" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  // Three or more - stacked creative design
  return (
    <div className="message-media message-media-stack">
      {media.slice(0, 3).map((item, index) => {
        const rotation = index === 0 ? -5 : index === 1 ? 0 : 5;
        const zIndex = media.length - index;
        const translateX = index === 0 ? -8 : index === 1 ? 0 : 8;
        const translateY = index * 4;
        
        return (
          <div
            key={item.id}
            className="message-media-stacked-item"
            style={{
              transform: `rotate(${rotation}deg) translateX(${translateX}px) translateY(${translateY}px)`,
              zIndex,
            }}
            onClick={() => onClick(index)}
          >
            {item.type === 'image' ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.url} alt="" />
            ) : (
              <div className="message-media-video">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.thumbnail || item.url} alt="" />
                <div className="message-media-play">
                  <Play size={20} fill="white" color="white" />
                </div>
              </div>
            )}
            {index === 2 && media.length > 3 && (
              <div className="message-media-more">
                +{media.length - 3}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
