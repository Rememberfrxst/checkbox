'use client';

import { Chat } from '@/components/chat';
import type { Session } from 'next-auth';
import type { UIMessage } from 'ai';

interface ChatWrapperProps {
  id: string;
  initialMessages: UIMessage[];
  initialChatModel: string;
  initialVisibilityType: 'private' | 'public';
  isReadonly: boolean;
  session: Session;
  autoResume: boolean;
}

export function ChatWrapper(props: ChatWrapperProps) {
  return (
    <Chat
      {...props}
    />
  );
}
