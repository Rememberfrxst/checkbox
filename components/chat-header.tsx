'use client';

import { useRouter } from 'next/navigation';
import { useWindowSize } from 'usehooks-ts';
import { ModelSelector } from '@/components/model-selector';
import { SidebarToggle } from '@/components/sidebar-toggle';
import { Button } from '@/components/ui/button';
import { PlusIcon, CheckboxIcon } from './icons';
import { useSidebar } from './ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { type VisibilityType, VisibilitySelector } from './visibility-selector';
import type { Session } from 'next-auth';
import { SignupButton } from './SignupButton';

function PureChatHeader({
  chatId,
  selectedModelId,
  selectedVisibilityType,
  isReadonly,
  session,
  onModelChange, // Ensure this prop is included
}: {
  chatId: string;
  selectedModelId: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
  session: Session;
  onModelChange?: (modelId: string) => void;
}) {
  const router = useRouter();
  const { open } = useSidebar();
  const { width: windowWidth } = useWindowSize();
  const isGuest = !session || (session && session.user?.type === 'guest');

  if (isGuest) {
    return (
      <header className="flex sticky top-0 bg-transparent p-2 items-center">
        <div className="flex items-center px-2.5 gap-3">
          <a href="/" className="inline-flex items-center gap-2 no-underline">
              <CheckboxIcon />
          </a>
        </div>
        <div className="ml-auto flex px-1.5 items-center">
          <SignupButton session={session} />
        </div>
      </header>
    );
  }

  return (
    <header className="flex sticky top-0 bg-transparent py-2 items-center px-2 md:px-2 gap-2">
      <div className="flex items-center gap-2">
  
        {!isReadonly && (
          <ModelSelector
            session={session}
            selectedModelId={selectedModelId}
            onModelChange={onModelChange} // Pass the onModelChange handler
            className="order-1 md:order-2"
            disabled={isGuest}
          />
        )}
        {!isReadonly && (
          <VisibilitySelector
            chatId={chatId}
            selectedVisibilityType={selectedVisibilityType}
            className="order-1 md:order-3"
            // VisibilitySelector doesn't have a disabled prop, so hide interaction when guest
            // We'll add a data attribute to style the button disabled in CSS if needed
            // but we protect interactive handlers by preventing open in parent when guest.
          />
        )}
      </div>
      <div className="ml-auto flex items-center gap-2">
        <SignupButton session={session} />
      </div>
    </header>
  );
}

export const ChatHeader = PureChatHeader;
