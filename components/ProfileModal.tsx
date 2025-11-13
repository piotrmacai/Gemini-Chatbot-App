import React, { useState, useEffect } from 'react';
import { CloseIcon } from './icons/CloseIcon';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  systemPrompt: string;
  n8nWebhookUrl: string;
  onSave: (settings: { systemPrompt: string; n8nWebhookUrl: string }) => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, systemPrompt, n8nWebhookUrl, onSave }) => {
  const [localPrompt, setLocalPrompt] = useState(systemPrompt);
  const [localWebhookUrl, setLocalWebhookUrl] = useState(n8nWebhookUrl);

  useEffect(() => {
    setLocalPrompt(systemPrompt);
    setLocalWebhookUrl(n8nWebhookUrl);
  }, [systemPrompt, n8nWebhookUrl, isOpen]); // Reset when props change or modal opens

  if (!isOpen) {
    return null;
  }

  const handleSave = () => {
    onSave({ systemPrompt: localPrompt, n8nWebhookUrl: localWebhookUrl });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 transition-opacity duration-300" onClick={onClose}>
      <div className="bg-[#1e1f22] rounded-xl shadow-2xl p-6 w-full max-w-lg m-4 transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-100">Profile Settings</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700">
            <CloseIcon />
          </button>
        </div>
        <div className="space-y-6">
          <div>
            <label htmlFor="system-prompt" className="block text-sm font-medium text-gray-300 mb-2">System Prompt</label>
            <textarea
              id="system-prompt"
              value={localPrompt}
              onChange={(e) => setLocalPrompt(e.target.value)}
              placeholder="e.g., You are a helpful assistant that specializes in creative writing."
              className="w-full h-32 p-3 bg-[#2a2b2e] rounded-md text-gray-200 resize-none focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-500"
            />
             <p className="text-xs text-gray-500 mt-2">
                Customize Gemini's personality and instructions for this chat. This will not affect other chats.
            </p>
          </div>
           <div>
            <label htmlFor="n8n-webhook-url" className="block text-sm font-medium text-gray-300 mb-2">n8n Webhook URL</label>
            <input
              id="n8n-webhook-url"
              type="url"
              value={localWebhookUrl}
              onChange={(e) => setLocalWebhookUrl(e.target.value)}
              placeholder="https://your-n8n-instance.com/webhook/..."
              className="w-full p-3 bg-[#2a2b2e] rounded-md text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-500"
            />
            <p className="text-xs text-gray-500 mt-2">
                This URL will be used for the 'n8n Agent' model. This is a global setting.
            </p>
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 rounded-md text-gray-300 hover:bg-gray-700 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors">
            Save
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fade-in-scale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in-scale {
          animation: fade-in-scale 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ProfileModal;