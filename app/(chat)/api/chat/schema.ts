import { z } from 'zod';

const textPartSchema = z.object({
  text: z.string().min(1).max(2000),
  type: z.enum(['text']),
});

export const postRequestBodySchema = z.object({
  id: z.string(),
  message: z.object({
    id: z.string(),
    role: z.literal('user'),
    parts: z.array(z.object({
      type: z.literal('text'),
      text: z.string(), // Removed size limit to handle large inputs
    })),
    experimental_attachments: z.array(z.any()).optional(),
  }),
  selectedChatModel: z.string(),
  selectedVisibilityType: z.enum(['public', 'private']),
});

export type PostRequestBody = z.infer<typeof postRequestBodySchema>;
