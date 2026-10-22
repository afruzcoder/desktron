export type ApiProviderId = "gemini" | "openrouter" | "deepseek";

export type ApiKeys = Record<ApiProviderId, string>;

export type SaveApiKeysResult =
  | { ok: true }
  | { ok: false; error: string };

const STORAGE_KEY = "desktron.api-keys";

export const API_PROVIDERS: readonly ApiProviderId[] = ["gemini", "openrouter", "deepseek"];

export const API_PROVIDER_LABELS: Record<ApiProviderId, string> = {
  gemini: "Gemini",
  openrouter: "OpenRouter",
  deepseek: "DeepSeek",
};

export const EMPTY_API_KEYS: ApiKeys = {
  gemini: "",
  openrouter: "",
  deepseek: "",
};

function readProviderKey(source: object, provider: ApiProviderId): string {
  const value = Reflect.get(source, provider);
  return typeof value === "string" ? value : "";
}

export function loadApiKeys(): ApiKeys {
  let raw: string | null;

  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    console.error("Не удалось прочитать API-ключи из localStorage", error);
    return { ...EMPTY_API_KEYS };
  }

  if (!raw) {
    return { ...EMPTY_API_KEYS };
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    console.error("Не удалось разобрать сохранённые API-ключи", error);
    return { ...EMPTY_API_KEYS };
  }

  if (typeof parsed !== "object" || parsed === null) {
    return { ...EMPTY_API_KEYS };
  }

  return {
    gemini: readProviderKey(parsed, "gemini"),
    openrouter: readProviderKey(parsed, "openrouter"),
    deepseek: readProviderKey(parsed, "deepseek"),
  };
}

export function saveApiKeys(keys: ApiKeys): SaveApiKeysResult {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
    return { ok: true };
  } catch (error) {
    console.error("Не удалось сохранить API-ключи в localStorage", error);
    return {
      ok: false,
      error: "Не удалось сохранить ключи. Проверьте доступ к локальному хранилищу.",
    };
  }
}
