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

const calculateVariance = (values, meanValue) => {
  if (values.length < 2) {
    return 0;
  }

  return (
    values.reduce(
      (sum, value) => sum + (value - meanValue) ** 2,
      0,
    ) / (values.length - 1)
  );
};

const createRadialStatistics = (points, centroid) => {
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

const createCovarianceMatrix = (points, centroid) => {
  if (points.length < 2) {
    return [
      [0, 0],
      [0, 0],
    ];
  }

  let sumXX = 0;
  let sumYY = 0;
  let sumXY = 0;

  points.forEach((point) => {
    const deltaX = point.x - centroid.x;
    const deltaY = point.y - centroid.y;

    sumXX += deltaX * deltaX;
    sumYY += deltaY * deltaY;
    sumXY += deltaX * deltaY;
  });

  const denominator = points.length - 1;

  return [
    [sumXX / denominator, sumXY / denominator],
    [sumXY / denominator, sumYY / denominator],
  ];
};

const createCoverageEllipse = (points, centroid, covariance) => {
  const varianceX = covariance[0][0];
  const varianceY = covariance[1][1];
  const covarianceXY = covariance[0][1];

  const trace = varianceX + varianceY;
  const determinant = varianceX * varianceY - covarianceXY ** 2;

  const discriminant = Math.max(
    (trace * trace) / 4 - determinant,
    0,
  );

  const root = Math.sqrt(discriminant);

  const eigenvalue1 = Math.max(trace / 2 + root, 0);
  const eigenvalue2 = Math.max(trace / 2 - root, 0);

  const isCircular =
    Math.abs(covarianceXY) < 1e-12 &&
    Math.abs(varianceX - varianceY) < 1e-12;

  const rotationRadians = isCircular
    ? 0
    : 0.5 * Math.atan2(2 * covarianceXY, varianceX - varianceY);

  let coverageFactor = 2;

  if (points.length > 0 && determinant > 1e-12) {
    const inverseDeterminant = 1 / determinant;

    coverageFactor = points.reduce((maxFactor, point) => {
      const deltaX = point.x - centroid.x;
      const deltaY = point.y - centroid.y;

      const mahalanobisSquared =
        deltaX * deltaX * varianceY -
        2 * deltaX * deltaY * covarianceXY +
        deltaY * deltaY * varianceX;

      const factor = Math.sqrt(
        Math.max(mahalanobisSquared * inverseDeterminant, 0),
      );

      return Math.max(maxFactor, factor);
    }, coverageFactor);
  }

  return {
    cx: centroid.x,
    cy: centroid.y,
    radiusX: coverageFactor * Math.sqrt(eigenvalue1),
    radiusY: coverageFactor * Math.sqrt(eigenvalue2),
    rotationDeg: rotationRadians * (180 / Math.PI),
    coverageFactor,
  };
};

const createClusterStatistics = (points, labels, centroids) =>
  centroids.map((centroid, clusterIndex) => {
    const members = points.filter(
      (_, pointIndex) => labels[pointIndex] === clusterIndex,
    );

    const covariance = createCovarianceMatrix(members, centroid);
    const radialStatistics = createRadialStatistics(
      members,
      centroid,
    );

    return {
      centroid,
      covariance,
      sigmaX: Math.sqrt(Math.max(covariance[0][0], 0)),
      sigmaY: Math.sqrt(Math.max(covariance[1][1], 0)),
      rMean: radialStatistics.rMean,
      rMax: radialStatistics.rMax,
      cep50: radialStatistics.cep50,
      ellipse: createCoverageEllipse(
        members,
        centroid,
        covariance,
      ),
      memberCount: members.length,
    };
  });

export const runKMeansForTarget = (shots, clusterCount = 2) => {
  const points = (shots ?? [])
    .map((shot) => ({
      x: shot?.xLocal,
      y: shot?.yLocal,
    }))
    .filter(isValidPoint);

  const result = runKMeans(points, clusterCount);

  return {
    ...result,
    k: Number.isFinite(Number(clusterCount))
      ? Math.max(1, Math.floor(Number(clusterCount)))
      : result.k,
  };
};

// Совместимость со старым кодом:
// import { kMeansCluster } from '.../clustering.js';
export const kMeansCluster = runKMeansForTarget;

// Если useClusterAnalysis передаёт уже готовые точки { x, y },
// используйте этот алиас:
export const kMeansClusterPoints = runKMeans;