import { useCallback, useRef, useState } from "react";
import { ApiError, sendChatMessage } from "../../services/api";
import { loadApiKeys } from "../../services/settings/apiKeys";
import { loadActiveProvider } from "../../services/settings/activeProvider";
import type { ChatMessage } from "./types";

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Привет! Я DeskTron — ваш AI-ассистент для рабочего стола. Задайте вопрос в поле ниже, а ключи провайдеров можно добавить во вкладке «Настройки».",
  createdAt: Date.now(),
};

const INITIAL_MESSAGES: ChatMessage[] = [WELCOME_MESSAGE];

export interface ChatNotice {
  tone: "warning" | "error";
  title: string;
  message: string;
}

const MISSING_API_KEY_NOTICE: ChatNotice = {
  tone: "warning",
  title: "Не хватает API Key",
  message: "Пожалуйста, укажите API Key в разделе Настройки.",
};

function createMessageId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export interface UseChatResult {
  messages: ChatMessage[];
  isSending: boolean;
  notice: ChatNotice | null;
  sendMessage: (content: string) => Promise<boolean>;
  dismissNotice: () => void;
}

export function useChat(): UseChatResult {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [isSending, setIsSending] = useState(false);
  const [notice, setNotice] = useState<ChatNotice | null>(null);
  const messagesRef = useRef<ChatMessage[]>(INITIAL_MESSAGES);
  const isSendingRef = useRef(false);

  const dismissNotice = useCallback(() => {
    setNotice(null);
  }, []);

  const sendMessage = useCallback((content: string): Promise<boolean> => {
    const trimmed = content.trim();

    if (trimmed.length === 0 || isSendingRef.current) {
      return Promise.resolve(false);
    }

    const provider = loadActiveProvider();
    const apiKey = loadApiKeys()[provider].trim();

    if (apiKey.length === 0) {
      setNotice(MISSING_API_KEY_NOTICE);
      return Promise.resolve(false);
    }

    const userMessage: ChatMessage = {
      id: createMessageId(),
      role: "user",
      content: trimmed,
      createdAt: Date.now(),
    };

    const conversation = [...messagesRef.current, userMessage];
    messagesRef.current = conversation;
    setMessages(conversation);
    setNotice(null);
    isSendingRef.current = true;
    setIsSending(true);

    void (async () => {
      try {
        const replyText = await sendChatMessage({
          provider,
          apiKey,
          messages: conversation.map(({ role, content: text }) => ({ role, content: text })),
        });

        const reply: ChatMessage = {
          id: createMessageId(),
          role: "assistant",
          content: replyText,
          createdAt: Date.now(),
        };

        const updated = [...messagesRef.current, reply];
        messagesRef.current = updated;
        setMessages(updated);
      } catch (error) {
        console.error("Не удалось получить ответ от API", error);

        setNotice({
          tone: "error",
          title: "Ошибка запроса",
          message:
            error instanceof ApiError
              ? error.message
              : "Не удалось получить ответ от модели. Попробуйте ещё раз.",
        });
      } finally {
        isSendingRef.current = false;
        setIsSending(false);
      }
    })();

    return Promise.resolve(true);
  }, []);

  return { messages, isSending, notice, sendMessage, dismissNotice };
}
