import { EmptyState } from "../../components/ui/EmptyState";
import { Icon } from "../../components/ui/Icon";

export function SkillsView() {
  return (
    <EmptyState
      icon={<Icon name="zap" size={20} />}
      title="Скиллы"
      description="Здесь появятся подключаемые навыки DeskTron. Управление скиллами будет доступно на следующем этапе."
    />
  );
}
