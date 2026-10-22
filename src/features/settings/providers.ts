import type { ApiProviderId } from "../../services/settings/apiKeys";

export interface ApiProviderDefinition {
  id: ApiProviderId;
  label: string;
  placeholder: string;
  hint: string;
}

export const API_PROVIDER_DEFINITIONS: readonly ApiProviderDefinition[] = [
  {
    id: "gemini",
    label: "Gemini",
    placeholder: "AIza…",
    hint: "Google AI Studio — ключ для моделей Gemini.",
  },
  {
    id: "openrouter",
    label: "OpenRouter",
    placeholder: "sk-or-v1-…",
    hint: "OpenRouter — единый ключ для доступа к разным моделям.",
  },
  {
    id: "deepseek",
    label: "DeepSeek",
    placeholder: "sk-…",
    hint: "DeepSeek Platform — ключ для моделей DeepSeek.",
  },
];
