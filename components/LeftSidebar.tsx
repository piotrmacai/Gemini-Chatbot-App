
import React from 'react';
import { Chat } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { ProfileIcon } from './icons/ProfileIcon';
import { GearIcon } from './icons/GearIcon';

interface LeftSidebarProps {
  isOpen: boolean;
  chats: Chat[];
  activeChatId: string | null;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onOpenChatSettingsModal: () => void;
  onOpenWebhookSettingsModal: () => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({
  isOpen,
  chats,
  activeChatId,
  onNewChat,
  onSelectChat,
  onOpenChatSettingsModal,
  onOpenWebhookSettingsModal,
}) => {
  return (
    <div
      className={`bg-[#1e1f22] flex flex-col transition-all duration-300 ease-in-out ${
        isOpen ? 'w-full max-w-xs p-4' : 'w-0 p-0'
      } overflow-hidden h-screen`}
    >
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <h2 className="text-xl font-semibold text-gray-200">History</h2>
        <button
          onClick={onNewChat}
          className="p-2 rounded-full hover:bg-gray-700"
          title="New Chat"
        >
          <PlusIcon />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto mb-4">
        {chats.map(chat => (
          <div
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            className={`p-2 my-1 rounded-md cursor-pointer truncate ${
              activeChatId === chat.id ? 'bg-gray-700' : 'hover:bg-gray-800'
            }`}
          >
            {chat.title}
          </div>
        ))}
      </div>

      <div className="border-t border-gray-700 pt-4 flex-shrink-0 space-y-2">
        <button 
          onClick={onOpenChatSettingsModal}
          className="flex items-center space-x-3 w-full p-2 rounded-md hover:bg-gray-800"
          title="Chat Settings"
        >
          <ProfileIcon />
          <span className="text-gray-200">Chat Settings</span>
        </button>
        <button 
          onClick={onOpenWebhookSettingsModal}
          className="flex items-center space-x-3 w-full p-2 rounded-md hover:bg-gray-800"
          title="Webhook Settings"
        >
          <GearIcon />
          <span className="text-gray-200">Webhook Settings</span>
        </button>
      </div>
    </div>
  );
};

export default LeftSidebar;
