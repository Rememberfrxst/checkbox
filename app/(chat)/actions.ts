'use server';

import { generateText, type UIMessage } from 'ai';
import { cookies } from 'next/headers';
import {
  deleteMessagesByChatIdAfterTimestamp,
  getMessageById,
  updateChatVisiblityById,
} from '@/lib/db/queries';
import type { VisibilityType } from '@/components/visibility-selector';
import { myProvider } from '@/lib/ai/providers';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';

export async function saveChatModelAsCookie(model: string) {
  const cookieStore = await cookies();
  cookieStore.set('chat-model', model);
}

export async function getChatModelFromCookie() {
  const cookieStore = await cookies();
  return cookieStore.get('chat-model')?.value || DEFAULT_CHAT_MODEL;
}

export async function generateTitleFromUserMessage({
  message,
}: {
  message: UIMessage;
}) {
  // Extract text content from the message
  const userContent = message.parts
    ?.filter(part => part.type === 'text')
    .map(part => part.text)
    .join(' ') || '';

  if (!userContent.trim()) {
    return 'New Chat';
  }

  // Truncate content if too long
  // Use full content without truncation
  try {
    const { text: title } = await generateText({
      model: myProvider.languageModel('title-model'),
      system: `You generate descriptive titles for chat messages. Requirements:
      - Use full descriptive titles without truncation
      - Maintain the complete context and meaning
      - No quotes or colons
      - Be specific and clear
      - If query is a question, preserve it as is`,
      messages: [
        {
          role: 'user',
          content: userContent,
        },
      ],
      maxTokens: 6,
      temperature: 0.3,
    });

    // Clean up the title
    const cleanTitle = title
      .trim()
      .replace(/^["']|["']$/g, '') // Remove quotes
      .replace(/\.$/, ''); // Remove trailing period

    return cleanTitle || 'New Chat';
  } catch (error) {
    console.error('Failed to generate title:', error);
    
    // Fallback: Create a simple title from the first few words
    const words = userContent.split(' ').slice(0, 6);
    return words.length > 0 ? words.join(' ') : 'New Chat';
  }
}

export async function deleteTrailingMessages({ id }: { id: string }) {
  const [message] = await getMessageById({ id });

  await deleteMessagesByChatIdAfterTimestamp({
    chatId: message.chatId,
    timestamp: message.createdAt,
  });
}

export async function updateChatVisibility({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: VisibilityType;
}) {
  await updateChatVisiblityById({ chatId, visibility });
}
