import { MAX_ITERATIONS } from './constants.js';

import {
  calculateDistanceSquared,
  normalizeClusterCount,
} from './pointUtils.js';

import {
  calculateCentroids,
  initializeCentroids,
} from './kmeansUtils.js';

import { createClusterStatistics } from './statistics.js';

const createDistancePairs = (points, centroids) => {
  const pairs = [];

  points.forEach((point, pointIndex) => {
    centroids.forEach((centroid, clusterIndex) => {
      pairs.push({
        pointIndex,
        clusterIndex,
        distanceSquared: calculateDistanceSquared(
          point,
          centroid,
        ),
      });
    });
  });

  return pairs.sort(
    (first, second) =>
      first.distanceSquared - second.distanceSquared,
  );
};

const createCapacityAssignment = (
  points,
  centroids,
  maxClusterSize,
) => {
  const labels = new Array(points.length).fill(-1);

  const remainingCapacity = centroids.map(
    () => maxClusterSize,
  );

  const distancePairs = createDistancePairs(
    points,
    centroids,
  );

  distancePairs.forEach(
    ({ pointIndex, clusterIndex }) => {
      if (labels[pointIndex] !== -1) {
        return;
      }

      if (remainingCapacity[clusterIndex] <= 0) {
        return;
      }

      labels[pointIndex] = clusterIndex;
      remainingCapacity[clusterIndex] -= 1;
    },
  );

  return labels;
};

export const runCapacityConstrainedKMeans = (
  points,
  clusterCount = 2,
  maxClusterSize = Infinity,
) => {
  const safePoints = (points ?? []).filter(
    (point) =>
      Boolean(point) &&
      Number.isFinite(point.x) &&
      Number.isFinite(point.y),
  );

  const safeClusterCount = normalizeClusterCount(
    clusterCount,
    safePoints.length,
  );

  const safeMaxClusterSize = Number.isFinite(maxClusterSize)
    ? Math.max(1, Math.floor(maxClusterSize))
    : safePoints.length;

  let centroids = initializeCentroids(
    safePoints,
    safeClusterCount,
  );

  let labels = createCapacityAssignment(
    safePoints,
    centroids,
    safeMaxClusterSize,
  );

  let iterations = 0;

  for (
    let iteration = 0;
    iteration < MAX_ITERATIONS;
    iteration += 1
  ) {
    iterations = iteration + 1;

    const nextCentroids = calculateCentroids(
      safePoints,
      labels,
      centroids,
    );

    centroids = nextCentroids;

    const nextLabels = createCapacityAssignment(
      safePoints,
      centroids,
      safeMaxClusterSize,
    );

    const hasChanged = nextLabels.some(
      (label, pointIndex) => label !== labels[pointIndex],
    );

    labels = nextLabels;

    if (!hasChanged) {
      break;
    }
  }

  const inertia = safePoints.reduce(
    (inertia, point, pointIndex) => {
      const clusterIndex = labels[pointIndex];
      const centroid = centroids[clusterIndex];

      if (!centroid) {
        return inertia;
      }

      return (
        inertia +
        calculateDistanceSquared(point, centroid)
      );
    },
    0,
  );

  return {
    k: safeClusterCount,
    labels,
    centroids,
    clusters: createClusterStatistics(
      safePoints,
      labels,
      centroids,
    ),
    iterations,
    inertia,
  };
};