import React, { memo, useCallback,  } from 'react';
import { cn } from '@/lib/utils';
import { WebIcon } from './icons';

interface WebSearchButtonProps {
  onClick: () => void;
  isGenerating?: boolean;
  status: string;
  isActive?: boolean;
}

function PureWebSearchButton({ onClick, isGenerating, status, isActive }: WebSearchButtonProps) {
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isGenerating && status === 'ready') {
        onClick();
      }
    },
    [onClick, isGenerating, status],
  );

  return (
    <span className="inline-block" data-state={isActive ? 'open' : 'closed'}>
      <div
        className={cn(
          "inline-flex h-9 rounded-full border text-[13px] font-semibold text-token-text-secondary border-token-border-default focus-visible:outline-black dark:focus-visible:outline-white",
          {
            "radix-state-open:bg-black/10 bg-blue-50 text-blue-600 dark:text-blue-400 shadow-sm": isActive,
            "hover:bg-token-main-surface-secondary": !isActive,
            "opacity-50 pointer-events-none": isGenerating || status !== 'ready',
          }
        )}
      >
        <button
          className="flex h-full min-w-8 items-center justify-center p-2"
          data-testid="composer-button-search"
          aria-pressed={isActive ? 'true' : 'false'}
          aria-label="Search"
          onClick={handleClick}
          disabled={isGenerating || status !== 'ready'}
        >
          <WebIcon />
          <span style={{ width: 'fit-content', opacity: 1, transform: 'none' }}>
            <div className="ps-1 pe-1 font-semibold whitespace-nowrap [[data-collapse-labels]_&]:sr-only">Search</div>
          </span>
        </button>
      </div>
    </span>
  );
}

export const WebSearchButton = memo(PureWebSearchButton);
