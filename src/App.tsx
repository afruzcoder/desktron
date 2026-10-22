import { useState } from "react";
import { Sidebar } from "./components/layout/Sidebar";
import { Titlebar } from "./components/layout/Titlebar";
import { ChatView } from "./features/chat/ChatView";
import { useChat, type UseChatResult } from "./features/chat/useChat";
import { SettingsView } from "./features/settings/SettingsView";
import { SkillsView } from "./features/skills/SkillsView";
import { ToolsView } from "./features/tools/ToolsView";
import type { TabId } from "./navigation/tabs";
import "./App.css";

function renderTab(tab: TabId, chat: UseChatResult, onOpenSettings: () => void) {
  switch (tab) {
    case "chat":
      return <ChatView chat={chat} onOpenSettings={onOpenSettings} />;
    case "skills":
      return <SkillsView />;
    case "tools":
      return <ToolsView />;
    case "settings":
      return <SettingsView />;
  }
}

function App() {
  const [activeTab, setActiveTab] = useState<TabId>("chat");
  const chat = useChat();
  const openSettings = () => setActiveTab("settings");

  return (
    <div className="app">
      <Titlebar />
      <div className="app__body">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="app__content">{renderTab(activeTab, chat, openSettings)}</main>
      </div>
    </div>
  );
}

export default App;
