import { useEffect, useState } from "react";
import { API_PROVIDER_LABELS, loadApiKeys } from "../../services/settings/apiKeys";
import { loadActiveProvider } from "../../services/settings/activeProvider";
import { ChatAlert } from "./ChatAlert";
import { ChatComposer } from "./ChatComposer";
import { MessageList } from "./MessageList";
import type { UseChatResult } from "./useChat";
import "./ChatView.css";

export interface ChatViewProps {
  chat: UseChatResult;
  onOpenSettings: () => void;
}

export function ChatView({ chat, onOpenSettings }: ChatViewProps) {
  const { messages, isSending, notice, sendMessage, dismissNotice } = chat;
  const [activeProvider] = useState(() => loadActiveProvider());

  useEffect(() => {
    if (notice?.tone === "warning" && loadApiKeys()[activeProvider].trim().length > 0) {
      dismissNotice();
    }
  }, [activeProvider, notice, dismissNotice]);

  const handleOpenSettings = () => {
    dismissNotice();
    onOpenSettings();
  };

  return (
    <section className="chat-view">
      <header className="chat-header">
        <div className="chat-header__identity">
          <h1 className="chat-header__title">Чат</h1>
          <span className="chat-header__badge">{API_PROVIDER_LABELS[activeProvider]}</span>
        </div>
      </header>

      <div className="chat-body">
        <MessageList messages={messages} isThinking={isSending} />

        {notice ? (
          <div className="chat-notices">
            <ChatAlert
              notice={notice}
              onDismiss={dismissNotice}
              actionLabel={notice.tone === "warning" ? "Открыть настройки" : undefined}
              onAction={notice.tone === "warning" ? handleOpenSettings : undefined}
            />
          </div>
        ) : null}

        <ChatComposer onSend={sendMessage} isSending={isSending} />
      </div>
    </section>
  );
}
