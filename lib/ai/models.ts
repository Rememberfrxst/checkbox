export const DEFAULT_CHAT_MODEL: string = "chat-model";

export interface ChatModel {
  id: string;
  name: string;
  description: string;
  icon?: string;
  hasReasoningTag?: boolean;
  hasComingTag?: boolean;
  hasNewTag?: boolean;
  isAvailable?: boolean;
}

export const chatModels: Array<ChatModel> = [
  {
    id: "",
    name: "Claude Sonnet 4",
    description: "Anthropic's latest model",
    icon: "/images/claude-icon.png",
    isAvailable: true,
  },
  {
    id: "chat-model2",
    name: "GPT-5 mini",
    description: "OpenAi's Flagship model",
    icon: "/images/openai-icon.png",
    isAvailable: false,
  },
  {
    id: "chat-model1",
    name: "Gemini Pro",
    description: "Meta's newest instruction-tuned model",
    icon: "/images/meta-icon.png",
    isAvailable: true,
  },
  {
    id: "chat-model",
    name: "DeepSeek V3",
    description: "",
    icon: "/images/deepseek-icon.png",
    isAvailable: true,
  },
  {
    id: "chat-model-reasoning",
    name: "DeepSeek R1",
    description: "Advanced reasoning capabilities",
    icon: "/images/deepseek-icon.png",
    isAvailable: true,
  },
  {
    id: "",
    name: "Qwen 3 32B",
    description: "Large-scale model by Alibaba (Qwen)",
    icon: "/images/qwen-icon.png",
    isAvailable: true,
  },
  {
    id: "chat-model3",
    name: "GPT-OSS-120B",
    description: "OpenAI's large open-source model",
    icon: "/images/openai-icon.png",
    isAvailable: true,
  },
];
