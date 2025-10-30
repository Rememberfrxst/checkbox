import React, { useCallback, useState } from 'react';
import { Button } from './ui/button';
import type { UIMessage } from 'ai';
import { DeepThink2 } from './icons';

interface ThinkButtonProps {
  selectedModelId: string;
  onModelChange: (modelId: string) => void;
  onThinkModeToggle?: (isThinking: boolean) => void;
}

const ThinkButton: React.FC<ThinkButtonProps> = ({ 
  selectedModelId, 
  onModelChange, 
  onThinkModeToggle 
}) => {
  const [isThinkingMode, setIsThinkingMode] = useState(() => {
    if (typeof window !== 'undefined' && typeof sessionStorage !== 'undefined') {
      try {
        return sessionStorage.getItem('thinkingMode') === 'true';
      } catch (e) {
        console.warn('sessionStorage read failed in ThinkButton init', e);
        return false;
      }
    }
    return false;
  });

  const handleThinkClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      
      const newThinkingMode = !isThinkingMode;
      setIsThinkingMode(newThinkingMode);
      
      requestAnimationFrame(() => {
        if (typeof window !== 'undefined' && typeof sessionStorage !== 'undefined') {
          try {
            if (newThinkingMode) {
              sessionStorage.setItem('previousModel', selectedModelId);
              sessionStorage.setItem('thinkingMode', 'true');
              onModelChange('chat-model-reasoning');
            } else {
              const previousModel = sessionStorage.getItem('previousModel') || 'chat-model';
              sessionStorage.removeItem('thinkingMode');
              sessionStorage.removeItem('previousModel');
              onModelChange(previousModel);
            }
          } catch (e) {
            console.warn('sessionStorage write/read failed in ThinkButton:', e);
          }
        } else {
          if (newThinkingMode) {
            onModelChange('chat-model-reasoning');
          } else {
            onModelChange(selectedModelId || 'chat-model');
          }
        }

        if (onThinkModeToggle) {
          onThinkModeToggle(newThinkingMode);
        }
      });

      const targetModel = newThinkingMode
        ? 'chat-model-reasoning'
        : (typeof sessionStorage !== 'undefined'
            ? sessionStorage.getItem('previousModel') || 'chat-model'
            : 'chat-model');

      fetch('/api/preload-model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelId: targetModel }),
      }).catch(() => {});
    },
    [isThinkingMode, selectedModelId, onModelChange, onThinkModeToggle]
  );

  return (
    <span className="inline-block" data-state={isThinkingMode ? 'open' : 'closed'}>
      <div
        className={`inline-flex h-9 rounded-full border text-[13px] font-medium text-token-text-secondary border-token-border-default
          hover:bg-token-main-surface-secondary focus-visible:outline-black dark:focus-visible:outline-white
          ${isThinkingMode ? 'radix-state-open:bg-black/10 bg-blue-50 text-blue-500 dark:text-blue-400 dark:bg-blue-950/30' : ''}
        `}
      >
        <button
          data-testid="think-button"
          className="flex h-full min-w-8 items-center justify-center p-2"
          aria-label="Think"
          aria-pressed={isThinkingMode}
          onClick={handleThinkClick}
        >
          <DeepThink2 />
          <span style={{ width: 'fit-content', opacity: 1, transform: 'none' }}>
            <div className="ps-1 pe-1 font-semibold whitespace-nowrap [[data-collapse-labels]_&]:sr-only">
              Think
            </div>
          </span>
        </button>
      </div>
    </span>
  );
};

export default ThinkButton;
 
