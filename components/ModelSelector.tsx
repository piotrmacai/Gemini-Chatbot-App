
import React from 'react';
import { Model } from '../types';

interface ModelSelectorProps {
  selectedModel: Model;
  onModelChange: (model: Model) => void;
}

const modelOptions = [
  { id: Model.GEMINI_FLASH, name: 'Gemini 2.5 Flash', description: 'Fast and efficient for most tasks.' },
  { id: Model.GEMINI_PRO, name: 'Gemini 2.5 Pro', description: 'Most capable model for complex reasoning.' },
  { id: Model.WEB_SEARCH, name: 'Web Search Agent', description: 'Grounded with Google Search results.' },
  { id: Model.N8N_AGENT, name: 'n8n SEO Agent', description: 'Connects to an n8n workflow for SEO Audits.' },
];

const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModel, onModelChange }) => {
  return (
    <div>
      <select
        value={selectedModel}
        onChange={(e) => onModelChange(e.target.value as Model)}
        className="w-64 p-2 bg-[#2a2b2e] rounded-md text-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
      >
        {modelOptions.map(option => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ModelSelector;