import React from 'react';
import { Chat, ImageFile } from '../types';
import ChatInput from './ChatInput';
import Message from './Message';
import { BotIcon } from './icons/BotIcon';

interface ChatViewProps {
  chat: Chat | undefined;
  onSendMessage: (prompt: string, image?: ImageFile) => void;
  onDeleteMessage: (messageId: string) => void;
  isLoading: boolean;
}

const ChatView: React.FC<ChatViewProps> = ({
  chat,
  onSendMessage,
  onDeleteMessage,
  isLoading,
}) => {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages, isLoading]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {chat && chat.messages.length > 0 ? (
          <div className="space-y-6">
            {chat.messages.map(msg => (
              <Message key={msg.id} message={msg} onDelete={() => onDeleteMessage(msg.id)} />
            ))}
            {isLoading && (
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-gray-700 rounded-full">
                  <BotIcon />
                </div>
                <div className="flex items-center space-x-2 pt-2">
                   <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                   <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-200"></div>
                   <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-400"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
            <h1 className="text-4xl font-bold text-gray-200 mb-2">Hello!</h1>
            <p className="text-lg">How can I help you today?</p>
          </div>
        )}
      </div>
      <div className="p-4 md:p-6 bg-transparent border-t border-gray-800">
        <div className="max-w-4xl mx-auto">
          <ChatInput onSendMessage={onSendMessage} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default ChatView;