import { isValidElement, type ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "./CodeBlock";
import "./MarkdownMessage.css";

export interface MarkdownMessageProps {
  content: string;
}

function extractText(node: ReactNode): string {
  if (typeof node === "string") {
    return node;
  }

  if (typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(extractText).join("");
  }

  if (isValidElement<{ children?: ReactNode }>(node)) {
    return extractText(node.props.children);
  }

  return "";
}

function MarkdownPre({ children }: { children?: ReactNode }) {
  if (!isValidElement<{ className?: string; children?: ReactNode }>(children)) {
    return <pre>{children}</pre>;
  }

  const className = children.props.className ?? "";
  const languageMatch = /language-([\w+-]+)/.exec(className);
  const code = extractText(children.props.children).replace(/\n$/, "");

  return (
    <CodeBlock code={code} language={languageMatch ? languageMatch[1] : null} />
  );
}

const components: Components = {
  pre: MarkdownPre,
  a({ children, href }) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  },
  table({ children }) {
    return (
      <div className="markdown__table-wrap">
        <table>{children}</table>
      </div>
    );
  },
};

export function MarkdownMessage({ content }: MarkdownMessageProps) {
  return (
    <div className="markdown">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
