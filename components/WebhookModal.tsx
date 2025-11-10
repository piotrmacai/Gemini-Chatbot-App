
import React, { useState, useEffect } from 'react';
import { CloseIcon } from './icons/CloseIcon';

interface WebhookModalProps {
  isOpen: boolean;
  onClose: () => void;
  n8nWebhookUrl: string;
  onSave: (url: string) => void;
}

const WebhookModal: React.FC<WebhookModalProps> = ({ isOpen, onClose, n8nWebhookUrl, onSave }) => {
  const [localWebhookUrl, setLocalWebhookUrl] = useState(n8nWebhookUrl);

  useEffect(() => {
    setLocalWebhookUrl(n8nWebhookUrl);
  }, [n8nWebhookUrl, isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSave = () => {
    onSave(localWebhookUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 transition-opacity duration-300" onClick={onClose}>
      <div className="bg-[#1e1f22] rounded-xl shadow-2xl p-6 w-full max-w-2xl m-4 transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-100">Webhook Settings</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700">
            <CloseIcon />
          </button>
        </div>
        <div className="space-y-8">
            <div>
                <h3 className="text-lg font-semibold text-gray-200 mb-3 border-b border-gray-700 pb-2">Global Settings</h3>
                <div className="mt-4">
                    <label htmlFor="n8n-webhook-url" className="block text-sm font-medium text-gray-300 mb-2">n8n SEO Agent Webhook URL</label>
                    <input
                        id="n8n-webhook-url"
                        type="url"
                        value={localWebhookUrl}
                        onChange={(e) => setLocalWebhookUrl(e.target.value)}
                        placeholder="Enter webhook URL for the n8n agent..."
                        className="w-full p-3 bg-[#2a2b2e] rounded-md text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-500"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                        This URL is used by the 'n8n SEO Agent' model to connect to your n8n workflow.
                    </p>
                </div>
            </div>
        </div>
        <div className="mt-8 flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 rounded-md text-gray-300 hover:bg-gray-700 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors">
            Save Settings
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

export default WebhookModal;
