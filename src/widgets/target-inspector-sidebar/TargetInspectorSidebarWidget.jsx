import { TargetShotsTable } from '../../components/data/tst/TargetShotsTable.jsx';
import { Sidebar } from '../../components/layout/Sidebar.jsx';
import { useClusterResultsStore } from '../../stores/useClusterResultsStore.js';

export function TargetInspectorSidebarWidget({
  targetId,
  shots,
  targetIds,
  hoveredShotId,
  onHoverShot,
  onLeaveShot,
  onSelectTarget,
  onBack,
  className,
}) {
  const clusterResult = useClusterResultsStore(
    (state) =>
      state.resultsByTargetId.get(targetId),
  );

  const clusterByShotId = useClusterResultsStore(
    (state) =>
      state.clusterByShotIdByTargetId.get(
        targetId,
      ) ?? new Map(),
  );

  return (
    <Sidebar className={className}>
      <TargetShotsTable
        targetId={targetId}
        shots={shots}
        targetIds={targetIds}
        clusters={clusterResult?.clusters ?? []}
        clusterByShotId={clusterByShotId}
        hoveredShotId={hoveredShotId}
        onHoverShot={onHoverShot}
        onLeaveShot={onLeaveShot}
        onSelectTarget={onSelectTarget}
        onBack={onBack}
      />
    </Sidebar>
  );
}