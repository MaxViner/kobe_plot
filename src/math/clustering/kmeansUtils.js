import { calculateDistanceSquared } from './pointUtils.js';

export const createEmptyClusterAccumulator = () => ({
  sumX: 0,
  sumY: 0,
  count: 0,
});

export const assignPointsToClusters = (points, centroids) => {
  if (centroids.length === 0) {
    return points.map(() => 0);
  }

  return points.map((point) => {
    let nearestClusterIndex = 0;
    let nearestDistanceSquared = Infinity;

    centroids.forEach((centroid, clusterIndex) => {
      const distanceSquared = calculateDistanceSquared(
        point,
        centroid,
      );

      if (distanceSquared < nearestDistanceSquared) {
        nearestDistanceSquared = distanceSquared;
        nearestClusterIndex = clusterIndex;
      }
    });

    return nearestClusterIndex;
  });
};

export const calculateCentroids = (
  points,
  labels,
  previousCentroids,
) => {
  const accumulators = previousCentroids.map(
    createEmptyClusterAccumulator,
  );

  points.forEach((point, pointIndex) => {
    const clusterIndex = labels[pointIndex];
    const accumulator = accumulators[clusterIndex];

    if (!accumulator) {
      return;
    }

    accumulator.sumX += point.x;
    accumulator.sumY += point.y;
    accumulator.count += 1;
  });

  return accumulators.map((accumulator, clusterIndex) => {
    if (accumulator.count === 0) {
      return previousCentroids[clusterIndex];
    }

    return {
      x: accumulator.sumX / accumulator.count,
      y: accumulator.sumY / accumulator.count,
    };
  });
};

export const calculateCentroidShift = (
  previousCentroids,
  nextCentroids,
) =>
  previousCentroids.reduce(
    (maxShift, previousCentroid, index) => {
      const nextCentroid = nextCentroids[index];

      if (!nextCentroid) {
        return maxShift;
      }

      const shift = Math.hypot(
        nextCentroid.x - previousCentroid.x,
        nextCentroid.y - previousCentroid.y,
      );

      return Math.max(maxShift, shift);
    },
    0,
  );

export const initializeCentroids = (points, clusterCount) => {
  if (points.length === 0 || clusterCount <= 0) {
    return [];
  }

  const uniqueCentroids = [];
  const usedIndexes = new Set();

  while (
    uniqueCentroids.length < clusterCount &&
    usedIndexes.size < points.length
  ) {
    const pointIndex = Math.floor(
      Math.random() * points.length,
    );

    if (usedIndexes.has(pointIndex)) {
      continue;
    }

    usedIndexes.add(pointIndex);
    uniqueCentroids.push({ ...points[pointIndex] });
  }

  while (uniqueCentroids.length < clusterCount) {
    uniqueCentroids.push({
      ...points[uniqueCentroids.length % points.length],
    });
  }

  return uniqueCentroids;
};

export const calculateInertia = (
  points,
  labels,
  centroids,
) =>
  points.reduce((inertia, point, pointIndex) => {
    const clusterIndex = labels[pointIndex];
    const centroid = centroids[clusterIndex];

    if (!centroid) {
      return inertia;
    }

    return (
      inertia +
      calculateDistanceSquared(point, centroid)
    );
  }, 0);