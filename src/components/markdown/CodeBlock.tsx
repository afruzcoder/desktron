import { useEffect, useRef, useState } from "react";
import { Icon } from "../ui/Icon";
import "./CodeBlock.css";

export interface CodeBlockProps {
  code: string;
  language: string | null;
}

export function CodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);

      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }

      timerRef.current = window.setTimeout(() => {
        setCopied(false);
        timerRef.current = null;
      }, 1800);
    } catch (error) {
      console.error("Не удалось скопировать код", error);
    }
  };

  return (
    <div className="code-block">
      <div className="code-block__header">
        <span className="code-block__language">{language ?? "code"}</span>
        <button
          type="button"
          className={`code-block__copy${copied ? " code-block__copy--done" : ""}`}
          onClick={() => {
            void handleCopy();
          }}
          aria-label={copied ? "Код скопирован" : "Скопировать код"}
          title={copied ? "Скопировано" : "Копировать"}
        >
          <Icon name={copied ? "check" : "copy"} size={12} />
          <span>{copied ? "Скопировано" : "Копировать"}</span>
        </button>
      </div>
      <pre className="code-block__pre">
        <code>{code}</code>
      </pre>
    </div>
  );
}
