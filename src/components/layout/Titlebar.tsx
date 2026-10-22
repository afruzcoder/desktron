import { Icon } from "../ui/Icon";
import {
  closeWindow,
  minimizeWindow,
  toggleMaximizeWindow,
} from "../../services/window/windowControls";
import "./Titlebar.css";

function runWindowAction(action: () => Promise<void>): void {
  action().catch((error: unknown) => {
    console.error("Не удалось выполнить действие с окном", error);
  });
}

export function Titlebar() {
  return (
    <header className="titlebar" data-tauri-drag-region>
      <div className="titlebar__brand" data-tauri-drag-region>
        <span className="titlebar__logo" aria-hidden="true">
          D
        </span>
        <span className="titlebar__title" data-tauri-drag-region>
          DeskTron <span className="titlebar__version">v0.1</span>
        </span>
      </div>

      <div className="titlebar__controls">
        <button
          type="button"
          className="titlebar__control"
          aria-label="Свернуть окно"
          title="Свернуть"
          onClick={() => runWindowAction(minimizeWindow)}
        >
          <Icon name="minimize" />
        </button>
        <button
          type="button"
          className="titlebar__control"
          aria-label="Развернуть окно"
          title="Развернуть"
          onClick={() => runWindowAction(toggleMaximizeWindow)}
        >
          <Icon name="maximize" />
        </button>
        <button
          type="button"
          className="titlebar__control titlebar__control--close"
          aria-label="Закрыть окно"
          title="Закрыть"
          onClick={() => runWindowAction(closeWindow)}
        >
          <Icon name="close" />
        </button>
      </div>
    </header>
  );
}
