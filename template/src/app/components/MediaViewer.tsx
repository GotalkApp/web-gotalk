import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { MediaAttachment } from '../types';

interface MediaViewerProps {
  media: MediaAttachment[];
  initialIndex: number;
  onClose: () => void;
}

export const MediaViewer: React.FC<MediaViewerProps> = ({ media, initialIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const currentMedia = media[currentIndex];

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : media.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < media.length - 1 ? prev + 1 : 0));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrevious();
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'Escape') onClose();
  };

  return (
    <div 
      className="media-viewer-overlay" 
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="media-viewer-container" onClick={(e) => e.stopPropagation()}>
        <button className="media-viewer-close" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="media-viewer-header">
          <span className="media-viewer-counter">
            {currentIndex + 1} / {media.length}
          </span>
          <button className="media-viewer-download" title="Tải xuống">
            <Download size={20} />
          </button>
        </div>

        <div className="media-viewer-content">
          {media.length > 1 && (
            <button className="media-viewer-nav media-viewer-prev" onClick={handlePrevious}>
              <ChevronLeft size={32} />
            </button>
          )}

          <div className="media-viewer-main">
            {currentMedia.type === 'image' ? (
              <img src={currentMedia.url} alt="" />
            ) : (
              <video controls autoPlay>
                <source src={currentMedia.url} type="video/mp4" />
              </video>
            )}
          </div>

          {media.length > 1 && (
            <button className="media-viewer-nav media-viewer-next" onClick={handleNext}>
              <ChevronRight size={32} />
            </button>
          )}
        </div>

        {media.length > 1 && (
          <div className="media-viewer-thumbnails">
            {media.map((item, index) => (
              <button
                key={item.id}
                className={`media-thumbnail ${index === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(index)}
              >
                <img src={item.thumbnail || item.url} alt="" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
