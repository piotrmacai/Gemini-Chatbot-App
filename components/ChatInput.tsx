
import React, { useState, useRef } from 'react';
import { ImageFile } from '../types';
import { useSpeechToText } from '../hooks/useSpeechToText';
import { ImageIcon } from './icons/ImageIcon';
import { MicIcon } from './icons/MicIcon';
import { SendIcon } from './icons/SendIcon';

interface ChatInputProps {
  onSendMessage: (prompt: string, image?: ImageFile) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState<ImageFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isListening, toggleListening, hasRecognitionSupport } = useSpeechToText((transcript) => {
    setPrompt(prev => prev + transcript);
  });

  const handleSend = () => {
    if ((prompt.trim() || image) && !isLoading) {
      onSendMessage(prompt, image || undefined);
      setPrompt('');
      setImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage({ file, base64: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
  };

  return (
    <div className="bg-[#1e1f22] rounded-2xl p-2 flex flex-col">
      {image && (
        <div className="p-2 relative w-fit">
          <img src={image.base64} alt="preview" className="h-24 w-auto rounded-lg" />
          <button
            onClick={() => {
                setImage(null);
                if(fileInputRef.current) fileInputRef.current.value = '';
            }}
            className="absolute top-0 right-0 -mt-2 -mr-2 bg-gray-800 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs"
          >
            &times;
          </button>
        </div>
      )}
      <div className="flex items-end">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter a prompt here. Use /generate or /edit with an image..."
          className="flex-1 bg-transparent p-2 text-gray-200 resize-none outline-none placeholder-gray-500"
          rows={1}
        />
        <div className="flex items-center space-x-1 p-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-full hover:bg-gray-700 disabled:opacity-50"
            disabled={isLoading}
            title="Attach Image"
          >
            <ImageIcon />
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/png, image/jpeg" />

          {hasRecognitionSupport && (
            <button
              onClick={toggleListening}
              className={`p-2 rounded-full hover:bg-gray-700 disabled:opacity-50 ${isListening ? 'bg-red-500' : ''}`}
              disabled={isLoading}
              title="Voice Input"
            >
              <MicIcon />
            </button>
          )}

          <button
            onClick={handleSend}
            className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || !(prompt.trim() || image)}
            title="Send Message"
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
