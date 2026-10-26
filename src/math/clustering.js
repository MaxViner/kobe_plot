const CLUSTER_COLORS = [
  '#38bdf8',
  '#f472b6',
  '#a3e635',
  '#fbbf24',
  '#c084fc',
  '#fb7185',
  '#34d399',
  '#60a5fa',
];

const MAX_ITERATIONS = 100;
const CONVERGENCE_TOLERANCE = 1e-6;

export const clusterColor = (clusterIndex) =>
  CLUSTER_COLORS[clusterIndex % CLUSTER_COLORS.length];

const isValidPoint = (point) =>
  Boolean(point) &&
  typeof point.x === 'number' &&
  typeof point.y === 'number' &&
  Number.isFinite(point.x) &&
  Number.isFinite(point.y);

const calculateDistanceSquared = (point, centroid) => {
  const deltaX = point.x - centroid.x;
  const deltaY = point.y - centroid.y;

  return deltaX * deltaX + deltaY * deltaY;
};

const normalizeClusterCount = (clusterCount, pointsLength) => {
  const parsedCount = Number(clusterCount);

  const safeCount =
    Number.isFinite(parsedCount) && parsedCount >= 1
      ? Math.floor(parsedCount)
      : 2;

  return Math.max(1, Math.min(safeCount, pointsLength || 1));
};

const createEmptyClusterAccumulator = () => ({
  sumX: 0,
  sumY: 0,
  count: 0,
});

const assignPointsToClusters = (points, centroids) => {
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

const calculateCentroids = (points, labels, previousCentroids) => {
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

const calculateCentroidShift = (previousCentroids, nextCentroids) =>
  previousCentroids.reduce((maxShift, previousCentroid, index) => {
    const nextCentroid = nextCentroids[index];

    if (!nextCentroid) {
      return maxShift;
    }

    const shift = Math.hypot(
      nextCentroid.x - previousCentroid.x,
      nextCentroid.y - previousCentroid.y,
    );

    return Math.max(maxShift, shift);
  }, 0);

const initializeCentroids = (points, clusterCount) => {
  if (points.length === 0 || clusterCount <= 0) {
    return [];
  }

  const uniqueCentroids = [];
  const usedIndexes = new Set();

  while (
    uniqueCentroids.length < clusterCount &&
    usedIndexes.size < points.length
  ) {
    const pointIndex = Math.floor(Math.random() * points.length);

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

const calculateInertia = (points, labels, centroids) =>
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

  let labels = assignPointsToClusters(safePoints, centroids);

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

    if (!hasChanged || centroidShift < CONVERGENCE_TOLERANCE) {
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

const calculateMean = (values) => {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

const calculateRadialStatistics = (points, centroid) => {
  const distances = points.map((point) =>
    Math.hypot(point.x - centroid.x, point.y - centroid.y),
  );

  const sortedDistances = [...distances].sort(
    (first, second) => first - second,
  );

  const medianIndex = Math.floor(sortedDistances.length / 2);

  const cep50 =
    sortedDistances.length === 0
      ? 0
      : sortedDistances.length % 2 === 0
        ? (sortedDistances[medianIndex - 1] +
          sortedDistances[medianIndex]) /
          2
        : sortedDistances[medianIndex];

  return {
    rMean: calculateMean(distances),
    rMax: distances.length > 0 ? Math.max(...distances) : 0,
    cep50,
  };
};

const createClusterStatistics = (points, labels, centroids) =>
  centroids.map((centroid, clusterIndex) => {
    const members = points.filter(
      (_, pointIndex) => labels[pointIndex] === clusterIndex,
    );

    const radialStatistics = calculateRadialStatistics(
      members,
      centroid,
    );

    return {
      centroid,
      memberCount: members.length,
      rMean: radialStatistics.rMean,
      rMax: radialStatistics.rMax,
      cep50: radialStatistics.cep50,
    };
  });

// Разбивает кластеры, в которых больше maxClusterSize точек.
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
  const remainingCapacity = centroids.map(() => maxClusterSize);

  const distancePairs = createDistancePairs(
    points,
    centroids,
  );

  distancePairs.forEach(({ pointIndex, clusterIndex }) => {
    if (labels[pointIndex] !== -1) {
      return;
    }

    if (remainingCapacity[clusterIndex] <= 0) {
      return;
    }

    labels[pointIndex] = clusterIndex;
    remainingCapacity[clusterIndex] -= 1;
  });

  return labels;
};

const hasEmptyCluster = (labels, clusterCount) => {
  const usedClusters = new Set(labels);

  for (let clusterIndex = 0; clusterIndex < clusterCount; clusterIndex += 1) {
    if (!usedClusters.has(clusterIndex)) {
      return true;
    }
  }

  return false;
};

const runCapacityConstrainedKMeans = (
  points,
  clusterCount,
  maxClusterSize,
) => {
  let centroids = initializeCentroids(points, clusterCount);

  let labels = createCapacityAssignment(
    points,
    centroids,
    maxClusterSize,
  );

  let iterations = 0;

  for (
    let iteration = 0;
    iteration < MAX_ITERATIONS;
    iteration += 1
  ) {
    iterations = iteration + 1;

    const nextCentroids = calculateCentroids(
      points,
      labels,
      centroids,
    );

    centroids = nextCentroids;

    const nextLabels = createCapacityAssignment(
      points,
      centroids,
      maxClusterSize,
    );

    const hasChanged = nextLabels.some(
      (label, pointIndex) => label !== labels[pointIndex],
    );

    labels = nextLabels;

    if (!hasChanged) {
      break;
    }
  }

  return {
    labels,
    centroids,
    iterations,
  };
};
export const runKMeansForTarget = (
  shots,
  clusterCount = 2,
  maxClusterSize = Infinity,
) => {
  const points = (shots ?? [])
    .map((shot) => ({
      x: shot?.xLocal,
      y: shot?.zLocal,
    }))
    .filter(isValidPoint);

  const safeClusterCount = normalizeClusterCount(
    clusterCount,
    points.length,
  );

  if (!Number.isFinite(maxClusterSize)) {
    return runKMeans(points, safeClusterCount);
  }

  const safeMaxClusterSize = Math.max(
    1,
    Math.floor(maxClusterSize),
  );

  const minimumClusterCount = Math.ceil(
    points.length / safeMaxClusterSize,
  );

  const effectiveClusterCount = Math.max(
    safeClusterCount,
    minimumClusterCount,
  );

  const {
    labels,
    centroids,
    iterations,
  } = runCapacityConstrainedKMeans(
    points,
    effectiveClusterCount,
    safeMaxClusterSize,
  );

  const clusters = createClusterStatistics(
    points,
    labels,
    centroids,
  );

  const inertia = calculateInertia(points, labels, centroids);

  return {
    k: effectiveClusterCount,
    labels,
    centroids,
    clusters,
    iterations,
    inertia,
  };
};


export const kMeansCluster = runKMeansForTarget;
export const kMeansClusterPoints = runKMeans;