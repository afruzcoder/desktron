import { Icon } from "../ui/Icon";
import { TABS, type TabId } from "../../navigation/tabs";
import "./Sidebar.css";

export interface SidebarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside className="sidebar">
      <nav className="sidebar__nav" aria-label="Основная навигация">
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              className={`sidebar__item${isActive ? " sidebar__item--active" : ""}`}
              aria-current={isActive ? "page" : undefined}
              onClick={() => onTabChange(tab.id)}
            >
              <span className="sidebar__icon">
                <Icon name={tab.icon} size={15} />
              </span>
              <span className="sidebar__label">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar__footer">
        <span className="sidebar__status-dot" aria-hidden="true" />
        <span>Готов к работе</span>
      </div>
    </aside>
  );
}
