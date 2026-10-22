import { MarkdownMessage } from "../../components/markdown/MarkdownMessage";
import type { ChatMessage } from "./types";
import "./MessageItem.css";

const timeFormatter = new Intl.DateTimeFormat("ru-RU", {
  hour: "2-digit",
  minute: "2-digit",
});

export interface MessageItemProps {
  message: ChatMessage;
}

export function MessageItem({ message }: MessageItemProps) {
  const isAssistant = message.role === "assistant";
  const author = isAssistant ? "DeskTron" : "Вы";

  return (
    <article className={`message message--${message.role}`}>
      {isAssistant ? (
        <span className="message__avatar" aria-hidden="true">
          D
        </span>
      ) : null}
      <div className="message__body">
        <div className="message__meta">
          <span className="message__author">{author}</span>
          <time className="message__time" dateTime={new Date(message.createdAt).toISOString()}>
            {timeFormatter.format(message.createdAt)}
          </time>
        </div>
        <div className="message__content">
          <MarkdownMessage content={message.content} />
        </div>
      </div>
    </article>
  );
}
