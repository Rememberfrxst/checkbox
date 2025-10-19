import React, { useCallback, useState } from 'react';
import { Button } from './ui/button';
import { DeepThing } from './icons';

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
          // Fallback behavior when sessionStorage not available
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

      const targetModel = newThinkingMode ? 'chat-model-reasoning' : (typeof sessionStorage !== 'undefined' ? (sessionStorage.getItem('previousModel') || 'chat-model') : 'chat-model');
      fetch('/api/preload-model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelId: targetModel }),
      }).catch(() => {});
    },
    [isThinkingMode, selectedModelId, onModelChange, onThinkModeToggle]
  );

  return (
    <Button
      data-testid="think-button"
      className={`rounded-full h-fit border transition-all duration-75 flex items-center gap-1 ${
        isThinkingMode 
          ? 'text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30' // Light blue background with blue text
          : 'bg-transparent'
      }`}
      onClick={handleThinkClick}
      aria-label="Toggle Think Mode"
      variant="outline"
      size="default"
    >
      <DeepThing />
      <span>DeepThink</span>
    </Button>
  );
};

export default ThinkButton;
