import { Crosshair } from 'lucide-react';
import { useTargetStatistics } from './hooks/useTargetStatistics.js';
import { TargetSummaryTable } from './parts/TargetSummaryTable.jsx';
import { ClusterStatisticsTable } from './parts/ClusterStatisticsTable.jsx';
import styles from './StatisticsScene.module.scss';

export function StatisticsScene({
  targets,
  clusterResultsByTargetId,
  selectedTargetId,
  onSelectTarget,
}) {
  const statistics = useTargetStatistics(
    targets,
    clusterResultsByTargetId,
  );

  const selectedStatistics = statistics.find(
    (row) => row.targetId === selectedTargetId,
  );

  return (
    <section className={styles.scene}>
      <header className={styles.sceneHeader}>
        <h1 className={styles.sceneTitle}>
          <Crosshair size={18} />
          Сводная статистика
        </h1>

        <p className={styles.sceneMeta}>
          {targets.length} мишеней ·{' '}
          {statistics.reduce(
            (sum, row) => sum + row.shotCount,
            0,
          )}{' '}
          точек
        </p>
      </header>

      <TargetSummaryTable
        statistics={statistics}
        selectedTargetId={selectedTargetId}
        onSelectTarget={onSelectTarget}
      />

      <ClusterStatisticsTable
        target={selectedStatistics}
        clusters={selectedStatistics?.clusters ?? []}
      />
    </section>
  );
}