import { useEffect, useRef } from "react";
import type { ChatMessage } from "./types";
import { MessageItem } from "./MessageItem";
import { TypingIndicator } from "./TypingIndicator";
import "./MessageList.css";

export interface MessageListProps {
  messages: ChatMessage[];
  isThinking: boolean;
}

export function MessageList({ messages, isThinking }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, isThinking]);

  return (
    <div className="message-list" role="log" aria-live="polite">
      <div className="message-list__inner">
        {messages.map((message) => (
          <MessageItem key={message.id} message={message} />
        ))}
        {isThinking ? <TypingIndicator /> : null}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
