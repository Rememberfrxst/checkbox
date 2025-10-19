import React, { memo, useCallback } from 'react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

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
    <Button
      data-testid="web-search-button"
      className={cn(
        "flex items-center gap-1 rounded-full border px-1.5 py-1.5 h-fit text-sm transition-all duration-200",
        {
          // Active state - light background with subtle glow
          "bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 shadow-sm": isActive,
          // Default state
          "dark:border-zinc-700 hover:dark:bg-[#272727] hover:bg-zinc-200 disabled:opacity-50": !isActive,
        }
      )}
      onClick={handleClick}
      disabled={isGenerating || status !== 'ready'}
      variant="ghost"
    >
<svg
  width="18"
  height="18"
  viewBox="0 0 14 14"
  fill="currentColor"
  xmlns="http://www.w3.org/2000/svg"
  className={cn("icon transition-colors", {
    "text-blue-600 dark:text-blue-400": isActive,
    "": !isActive,
  })}
  aria-label="Your Icon Label"
>
  <path fillRule="evenodd" clipRule="evenodd" d="M7.00003 0.150452C10.7832 0.150452 13.8496 3.21691 13.8496 7.00006C13.8496 10.7832 10.7832 13.8497 7.00003 13.8497C3.21688 13.8497 0.150421 10.7832 0.150421 7.00006C0.150421 3.21691 3.21688 0.150452 7.00003 0.150452ZM5.37796 7.59967C5.4267 9.0321 5.64754 10.2966 5.97366 11.2198C6.15996 11.7471 6.36946 12.1302 6.57327 12.3702C6.77751 12.6106 6.92343 12.6505 7.00003 12.6505C7.07663 12.6505 7.22255 12.6106 7.42679 12.3702C7.6306 12.1302 7.8401 11.7471 8.0264 11.2198C8.35252 10.2966 8.57336 9.0321 8.6221 7.59967H5.37796ZM1.38187 7.59967C1.61456 9.80498 3.11593 11.6305 5.14261 12.336C5.03268 12.1129 4.93227 11.8725 4.8428 11.6192C4.46342 10.5452 4.22775 9.13994 4.17874 7.59967H1.38187ZM9.82132 7.59967C9.77232 9.13994 9.53664 10.5452 9.15726 11.6192C9.06774 11.8726 8.96648 12.1127 8.85648 12.336C10.8836 11.6307 12.3855 9.8053 12.6182 7.59967H9.82132ZM7.00003 1.34967C6.92343 1.34967 6.77751 1.38955 6.57327 1.62994C6.36946 1.86994 6.15996 2.25297 5.97366 2.78033C5.64754 3.70357 5.4267 4.96802 5.37796 6.40045H8.6221C8.57336 4.96802 8.35252 3.70357 8.0264 2.78033C7.8401 2.25297 7.6306 1.86994 7.42679 1.62994C7.22255 1.38955 7.07663 1.34967 7.00003 1.34967ZM8.85648 1.66315C8.96663 1.88662 9.06763 2.12721 9.15726 2.38092C9.53664 3.45494 9.77232 4.86018 9.82132 6.40045H12.6182C12.3855 4.19471 10.8837 2.36834 8.85648 1.66315ZM5.14261 1.66315C3.11578 2.36856 1.61457 4.19503 1.38187 6.40045H4.17874C4.22775 4.86018 4.46342 3.45494 4.8428 2.38092C4.93237 2.12736 5.03253 1.88651 5.14261 1.66315Z"></path>
</svg>
      <span>Search</span>
    </Button>
  );
}

export const WebSearchButton = memo(PureWebSearchButton);
