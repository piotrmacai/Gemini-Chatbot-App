import React from 'react';
import { Message, Role } from '../types';
import { UserIcon } from './icons/UserIcon';
import { BotIcon } from './icons/BotIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { TrashIcon } from './icons/TrashIcon';

interface MessageProps {
  message: Message;
  onDelete: () => void;
}

const MessageComponent: React.FC<MessageProps> = ({ message, onDelete }) => {
  const isUser = message.role === Role.USER;

  const renderContent = () => {
    return (
      <div className="prose prose-invert max-w-none prose-p:my-2 prose-headings:my-3">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {message.text}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <div className={`group flex items-start space-x-4`}>
      <div className={`p-2 rounded-full ${isUser ? 'bg-blue-600' : 'bg-gray-700'}`}>
        {isUser ? <UserIcon /> : <SparklesIcon />}
      </div>
      <div className="flex-1 pt-1">
        <div className="flex items-center justify-between">
            <p className="font-bold text-gray-200 mb-2">{isUser ? 'You' : 'Gemini'}</p>
            <button 
                onClick={onDelete} 
                className="p-1 rounded-full hover:bg-gray-700 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Delete message"
            >
                <TrashIcon />
            </button>
        </div>
        {message.image && (
          <div className="mb-2">
            <img src={message.image} alt="User upload" className="max-w-xs rounded-lg" />
          </div>
        )}
        <div className="text-gray-300 space-y-4">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default MessageComponent;