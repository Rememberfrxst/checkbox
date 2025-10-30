'use client';

import React, { useState, useCallback } from 'react';
import { Button } from './ui/button'; // Although we're building custom UI, we might still use 'Button' for its base styles or props if needed, but here we're replacing its visual structure.
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ImprovePromptIcon } from './icons'; // Assuming ImprovePromptIcon is correctly imported

interface ImprovePromptButtonProps {
  input: string;
  onImprovedPrompt: (improvedText: string) => void;
  status: string; // 'ready', 'loading', etc.
  className?: string;
}

export function ImprovePromptButton({
  input,
  onImprovedPrompt,
  status,
  className
}: ImprovePromptButtonProps) {
  const [isImproving, setIsImproving] = useState(false);

  const improvePrompt = useCallback(async () => {
    if (!input.trim()) {
      toast.error('Please enter some text first!');
      return;
    }

    if (status !== 'ready') {
      toast.error('Please wait for the current operation to complete!');
      return;
    }

    setIsImproving(true);
    toast.loading('Improving your prompt...', { id: 'improve-prompt' });

    try {
      const response = await fetch('/api/improve-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: input }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to improve prompt');
      }

      if (data.improved_prompt) {
        onImprovedPrompt(data.improved_prompt);
        toast.success('Prompt improved successfully!', { id: 'improve-prompt' });
      } else {
        throw new Error('No improved prompt received');
      }
    } catch (error: any) {
      console.error('Error improving prompt:', error);
      toast.error(error.message || 'Failed to improve prompt. Please try again.', { id: 'improve-prompt' });
    } finally {
      setIsImproving(false);
    }
  }, [input, onImprovedPrompt, status]);

  const isDisabled = !input.trim() || status !== 'ready' || isImproving;

  return (
    <span className="inline-block" data-state={isImproving ? 'loading' : 'ready'}>
      <div
        className={cn(
          `inline-flex h-9 rounded-full border text-[13px] font-medium text-token-text-secondary border-token-border-default
          hover:bg-token-main-surface-secondary focus-visible:outline-black dark:focus-visible:outline-white
          ${isImproving ? 'bg-blue-50 text-blue-500 dark:text-blue-400 dark:bg-blue-950/30' : ''}
          ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
          `,
          className // External classNames applied to the outer div
        )}
      >
        <button
          data-testid="improve-prompt-button"
          className="flex h-full min-w-8 items-center justify-center p-2"
          aria-label="Improve prompt"
          onClick={improvePrompt}
          disabled={isDisabled}
          title="Improve prompt grammar and clarity"
        >
          {isImproving ? (
            <Loader2 size={22} className="animate-spin" />
          ) : (
            <>
              <ImprovePromptIcon size={20} />
            </>
          )}
        </button>
      </div>
    </span>
  );
}
