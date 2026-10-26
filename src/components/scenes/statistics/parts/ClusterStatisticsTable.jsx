import { Layers } from 'lucide-react';
import { clusterColor } from '../../../../math/clustering.js';
import styles from '../StatisticsScene.module.scss';

const formatMeters = (value) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return '—';
  }

  return `${value.toFixed(3)} м`;
};

export function ClusterStatisticsTable({
  target = null,
  clusters = [],
}) {
  if (!target) {
    return (
      <section className={styles.tableSection}>
        <h2 className={styles.tableTitle}>
          <Layers size={16} />
          Кластеры
        </h2>

        <p className={styles.emptyState}>
          Выберите мишень в таблице выше, чтобы увидеть её кластеры
        </p>
      </section>
    );
  }

  return (
    <section className={styles.tableSection}>
      <h2 className={styles.tableTitle}>
        <Layers size={16} />
        Кластеры мишени {target.targetId}
      </h2>

      {clusters.length === 0 ? (
        <p className={styles.emptyState}>
          Для этой мишени кластеры не рассчитаны
        </p>
      ) : (
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <caption className={styles.tableCaption}>
              Среднее положение и разброс точек внутри каждого кластера
            </caption>

            <thead>
              <tr>
                <th scope="col">Кластер</th>
                <th scope="col">Точек</th>
                <th scope="col">Средняя высота X</th>
                <th scope="col">Среднее боковое Z</th>
                <th scope="col">СКО высоты X</th>
                <th scope="col">СКО бокового Z</th>
              </tr>
            </thead>

            <tbody>
              {clusters.map((cluster, clusterIndex) => {
                const centroidX = cluster.centroid?.x;
                const centroidZ = cluster.centroid?.y;

                return (
                  <tr key={cluster.clusterId ?? clusterIndex}>
                    <th scope="row" className={styles.clusterCell}>
                      <span
                        className={styles.clusterDot}
                        style={{
                          background: clusterColor(clusterIndex),
                        }}
                      />
                      Кластер {clusterIndex + 1}
                    </th>

                    <td>{cluster.memberCount ?? 0}</td>

                    <td>{formatMeters(centroidX)}</td>
                    <td>{formatMeters(centroidZ)}</td>

                    <td>{formatMeters(cluster.sigmaX)}</td>
                    <td>{formatMeters(cluster.sigmaY)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}