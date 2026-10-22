import { EmptyState } from "../../components/ui/EmptyState";
import { Icon } from "../../components/ui/Icon";

export function ToolsView() {
  return (
    <EmptyState
      icon={<Icon name="wrench" size={20} />}
      title="Инструменты"
      description="Здесь появятся встроенные инструменты: работа с файлами, команды и системные утилиты. Раздел в разработке."
    />
  );
}
