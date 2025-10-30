import { simulateReadableStream } from 'ai';
import { MockLanguageModelV1 } from 'ai/test';
import { getResponseChunksByPrompt } from '@/tests/prompts/utils';

export const chatModel = new MockLanguageModelV1({
  doGenerate: async () => ({
    rawCall: { rawPrompt: null, rawSettings: {} },
    finishReason: 'stop',
    usage: { promptTokens: 100, completionTokens: 200 },
    text: `Hello! I'm ready to help you with your questions.`,
  }),
  doStream: async ({ prompt }) => ({
    stream: simulateReadableStream({
      chunkDelayInMs: 10, // Reduced from 1000ms
      initialDelayInMs: 50, // Reduced from 10000ms
      chunks: getResponseChunksByPrompt(prompt),
    }),
    rawCall: { rawPrompt: null, rawSettings: {} },
  }),
});

export const reasoningModel = new MockLanguageModelV1({
  doGenerate: async () => ({
    rawCall: { rawPrompt: null, rawSettings: {} },
    finishReason: 'stop',
    usage: { promptTokens: 150, completionTokens: 300 },
    text: `<think>Let me think about this...</think>\n\nHello! I'm ready to help you with reasoning tasks.`,
  }),
  doStream: async ({ prompt }) => ({
    stream: simulateReadableStream({
      chunkDelayInMs: 3, // Ultra-fast reasoning streaming
      initialDelayInMs: 5, // Near-instant reasoning start
      chunks: getResponseChunksByPrompt(prompt, true),
    }),
    rawCall: { rawPrompt: null, rawSettings: {} },
  }),
});

export const titleModel = new MockLanguageModelV1({
  doGenerate: async () => ({
    rawCall: { rawPrompt: null, rawSettings: {} },
    finishReason: 'stop',
    usage: { promptTokens: 50, completionTokens: 10 },
    text: `New Chat`,
  }),
  doStream: async () => ({
    stream: simulateReadableStream({
      chunkDelayInMs: 20, // Reduced from 1000ms
      initialDelayInMs: 30, // Reduced from 10000ms
      chunks: [
        { type: 'text-delta', textDelta: 'New Chat' },
        {
          type: 'finish',
          finishReason: 'stop',
          logprobs: undefined,
          usage: { completionTokens: 10, promptTokens: 50 },
        },
      ],
    }),
    rawCall: { rawPrompt: null, rawSettings: {} },
  }),
});

export const artifactModel = new MockLanguageModelV1({
  doGenerate: async () => ({
    rawCall: { rawPrompt: null, rawSettings: {} },
    finishReason: 'stop',
    usage: { promptTokens: 200, completionTokens: 500 },
    text: `Document content generated successfully.`,
  }),
  doStream: async ({ prompt }) => ({
    stream: simulateReadableStream({
      chunkDelayInMs: 25, // Reduced from 1000ms
      initialDelayInMs: 75, // Reduced from 10000ms
      chunks: getResponseChunksByPrompt(prompt),
    }),
    rawCall: { rawPrompt: null, rawSettings: {} },
  }),
});

export const chatModel1 = new MockLanguageModelV1({
  doGenerate: async () => ({
    rawCall: { rawPrompt: null, rawSettings: {} },
    finishReason: 'stop',
    usage: { promptTokens: 100, completionTokens: 200 },
    text: `Hello from LLaMA-4 Maverick! How can I assist you today?`,
  }),
  doStream: async ({ prompt }) => ({
    stream: simulateReadableStream({
      chunkDelayInMs: 2, // Ultra-fast streaming
      initialDelayInMs: 5, // Instant start
      chunks: getResponseChunksByPrompt(prompt),
    }),
    rawCall: { rawPrompt: null, rawSettings: {} },
  }),
});

export const chatModel2 = new MockLanguageModelV1({
  doGenerate: async () => ({
    rawCall: { rawPrompt: null, rawSettings: {} },
    finishReason: 'stop',
    usage: { promptTokens: 80, completionTokens: 150 },
    text: `Greetings from Mistral SABA! Ready to help you.`,
  }),
  doStream: async ({ prompt }) => ({
    stream: simulateReadableStream({
      chunkDelayInMs: 3, // Ultra-fast streaming
      initialDelayInMs: 8, // Near-instant start
      chunks: getResponseChunksByPrompt(prompt),
    }),
    rawCall: { rawPrompt: null, rawSettings: {} },
  }),
});

export const chatModel3 = new MockLanguageModelV1({
  doGenerate: async () => ({
    rawCall: { rawPrompt: null, rawSettings: {} },
    finishReason: 'stop',
    usage: { promptTokens: 250, completionTokens: 400 },
    text: `<think>Processing with advanced reasoning...</think>\n\nHello from Qwen 3! I'm ready for complex reasoning tasks.`,
  }),
  doStream: async ({ prompt }) => ({
    stream: simulateReadableStream({
      chunkDelayInMs: 5, // Ultra-fast like production
      initialDelayInMs: 10, // Instant start
      chunks: getResponseChunksByPrompt(prompt),
    }),
    rawCall: { rawPrompt: null, rawSettings: {} },
  }),
});
