import { useState, type ChangeEvent, type FormEvent, type KeyboardEvent } from "react";
import { Icon } from "../../components/ui/Icon";
import "./ChatComposer.css";

export interface ChatComposerProps {
  onSend: (content: string) => Promise<boolean>;
  isSending: boolean;
}

export function ChatComposer({ onSend, isSending }: ChatComposerProps) {
  const [draft, setDraft] = useState("");
  const canSend = draft.trim().length > 0 && !isSending;

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setDraft(event.currentTarget.value);
  };

  const submitDraft = async (): Promise<void> => {
    const text = draft.trim();

    if (text.length === 0 || isSending) {
      return;
    }

    try {
      const accepted = await onSend(text);

      if (accepted) {
        setDraft((current) => (current === text ? "" : current));
      }
    } catch (error) {
      console.error("Не удалось отправить сообщение", error);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submitDraft();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void submitDraft();
    }
  };

  return (
    <div className="chat-composer-wrap">
      <form className="chat-composer" onSubmit={handleSubmit}>
        <textarea
          className="chat-composer__input"
          value={draft}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={isSending ? "DeskTron отвечает…" : "Введите сообщение…"}
          aria-label="Сообщение"
          rows={1}
          spellCheck
        />
        <button
          type="submit"
          className="chat-composer__send"
          aria-label="Отправить сообщение"
          title="Отправить"
          disabled={!canSend}
        >
          <Icon name="arrow-up" size={16} />
        </button>
      </form>
      <p className="chat-composer__hint">
        Enter — отправить · Shift + Enter — новая строка
      </p>
    </div>
  );
}
