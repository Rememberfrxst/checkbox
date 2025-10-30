import type { ComponentProps } from 'react';

import { type SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { SidebarLeftIcon } from './icons';
import { Button } from './ui/button';

export function SidebarToggle({
  className,
  disabled,
}: ComponentProps<typeof SidebarTrigger> & { disabled?: boolean }) {
  const { toggleSidebar } = useSidebar();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          data-testid="sidebar-toggle-button"
          onClick={!disabled ? toggleSidebar : undefined}
          variant="outline"
          disabled={disabled}
          className={`md:px-2 md:h-fit bg-transparent ${
            disabled ? 'cursor-not-allowed' : 'cursor-w-resize'
          }`}
        >
          <SidebarLeftIcon size={20} />
        </Button>
      </TooltipTrigger>
    </Tooltip>
  );
}
