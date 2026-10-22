import "./TypingIndicator.css";

export function TypingIndicator() {
  return (
    <div className="typing-indicator" role="status">
      <div className="typing-indicator__avatar" aria-hidden="true">
        D
      </div>
      <div className="typing-indicator__bubble">
        <span className="visually-hidden">DeskTron думает...</span>
        <span className="typing-indicator__label" aria-hidden="true">
          DeskTron думает
        </span>
        <span className="typing-indicator__dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </div>
    </div>
  );
}
