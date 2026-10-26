import { calculateDistanceSquared } from '../pointUtils.js';
import {
  calculateCentroids,
} from '../kmeansUtils.js';
import {
  createClusterStatistics,
} from '../statistics.js';

const calculateClusterDistance = (
  firstIndexes,
  secondIndexes,
  points,
) => {
  let sum = 0;
  let count = 0;

  firstIndexes.forEach((firstIndex) => {
    secondIndexes.forEach((secondIndex) => {
      sum += Math.sqrt(
        calculateDistanceSquared(
          points[firstIndex],
          points[secondIndex],
        ),
      );

      count += 1;
    });
  });

  return count === 0 ? Infinity : sum / count;
};

const buildHierarchicalClusters = (points, clusterCount) => {
  let clusters = points.map((_, pointIndex) => [pointIndex]);

  while (clusters.length > clusterCount) {
    let bestFirstIndex = 0;
    let bestSecondIndex = 1;
    let bestDistance = Infinity;

    for (let firstIndex = 0; firstIndex < clusters.length; firstIndex += 1) {
      for (
        let secondIndex = firstIndex + 1;
        secondIndex < clusters.length;
        secondIndex += 1
      ) {
        const distance = calculateClusterDistance(
          clusters[firstIndex],
          clusters[secondIndex],
          points,
        );

        if (distance < bestDistance) {
          bestDistance = distance;
          bestFirstIndex = firstIndex;
          bestSecondIndex = secondIndex;
        }
      }
    }

    clusters = clusters.filter(
      (_, index) =>
        index !== bestFirstIndex &&
        index !== bestSecondIndex,
    );

    clusters.push([
      ...clusters.at(-1),
    ]);

    clusters[clusters.length - 1] = [
      ...clusters[bestFirstIndex] ?? [],
      ...clusters[bestSecondIndex] ?? [],
    ];
  }

  return clusters;
};

const splitOversizedCluster = (
  memberIndexes,
  points,
  maxClusterSize,
) => {
  if (memberIndexes.length <= maxClusterSize) {
    return [memberIndexes];
  }

  const subClusterCount = Math.ceil(
    memberIndexes.length / maxClusterSize,
  );

  const subClusters = buildHierarchicalClusters(
    memberIndexes.map((pointIndex) => points[pointIndex]),
    subClusterCount,
  );

  return subClusters.map((subCluster) =>
    subCluster.map(
      (localIndex) => memberIndexes[localIndex],
    ),
  );
};

export const hierarchicalAlgorithm = {
  id: 'hierarchical',
  label: 'Иерархическая',
  supportsMaxClusterSize: true,

  run({ points, clusterCount, maxClusterSize }) {
    const safeClusterCount = Math.max(
      1,
      Math.min(
        Math.floor(Number(clusterCount) || 2),
        points.length,
      ),
    );

    const safeMaxClusterSize = Number.isFinite(maxClusterSize)
      ? Math.max(1, Math.floor(maxClusterSize))
      : points.length;

    let clusters = buildHierarchicalClusters(
      points,
      safeClusterCount,
    );

    if (Number.isFinite(maxClusterSize)) {
      clusters = clusters.flatMap((cluster) =>
        splitOversizedCluster(
          cluster,
          points,
          safeMaxClusterSize,
        ),
      );
    }

    const labels = new Array(points.length).fill(-1);

    clusters.forEach((cluster, clusterIndex) => {
      cluster.forEach((pointIndex) => {
        labels[pointIndex] = clusterIndex;
      });
    });

    const centroids = clusters.map((cluster) => {
      const members = cluster.map(
        (pointIndex) => points[pointIndex],
      );

      return {
        x:
          members.reduce(
            (sum, point) => sum + point.x,
            0,
          ) / members.length,
        y:
          members.reduce(
            (sum, point) => sum + point.y,
            0,
          ) / members.length,
      };
    });

    return {
      algorithmId: 'hierarchical',
      k: clusters.length,
      labels,
      centroids,
      clusters: createClusterStatistics(
        points,
        labels,
        centroids,
      ),
      iterations: 0,
      inertia: 0,
    };
  },
};