import React from 'react';
import { Image, Video, FileText, X } from 'lucide-react';

interface AttachmentPickerProps {
  onSelect: (type: 'image' | 'video' | 'file') => void;
  onClose: () => void;
}

export const AttachmentPicker: React.FC<AttachmentPickerProps> = ({ onSelect, onClose }) => {
  const options = [
    { type: 'image' as const, icon: Image, label: 'Ảnh', color: '#0084ff' },
    { type: 'video' as const, icon: Video, label: 'Video', color: '#f02849' },
    { type: 'file' as const, icon: FileText, label: 'Tệp', color: '#31a24c' },
  ];

  return (
    <>
      <div className="attachment-picker-overlay" onClick={onClose}></div>
      <div className="attachment-picker">
        <button className="attachment-picker-close" onClick={onClose}>
          <X size={18} />
        </button>
        <div className="attachment-picker-items">
          {options.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.type}
                className="attachment-picker-item"
                onClick={() => {
                  onSelect(option.type);
                  onClose();
                }}
              >
                <div 
                  className="attachment-picker-icon" 
                  style={{ backgroundColor: option.color }}
                >
                  <Icon size={24} color="white" />
                </div>
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
