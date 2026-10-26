import {
  MAX_ITERATIONS,
  CONVERGENCE_TOLERANCE,
} from './constants.js';

import {
  isValidPoint,
  normalizeClusterCount,
} from './pointUtils.js';

import {
  assignPointsToClusters,
  calculateCentroids,
  calculateCentroidShift,
  calculateInertia,
  initializeCentroids,
} from './kmeansUtils.js';

import { createClusterStatistics } from './statistics.js';

export const runKMeans = (points, clusterCount = 2) => {
  const safePoints = (points ?? []).filter(isValidPoint);

  const safeClusterCount = normalizeClusterCount(
    clusterCount,
    safePoints.length,
  );

  if (safePoints.length === 0) {
    return {
      k: safeClusterCount,
      labels: [],
      centroids: [],
      clusters: [],
      iterations: 0,
      inertia: 0,
    };
  }

  let centroids = initializeCentroids(
    safePoints,
    safeClusterCount,
  );

  let labels = assignPointsToClusters(
    safePoints,
    centroids,
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

    const centroidShift = calculateCentroidShift(
      centroids,
      nextCentroids,
    );

    centroids = nextCentroids;

    const nextLabels = assignPointsToClusters(
      safePoints,
      centroids,
    );

    const hasChanged = nextLabels.some(
      (label, pointIndex) => label !== labels[pointIndex],
    );

    labels = nextLabels;

    if (
      !hasChanged ||
      centroidShift < CONVERGENCE_TOLERANCE
    ) {
      break;
    }
  }

  const inertia = calculateInertia(
    safePoints,
    labels,
    centroids,
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