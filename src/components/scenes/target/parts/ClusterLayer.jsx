import { clusterColor } from '../../../../math/clustering.js';
import styles from '../TargetDetailView.module.scss';

const getCentroidHeight = (centroid) => {
  if (Number.isFinite(centroid?.x)) {
    return centroid.x;
  }

  return Number.NaN;
};

const getCentroidLateral = (centroid) => {
  if (Number.isFinite(centroid?.y)) {
    return centroid.y;
  }

  return Number.NaN;
};

export function ClusterLayer({
  clusters,
  toScreen,
  rangeToScreenScale = 1,
}) {
  const safeScale = Number.isFinite(rangeToScreenScale)
    ? rangeToScreenScale
    : 1;

  return (
    <>
      {clusters.map((cluster, index) => {
        const height = getCentroidHeight(cluster.centroid);
        const lateral = getCentroidLateral(cluster.centroid);

        if (!Number.isFinite(height) || !Number.isFinite(lateral)) {
          return null;
        }

        const point = toScreen(lateral, height);

        if (
          !Number.isFinite(point?.x) ||
          !Number.isFinite(point?.y)
        ) {
          return null;
        }

        const clusterRadius = Number.isFinite(cluster.rMax)
          ? cluster.rMax * safeScale
          : 0;

        return (
          <g
            key={cluster.id ?? `cluster-${index}`}
            className={styles.cluster}
          >
            <circle
              cx={point.x}
              cy={point.y}
              r={clusterRadius}
              className={styles.clusterBoundary}
              style={{
                stroke: clusterColor(index),
              }}
            />

            <circle
              cx={point.x}
              cy={point.y}
              r={Math.max(clusterRadius * 0.1, 4)}
              className={styles.clusterCenter}
              style={{
                fill: clusterColor(index+2),
              }}
            />

            <text
              x={point.x}
              y={point.y - clusterRadius - 8}
              textAnchor="middle"
              className={styles.clusterLabel}
              style={{
                fill: clusterColor(index),
              }}
            >
              {index + 1}
            </text>
          </g>
        );
      })}
    </>
  );
}