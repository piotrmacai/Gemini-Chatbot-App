
import React from 'react';
import { Source } from '../types';
import { CloseIcon } from './icons/CloseIcon';

interface RightSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sources?: Source[];
}

const RightSidebar: React.FC<RightSidebarProps> = ({ isOpen, onClose, sources }) => {
  return (
    <div
      className={`bg-[#1e1f22] flex flex-col transition-all duration-300 ease-in-out ${
        isOpen ? 'w-full max-w-sm p-4' : 'w-0 p-0'
      } overflow-hidden h-screen border-l border-gray-700`}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-200">Sources</h2>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-700"
          title="Close Sidebar"
        >
          <CloseIcon />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {sources && sources.length > 0 ? (
          <ul className="space-y-3">
            {sources.map((source, index) => (
              <li key={index} className="bg-gray-800 p-3 rounded-lg hover:bg-gray-700">
                <a
                  href={source.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group"
                >
                  <p className="font-semibold text-blue-400 group-hover:underline truncate">{source.title}</p>
                  <p className="text-xs text-gray-400 truncate">{source.uri}</p>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-gray-500 text-center pt-10">
            No sources for this response.
          </div>
        )}
      </div>
    </div>
  );
};

export default RightSidebar;
