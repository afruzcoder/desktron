import { Icon } from "../../components/ui/Icon";
import type { ChatNotice } from "./useChat";
import "./ChatAlert.css";

export interface ChatAlertProps {
  notice: ChatNotice;
  onDismiss: () => void;
  actionLabel?: string;
  onAction?: () => void;
}

export function ChatAlert({ notice, onDismiss, actionLabel, onAction }: ChatAlertProps) {
  return (
    <div className={`chat-alert chat-alert--${notice.tone}`} role="alert">
      <div className="chat-alert__content">
        <span className="chat-alert__icon" aria-hidden="true">
          {notice.tone === "warning" ? "⚠" : "!"}
        </span>
        <div className="chat-alert__text">
          <p className="chat-alert__title">{notice.title}</p>
          <p className="chat-alert__message">{notice.message}</p>
        </div>
      </div>

      <div className="chat-alert__actions">
        {actionLabel && onAction ? (
          <button type="button" className="chat-alert__action" onClick={onAction}>
            {actionLabel}
          </button>
        ) : null}
        <button
          type="button"
          className="chat-alert__dismiss"
          aria-label="Скрыть уведомление"
          title="Скрыть"
          onClick={onDismiss}
        >
          <Icon name="close" size={14} />
        </button>
      </div>
    </div>
  );
}
