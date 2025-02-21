import React from 'react';

interface QuickPromptsProps {
  onPromptClick: (prompt: string) => void;
}

const DEFAULT_PROMPTS = [
  "Explain the color grade in detail",
  "Is this diamond eye-clean?",
  "What's a fair price for this diamond?",
  "Compare to average diamonds of this size"
];

const QuickPrompts: React.FC<QuickPromptsProps> = ({ onPromptClick }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <h3 className="text-lg font-semibold mb-4">Quick Questions</h3>
      <div className="flex flex-col space-y-3">
        {DEFAULT_PROMPTS.map((prompt, index) => (
          <button
            key={index}
            onClick={() => onPromptClick(prompt)}
            className="text-left px-4 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 
                     transition-colors duration-200 text-sm text-gray-700 
                     hover:text-gray-900 border border-gray-200"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickPrompts; 