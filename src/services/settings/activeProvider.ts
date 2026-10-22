import { API_PROVIDERS, type ApiProviderId } from "./apiKeys";

const STORAGE_KEY = "desktron.active-provider";

export const DEFAULT_API_PROVIDER: ApiProviderId = "gemini";

export type SaveActiveProviderResult =
  | { ok: true }
  | { ok: false; error: string };

function isApiProviderId(value: unknown): value is ApiProviderId {
  return API_PROVIDERS.some((provider) => provider === value);
}

export function loadActiveProvider(): ApiProviderId {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return isApiProviderId(raw) ? raw : DEFAULT_API_PROVIDER;
  } catch (error) {
    console.error("Не удалось прочитать активного провайдера", error);
    return DEFAULT_API_PROVIDER;
  }
}

export function saveActiveProvider(provider: ApiProviderId): SaveActiveProviderResult {
  try {
    localStorage.setItem(STORAGE_KEY, provider);
    return { ok: true };
  } catch (error) {
    console.error("Не удалось сохранить активного провайдера", error);
    return {
      ok: false,
      error: "Не удалось сохранить провайдера. Проверьте доступ к локальному хранилищу.",
    };
  }
}
