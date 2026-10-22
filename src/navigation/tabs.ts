import type { IconName } from "../components/ui/Icon";

export type TabId = "chat" | "skills" | "tools" | "settings";

export interface TabDefinition {
  id: TabId;
  label: string;
  icon: IconName;
}

export const TABS: readonly TabDefinition[] = [
  { id: "chat", label: "Чат", icon: "chat" },
  { id: "skills", label: "Скиллы", icon: "zap" },
  { id: "tools", label: "Инструменты", icon: "wrench" },
  { id: "settings", label: "Настройки", icon: "settings" },
];
