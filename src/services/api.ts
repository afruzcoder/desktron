import {
  API_PROVIDER_LABELS,
  type ApiProviderId,
} from "./settings/apiKeys";

export interface ChatApiMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatApiRequest {
  provider: ApiProviderId;
  apiKey: string;
  messages: ChatApiMessage[];
}

export const API_MODELS: Record<ApiProviderId, string> = {
  gemini: "gemini-2.5-flash",
  openrouter: "openai/gpt-4o-mini",
  deepseek: "deepseek-chat",
};

const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";
const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const DEEPSEEK_ENDPOINT = "https://api.deepseek.com/chat/completions";
const REQUEST_TIMEOUT_MS = 60_000;

const SYSTEM_PROMPT =
  "Ты DeskTron — полезный AI-ассистент, встроенный в десктопное приложение. Отвечай кратко, по делу и на языке пользователя. Форматируй ответы простым текстом без лишней Markdown-разметки.";

export class ApiError extends Error {
  readonly provider: ApiProviderId;

  constructor(message: string, provider: ApiProviderId) {
    super(message);
    this.name = "ApiError";
    this.provider = provider;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function extractServiceMessage(payload: unknown): string | null {
  if (!isRecord(payload) || !isRecord(payload.error)) {
    return null;
  }

  const message = payload.error.message;
  return typeof message === "string" && message.trim().length > 0 ? message.trim() : null;
}

function describeHttpError(provider: ApiProviderId, status: number, payload: unknown): string {
  const label = API_PROVIDER_LABELS[provider];
  const serviceMessage = extractServiceMessage(payload);

  if (serviceMessage) {
    return `${label}: ${serviceMessage}`;
  }

  if (status === 401 || status === 403) {
    return `${label}: неверный API Key или нет доступа к модели.`;
  }

  if (status === 429) {
    return `${label}: превышен лимит запросов. Попробуйте позже.`;
  }

  if (status >= 500) {
    return `${label}: сервис временно недоступен. Попробуйте позже.`;
  }

  return `${label}: ошибка запроса (HTTP ${status}).`;
}

async function readPayload(response: Response): Promise<unknown> {
  const text = await response.text();

  if (text.length === 0) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    console.error("Ответ API не является JSON", error);
    return text;
  }
}

async function requestJson(
  url: string,
  init: RequestInit,
  provider: ApiProviderId,
): Promise<unknown> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;

  try {
    response = await fetch(url, { ...init, signal: controller.signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError(
        `${API_PROVIDER_LABELS[provider]}: превышено время ожидания ответа.`,
        provider,
      );
    }

    console.error("Сетевая ошибка при обращении к API", error);
    throw new ApiError(
      `${API_PROVIDER_LABELS[provider]}: не удалось подключиться. Проверьте интернет-соединение.`,
      provider,
    );
  } finally {
    window.clearTimeout(timeoutId);
  }

  const payload = await readPayload(response);

  if (!response.ok) {
    throw new ApiError(describeHttpError(provider, response.status, payload), provider);
  }

  return payload;
}

function dropLeadingAssistantMessages(messages: ChatApiMessage[]): ChatApiMessage[] {
  let startIndex = 0;

  while (startIndex < messages.length && messages[startIndex].role === "assistant") {
    startIndex += 1;
  }

  return messages.slice(startIndex);
}

function toGeminiContents(
  messages: ChatApiMessage[],
): Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> {
  const contents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];

  for (const message of dropLeadingAssistantMessages(messages)) {
    const role = message.role === "assistant" ? "model" : "user";
    const last = contents[contents.length - 1];

    if (last && last.role === role) {
      last.parts.push({ text: message.content });
    } else {
      contents.push({ role, parts: [{ text: message.content }] });
    }
  }

  return contents;
}

function toOpenAiMessages(
  messages: ChatApiMessage[],
): Array<{ role: "system" | "user" | "assistant"; content: string }> {
  return [
    { role: "system", content: SYSTEM_PROMPT },
    ...messages.map((message) => ({
      role: message.role,
      content: message.content,
    })),
  ];
}

function parseGeminiResponse(payload: unknown): string | null {
  if (!isRecord(payload)) {
    return null;
  }

  const candidates = payload.candidates;

  if (!Array.isArray(candidates) || candidates.length === 0) {
    return null;
  }

  const candidate: unknown = candidates[0];

  if (!isRecord(candidate) || !isRecord(candidate.content)) {
    return null;
  }

  const parts = candidate.content.parts;

  if (!Array.isArray(parts)) {
    return null;
  }

  const text = parts
    .map((part: unknown) => (isRecord(part) && typeof part.text === "string" ? part.text : ""))
    .join("")
    .trim();

  return text.length > 0 ? text : null;
}

function parseOpenAiResponse(payload: unknown): string | null {
  if (!isRecord(payload)) {
    return null;
  }

  const choices = payload.choices;

  if (!Array.isArray(choices) || choices.length === 0) {
    return null;
  }

  const choice: unknown = choices[0];

  if (!isRecord(choice) || !isRecord(choice.message)) {
    return null;
  }

  const content = choice.message.content;

  if (typeof content !== "string") {
    return null;
  }

  const text = content.trim();
  return text.length > 0 ? text : null;
}

async function sendGeminiRequest(request: ChatApiRequest): Promise<string> {
  const url = `${GEMINI_ENDPOINT}/${API_MODELS.gemini}:generateContent`;

  const payload = await requestJson(
    url,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": request.apiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: toGeminiContents(request.messages),
        generationConfig: { temperature: 0.7 },
      }),
    },
    request.provider,
  );

  const text = parseGeminiResponse(payload);

  if (!text) {
    throw new ApiError(
      `${API_PROVIDER_LABELS.gemini}: модель вернула пустой ответ.`,
      request.provider,
    );
  }

  return text;
}

async function sendOpenAiCompatibleRequest(
  request: ChatApiRequest,
  endpoint: string,
): Promise<string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${request.apiKey}`,
  };

  if (request.provider === "openrouter") {
    headers["X-Title"] = "DeskTron";
  }

  const payload = await requestJson(
    endpoint,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: API_MODELS[request.provider],
        messages: toOpenAiMessages(request.messages),
        temperature: 0.7,
      }),
    },
    request.provider,
  );

  const text = parseOpenAiResponse(payload);

  if (!text) {
    throw new ApiError(
      `${API_PROVIDER_LABELS[request.provider]}: модель вернула пустой ответ.`,
      request.provider,
    );
  }

  return text;
}

export async function sendChatMessage(request: ChatApiRequest): Promise<string> {
  if (request.apiKey.trim().length === 0) {
    throw new ApiError("API Key не указан.", request.provider);
  }

  switch (request.provider) {
    case "gemini":
      return sendGeminiRequest(request);
    case "openrouter":
      return sendOpenAiCompatibleRequest(request, OPENROUTER_ENDPOINT);
    case "deepseek":
      return sendOpenAiCompatibleRequest(request, DEEPSEEK_ENDPOINT);
  }
}
