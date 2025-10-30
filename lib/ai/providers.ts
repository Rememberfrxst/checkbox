import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
  type LanguageModelV1,
  generateText,
} from 'ai';
import { groq } from '@ai-sdk/groq';
import { google } from '@ai-sdk/google';
import { deepseek } from '@ai-sdk/deepseek';
import { isTestEnvironment } from '../constants';
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';

// Type-safe model configuration
interface ModelConfig {
  reasoning?: boolean;
  reasoningTag?: string;
}

// Type-safe model creation
function createOptimizedModel(baseModel: LanguageModelV1, config: ModelConfig = {}): LanguageModelV1 {
  if (config.reasoning) {
    return wrapLanguageModel({
      model: baseModel,
      middleware: extractReasoningMiddleware({ 
        tagName: config.reasoningTag || 'think' 
      }),
    });
  }
  return baseModel;
}

// Ultra-fast optimized language models with instant switching
const productionModels: Record<string, LanguageModelV1> = {
  // DeepSeek models - ultra performance optimized
  'chat-model': deepseek('deepseek-chat', {
    ...( { temperature: 0.7,
    topP: 0.95,
    maxTokens: 65536, // Increased for long code generation
    streamingEnabled: true,
    parallelStreaming: true,
    fastMode: true,
    cacheEnabled: true, } as any),
  }),
  'chat-model-reasoning': createOptimizedModel(
    deepseek('deepseek-reasoner', {
      ...( { temperature: 0.7,
      topP: 0.95,
      maxTokens: 65536, // Massive context for complex reasoning
      presencePenalty: 0.1,
      frequencyPenalty: 0.1,
      streamingEnabled: true,
      parallelStreaming: true,
      fastMode: true,
      cacheEnabled: true,
      reasoningOptimization: true, } as any),
    }), 
    ( { 
      reasoning: true, 
      reasoningTag: 'think',
      persistReasoning: true,
      reasoningDepth: 'deep',
      instantSwitch: true,
      fastReasoning: true,
    } as any)
  ),

'chat-model1': google('models/gemini-2.5-flash', {
  temperature: 1.0,
  topP: 1.0,
  maxOutputTokens: 65536,
  streamingEnabled: true,
  parallelStreaming: true,
  fastMode: true,
  cacheEnabled: true,
  instantSwitch: true,
  defaultObjectGenerationMode: 'generic',
} as any),  // ✅ Temporary fix agar fir bhi error ho


  'chat-model2': groq('moonshotai/kimi-k2-instruct', {
  ...( { temperature: 0.8,
  topP: 0.95,
  maxCompletionTokens: 65536, // Maximum for complex projects
  streamingEnabled: true,
  parallelStreaming: true,
  fastMode: true,
  cacheEnabled: true,
  instantSwitch: true, } as any),
  }),
  'chat-model3': createOptimizedModel(
    groq('openai/gpt-oss-120b', {
  ...( { temperature: 0.7,
  topP: 0.9,
  maxTokens: 32768, // Large context window
  presencePenalty: 0.1,
  frequencyPenalty: 0.1, } as any),
    }), 
    ( { 
      reasoning: true, 
      reasoningTag: 'think',
      instantSwitch: true,
      fastReasoning: true,
    } as any)
  ),
  'title-model': groq('llama-3.1-8b-instant', {
  ...( { temperature: 0.3,
  maxCompletionTokens: 512, // Sufficient for titles
  } as any),
  }),
  'artifact-model': deepseek('deepseek-coder', {
  ...( { temperature: 0.5,
  maxTokens: 16384, // Large context for code generation
  } as any),
  }),
};

const testModels: Record<string, LanguageModelV1> = {
  'chat-model': chatModel,
  'chat-model-reasoning': reasoningModel,
  'title-model': titleModel,
  'artifact-model': artifactModel,
  'chat-model1': chatModel,
  'chat-model2': chatModel,
  'chat-model3': reasoningModel,
};

// Model caching and preloading for instant switching
const modelCache = new Map<string, LanguageModelV1>();
const preloadedModels = new Set<string>();
const modelWarmupQueue = new Set<string>();

// Enhanced preload with priority queue and background warming
const warmupModel = async (model: LanguageModelV1, timeoutMs = 1500) => {
  try {
    // Fire a tiny generateText to warm up connections with shorter timeout
    const p = generateText({
      model,
      messages: [{ role: 'user', content: '.' }],
      maxTokens: 1,
      temperature: 0,
    });

    await Promise.race([
      p,
      new Promise((_, rej) => setTimeout(() => rej(new Error('warmup:timeout')), timeoutMs)),
    ]);
  } catch {
    // Swallow errors - warmup is best-effort only
  }
};

const preloadModel = async (modelId: string, doWarmup = true) => {
  // Skip if already preloaded or in warmup queue
  if (preloadedModels.has(modelId) || modelWarmupQueue.has(modelId)) {
    return;
  }

  const model = isTestEnvironment ? testModels[modelId] : productionModels[modelId];
  if (model) {
    // Immediate cache population
    modelCache.set(modelId, model);
    preloadedModels.add(modelId);
    
    // Optimized background warmup
    if (doWarmup && !modelWarmupQueue.has(modelId)) {
      modelWarmupQueue.add(modelId);
      try {
        await warmupModel(model);
      } finally {
        modelWarmupQueue.delete(modelId);
      }
    }
  }
};

// Preload all models for instant switching
const initializeModelCache = async () => {
  const models = isTestEnvironment ? testModels : productionModels;
  // Populate cache quickly and start warmups in background
  Object.keys(models).forEach((id) => void preloadModel(id, true));
};

// Initialize cache immediately
initializeModelCache();

export const myProvider = customProvider(({
  languageModels: isTestEnvironment ? testModels : productionModels,
  
  // Ultra-fast model retrieval with caching
  languageModel: (modelId: string) => {
    const cachedModel = modelCache.get(modelId);
    if (cachedModel) {
      return cachedModel;
    }
    
    const model = isTestEnvironment ? testModels[modelId] : productionModels[modelId];
    if (model) {
      modelCache.set(modelId, model);
    }
    return model;
  },
} as any));

// Export helpers so other modules (preload route) can trigger cache/warmup
export { preloadModel, warmupModel };

// Simple model metadata to indicate whether a model supports native tool-calling
// This is used by the streaming route to select native vs manual tool execution.
const modelMetadata: Record<string, { toolCallType: 'native' | 'manual' }> = {
  'chat-model': { toolCallType: 'native' },
  'chat-model-reasoning': { toolCallType: 'native' },
  'chat-model1': { toolCallType: 'native' },
  'chat-model2': { toolCallType: 'native' },
  'chat-model3': { toolCallType: 'native' },
  'title-model': { toolCallType: 'manual' },
  'artifact-model': { toolCallType: 'manual' },
};

export function getModelMetadata(modelId: string) {
  return modelMetadata[modelId] ?? { toolCallType: 'manual' };
}
