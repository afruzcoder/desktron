import { useState, type ChangeEvent, type FormEvent } from "react";
import { Icon } from "../../components/ui/Icon";
import {
  loadApiKeys,
  saveApiKeys,
  type ApiKeys,
  type ApiProviderId,
} from "../../services/settings/apiKeys";
import {
  loadActiveProvider,
  saveActiveProvider,
} from "../../services/settings/activeProvider";
import { API_PROVIDER_DEFINITIONS } from "./providers";
import "./SettingsView.css";

type SaveStatus =
  | { kind: "idle" }
  | { kind: "saved" }
  | { kind: "error"; message: string };

export function SettingsView() {
  const [keys, setKeys] = useState<ApiKeys>(() => loadApiKeys());
  const [activeProvider, setActiveProvider] = useState<ApiProviderId>(() =>
    loadActiveProvider(),
  );
  const [showKeys, setShowKeys] = useState(false);
  const [status, setStatus] = useState<SaveStatus>({ kind: "idle" });

  const handleKeyChange = (provider: ApiProviderId, value: string) => {
    setKeys((current) => ({ ...current, [provider]: value }));
    setStatus({ kind: "idle" });
  };

  const handleProviderChange = (provider: ApiProviderId) => {
    setActiveProvider(provider);
    setStatus({ kind: "idle" });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const keysResult = saveApiKeys(keys);

    if (!keysResult.ok) {
      setStatus({ kind: "error", message: keysResult.error });
      return;
    }

    const providerResult = saveActiveProvider(activeProvider);

    if (!providerResult.ok) {
      setStatus({ kind: "error", message: providerResult.error });
      return;
    }

    setStatus({ kind: "saved" });
  };

  const handleToggleVisibility = (event: ChangeEvent<HTMLInputElement>) => {
    setShowKeys(event.currentTarget.checked);
  };

  return (
    <section className="settings-view">
      <header className="settings-header">
        <h1 className="settings-header__title">Настройки</h1>
      </header>

      <div className="settings-scroll">
        <form className="settings-card" onSubmit={handleSubmit}>
          <div className="settings-card__header">
            <div>
              <h2 className="settings-card__title">API-ключи</h2>
              <p className="settings-card__description">
                Выберите провайдера для чата и добавьте ключ хотя бы одного сервиса.
              </p>
            </div>
            <label className="settings-visibility">
              <input
                type="checkbox"
                checked={showKeys}
                onChange={handleToggleVisibility}
              />
              <Icon name={showKeys ? "eye-off" : "eye"} size={14} />
              <span>{showKeys ? "Скрыть" : "Показать"}</span>
            </label>
          </div>

          <div className="settings-provider">
            <span className="settings-provider__label">Провайдер для чата</span>
            <div
              className="settings-provider__options"
              role="radiogroup"
              aria-label="Провайдер для чата"
            >
              {API_PROVIDER_DEFINITIONS.map((provider) => (
                <label
                  key={provider.id}
                  className={`settings-provider__option${
                    activeProvider === provider.id
                      ? " settings-provider__option--active"
                      : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="active-provider"
                    value={provider.id}
                    checked={activeProvider === provider.id}
                    onChange={() => handleProviderChange(provider.id)}
                  />
                  <span>{provider.label}</span>
                  {keys[provider.id].trim().length > 0 ? (
                    <span
                      className="settings-provider__dot"
                      title="Ключ указан"
                      aria-hidden="true"
                    />
                  ) : null}
                </label>
              ))}
            </div>
          </div>

          <div className="settings-fields">
            {API_PROVIDER_DEFINITIONS.map((provider) => (
              <div className="settings-field" key={provider.id}>
                <label className="settings-field__label" htmlFor={`api-key-${provider.id}`}>
                  {provider.label}
                </label>
                <input
                  id={`api-key-${provider.id}`}
                  className="settings-field__input"
                  type={showKeys ? "text" : "password"}
                  value={keys[provider.id]}
                  onChange={(event) => handleKeyChange(provider.id, event.currentTarget.value)}
                  placeholder={provider.placeholder}
                  autoComplete="off"
                  spellCheck={false}
                />
                <p className="settings-field__hint">{provider.hint}</p>
              </div>
            ))}
          </div>

          <div className="settings-actions">
            <button type="submit" className="settings-save">
              Сохранить ключи
            </button>
            {status.kind === "saved" ? (
              <span className="settings-status settings-status--saved">Ключи сохранены</span>
            ) : null}
            {status.kind === "error" ? (
              <span className="settings-status settings-status--error">{status.message}</span>
            ) : null}
          </div>
        </form>
      </div>
    </section>
  );
}
