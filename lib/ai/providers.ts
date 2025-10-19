import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
  generateText,
  type LanguageModel,
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
function createOptimizedModel(baseModel: LanguageModel, config: ModelConfig = {}): LanguageModel {
  if (config.reasoning) {
    return wrapLanguageModel({
      // wrapLanguageModel expects a LanguageModelV2; cast to any to accept string|v2
      model: baseModel as any,
      middleware: extractReasoningMiddleware({
        tagName: config.reasoningTag || 'think',
      }),
    }) as unknown as LanguageModel;
  }
  return baseModel;
}

// Ultra-fast optimized language models with instant switching
const productionModels: Record<string, LanguageModel> = {
  // DeepSeek models - ultra performance optimized
  'chat-model': (deepseek as any)('deepseek-chat', {
    temperature: 0.7,
    topP: 0.95,
    maxOutputTokens: 65536, // Increased for long code generation
  }) as LanguageModel,
  'chat-model-reasoning': createOptimizedModel(
    (deepseek as any)('deepseek-reasoner', {
      temperature: 0.7,
      topP: 0.95,
      maxOutputTokens: 65536, // Massive context for complex reasoning
      presencePenalty: 0.1,
      frequencyPenalty: 0.1,
    }) as LanguageModel,
    { reasoning: true, reasoningTag: 'think' }
  ),

  'chat-model1': (google as any)('models/gemini-2.5-flash', {
    temperature: 0.7,
    topP: 0.8,
    maxOutputTokens: 65536,
    defaultObjectGenerationMode: 'generic',
  }) as LanguageModel,
  'chat-model2': (groq as any)('moonshotai/kimi-k2-instruct', {
    temperature: 0.8,
    topP: 0.95,
    maxOutputTokens: 65536, // Maximum for complex projects
  }) as LanguageModel,
  'chat-model3': createOptimizedModel(
    (groq as any)('openai/gpt-oss-120b', {
      temperature: 0.7,
      topP: 0.9,
      maxOutputTokens: 32768, // Large context window
      presencePenalty: 0.1,
      frequencyPenalty: 0.1,
    }) as LanguageModel,
    { reasoning: true, reasoningTag: 'think' }
  ),
  'title-model': (groq as any)('llama-3.1-8b-instant', {
    temperature: 0.3,
    maxOutputTokens: 512, // Sufficient for titles
  }) as LanguageModel,
  'artifact-model': (deepseek as any)('deepseek-coder', {
    temperature: 0.5,
    maxOutputTokens: 16384, // Large context for code generation
  }) as LanguageModel,
};

const testModels: Record<string, LanguageModel> = {
  'chat-model': chatModel,
  'chat-model-reasoning': reasoningModel,
  'title-model': titleModel,
  'artifact-model': artifactModel,
  'chat-model1': chatModel,
  'chat-model2': chatModel,
  'chat-model3': reasoningModel,
};

// Model caching and preloading for instant switching
const modelCache = new Map<string, LanguageModel>();
const preloadedModels = new Set<string>();
const modelWarmupQueue = new Set<string>();

// Enhanced preload with priority queue and background warming
const warmupModel = async (model: LanguageModel, timeoutMs = 1500) => {
  try {
    // Fire a tiny generateText to warm up connections with shorter timeout
    const p = generateText({
      model,
      messages: [{ role: 'user', content: '.' }],
      maxOutputTokens: 1,
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
