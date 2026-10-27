import { useMemo } from 'react';
import { Card } from '../../ui/card/Card.jsx';
import { useTargetShotsTable } from './hooks/useTargetShotsTable.js';
import { TargetNavigation } from './parts/TargetNavigation.jsx';
import { TargetTableHeader } from './parts/TargetTableHeader.jsx';
import { TargetTableRow } from './parts/TargetTableRow.jsx';
import { TargetTableFooter } from './parts/TargetTableFooter.jsx';
import { clusterColor } from '../../../math/clustering/index.js';
import styles from './TargetShotsTable.module.scss';

export function TargetShotsTable({
  targetId,
  shots,
  targetIds,
  clusters = [],
  clusterByShotId = new Map(),
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

  const clusteredGroups = useMemo(() => {
    if (clusters.length === 0) {
      return [
        {
          clusterIndex: 0,
          title: 'Все выстрелы',
          color: '#38bdf8',
          shots: formattedShots,
        },
      ];
    }

    return clusters.map((cluster, clusterIndex) => {
      const clusterShots = formattedShots.filter(
        (shot) =>
          (clusterByShotId.get(shot.id) ?? 0) ===
          clusterIndex,
      );

      return {
        clusterIndex,
        title: `Кластер ${clusterIndex + 1}`,
        color: clusterColor(clusterIndex),
        shots: clusterShots,
      };
    });
  }, [
    clusters,
    clusterByShotId,
    formattedShots,
  ]);

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
        {clusteredGroups.map((group) => (
          <section
            key={group.clusterIndex}
            className={styles.clusterTableSection}
          >
            <header
              className={styles.clusterTableHeader}
            >
              <span
                className={styles.clusterDot}
                style={{
                  background: group.color,
                }}
              />

              <span>
                {group.title}
              </span>

              <span
                className={
                  styles.clusterTableMeta
                }
              >
                {group.shots.length} точек
              </span>
            </header>

            <table
              className={styles.table}
            >
              <caption
                className={
                  styles.tableCaption
                }
              >
                Полярные и декартовы координаты
                выстрелов кластера
              </caption>

              <thead>
                <tr>
                  <th scope="col">
                    № в кластере
                  </th>

                  <th scope="col">
                    Азимут
                  </th>

                  <th scope="col">
                    Дальность
                  </th>

                  <th scope="col">
                    X
                  </th>

                  <th scope="col">
                    Z
                  </th>
                </tr>
              </thead>

              <tbody>
                {group.shots.map(
                  (shot, shotIndex) => (
                    <TargetTableRow
                      key={shot.id}
                      shot={{
                        ...shot,
                        number: shotIndex + 1,
                      }}
                      isHovered={
                        shot.id === hoveredShotId
                      }
                      onHoverShot={onHoverShot}
                      onLeaveShot={onLeaveShot}
                    />
                  ),
                )}
              </tbody>

              <TargetTableFooter
                shotCount={
                  group.shots.length
                }
              />
            </table>
          </section>
        ))}
      </div>
    </Card>
  );
}