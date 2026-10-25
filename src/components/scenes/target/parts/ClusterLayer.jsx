import { clusterColor } from '../../../../math/clustering.js';
import styles from '../TargetDetailView.module.scss';

export function ClusterLayer({
  clusters,
  toScreen,
  rangeToScreenScale,
}) {
  if (!Array.isArray(clusters) || clusters.length === 0) {
    return null;
  }

  return (
    <>
      {clusters.map((cluster, clusterIndex) => {
        const centroid = toScreen(cluster.centroid.x, cluster.centroid.y);

        return (
          <g key={clusterIndex}>
            <ellipse
              cx={centroid.x}
              cy={centroid.y}
              rx={cluster.ellipse.radiusX * rangeToScreenScale}
              ry={cluster.ellipse.radiusY * rangeToScreenScale}
              transform={`rotate(${-cluster.ellipse.rotationDeg} ${
                centroid.x
              } ${centroid.y})`}
              className={styles.clusterEllipse}
              style={{
                fill: clusterColor(clusterIndex),
                stroke: clusterColor(clusterIndex),
              }}
            />

            <circle
              cx={centroid.x}
              cy={centroid.y}
              r={5}
              className={styles.centroidRing}
              style={{ stroke: clusterColor(clusterIndex) }}
            />

            <circle
              cx={centroid.x}
              cy={centroid.y}
              r={1.8}
              fill={clusterColor(clusterIndex)}
            />
          </g>
        );
      })}
    </>
  );
}