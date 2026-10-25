import { Gauge, Layers } from 'lucide-react';
import { MetricRow } from '../../../ui/metricrow/MetricRow.jsx';
import { clusterColor } from '../../../../math/clustering.js';
import styles from '../TargetDetailView.module.scss';

const formatMeters = (value) => `${value.toFixed(3)} м`;

export function TargetMetricsPanel({
  metrics,
  clusters,
  clusterResult,
}) {
  return (
    <aside className={styles.metricsPanel}>
      <div className={styles.metricsCard}>
        <h3 className={styles.metricsTitle}>
          <Gauge size={14} />
          Общая статистика
        </h3>

        {metrics && (
          <dl>
            <MetricRow
              label="Всего точек"
              value={metrics.shotCount}
            />

            <MetricRow
              label="Количество кластеров"
              value={metrics.clusterCount}
            />

            <MetricRow
              label="Среднее X"
              value={formatMeters(metrics.meanX)}
            />

            <MetricRow
              label="Среднее Y"
              value={formatMeters(metrics.meanY)}
            />

            <MetricRow
              label="СКО X"
              value={formatMeters(metrics.stdDevX)}
            />

            <MetricRow
              label="СКО Y"
              value={formatMeters(metrics.stdDevY)}
            />
          </dl>
        )}
      </div>

      <div className={styles.metricsCard}>
        <h3 className={styles.metricsTitle}>
          <Layers size={14} />
          Кластеры
        </h3>

        <div className={styles.clusterList}>
          {clusters.map((cluster, clusterIndex) => (
            <article
              key={clusterIndex}
              className={styles.clusterCard}
            >
              <header className={styles.clusterHeader}>
                <span className={styles.clusterName}>
                  <span
                    className={styles.clusterDot}
                    style={{
                      background: clusterColor(clusterIndex),
                    }}
                  />
                  Кластер {clusterIndex + 1}
                </span>

                <span className={styles.clusterCep}>
                  {cluster.memberCount} точек
                </span>
              </header>

              <dl className={styles.clusterMetrics}>
                <MetricRow
                  label="Среднее X"
                  value={formatMeters(cluster.centroid.x)}
                />

                <MetricRow
                  label="Среднее Y"
                  value={formatMeters(cluster.centroid.y)}
                />

                <MetricRow
                  label="СКО X"
                  value={formatMeters(cluster.sigmaX)}
                />

                <MetricRow
                  label="СКО Y"
                  value={formatMeters(cluster.sigmaY)}
                />
              </dl>
            </article>
          ))}
        </div>

        <p className={styles.clusterMeta}>
          Итераций K-Means: {clusterResult.iterations} · инерция:{' '}
          {clusterResult.inertia.toFixed(5)}
        </p>
      </div>
    </aside>
  );
}