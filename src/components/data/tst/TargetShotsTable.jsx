import { Card } from '../../ui/card/Card.jsx';
import { useTargetShotsTable } from './hooks/useTargetShotsTable.js';
import { TargetNavigation } from './parts/TargetNavigation.jsx';
import { TargetTableHeader } from './parts/TargetTableHeader.jsx';
import { TargetTableBody } from './parts/TargetTableBody.jsx';
import { TargetTableFooter } from './parts/TargetTableFooter.jsx';
import styles from './TargetShotsTable.module.scss';

export function TargetShotsTable({
  targetId,
  shots,
  targetIds,
  hoveredShotId,
  onHoverShot,
  onLeaveShot,
  onSelectTarget,
  onBack,
}) {
  const {
    currentIndex,
    previousTargetId,
    nextTargetId,
    formattedShots,
    canGoPrevious,
    canGoNext,
  } = useTargetShotsTable({
    shots,
    targetIds,
    targetId,
  });

  return (
    <Card className={styles.tableCard}>
      <TargetNavigation
            targetId={targetId}
            currentIndex={currentIndex}
            totalCount={targetIds.length}
            previousTargetId={previousTargetId}
            nextTargetId={nextTargetId}
            canGoPrevious={canGoPrevious}
            canGoNext={canGoNext}
            onBack={onBack}
            onSelectTarget={onSelectTarget}
            />

      <TargetTableHeader
        targetId={targetId}
        shotCount={shots.length}
      />

      <div className={styles.tableScroll}>
                    <table className={styles.table}>
                    <caption className={styles.tableCaption}>
                        Исходные полярные координаты и рассчитанные декартовы координаты
                    </caption>

                    <thead>
                        <tr>
                        <th scope="col">№</th>
                        <th scope="col">Азимут</th>
                        <th scope="col">Дальность</th>
                        <th scope="col">X</th>
                        <th scope="col">Y</th>
                        </tr>
                    </thead>

                    <TargetTableBody
                        shots={formattedShots}
                        hoveredShotId={hoveredShotId}
                        onHoverShot={onHoverShot}
                        onLeaveShot={onLeaveShot}
                    />

                    <TargetTableFooter shotCount={shots.length} />
                    </table>
      </div>
    </Card>
  );
}