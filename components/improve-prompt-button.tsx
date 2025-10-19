
'use client';

import React, { useState, useCallback } from 'react';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ImprovePromptIcon } from './icons';

interface ImprovePromptButtonProps {
  input: string;
  onImprovedPrompt: (improvedText: string) => void;
  status: string;
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
    if (!input || !input.trim()) {
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

  const isDisabled = !input || !input.trim() || status !== 'ready' || isImproving;

  return (
    <Button
      data-testid="improve-prompt-button"
      className={cn(
        "rounded-md p-[7px] h-fit dark:border-zinc-700 hover:dark:bg-[#272727] hover:bg-zinc-200 disabled:opacity-50 transition-all duration-200",
        className
      )}
      onClick={improvePrompt}
      disabled={isDisabled}
      variant="ghost"
      title="Improve prompt grammar and clarity"
    >
      {isImproving ? (
        <Loader2 size={22} className="animate-spin" />
      ) : (
        <ImprovePromptIcon size={22} />
      )}
    </Button>
  );
}

