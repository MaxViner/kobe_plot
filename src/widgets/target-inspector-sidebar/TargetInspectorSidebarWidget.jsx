import { TargetShotsTable } from '../../components/data/tst/TargetShotsTable.jsx';
import { Sidebar } from '../../components/layout/Sidebar.jsx';

export function TargetInspectorSidebarWidget({
  targetId,
  shots,
  targetIds,
  hoveredShotId,
  onHoverShot,
  onLeaveShot,
  onSelectTarget,
  onBack,
  className
}) {
  return (
    <Sidebar className={className}>
      <TargetShotsTable
        targetId={targetId}
        shots={shots}
        targetIds={targetIds}
        hoveredShotId={hoveredShotId}
        onHoverShot={onHoverShot}
        onLeaveShot={onLeaveShot}
        onSelectTarget={onSelectTarget}
        onBack={onBack}
      />
    </Sidebar>
  );
}