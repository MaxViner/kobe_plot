import { calculateMean } from './pointUtils.js';

const calculateStdDeviation = (values, mean) => {
  if (values.length === 0) {
    return 0;
  }

  const squaredDiffSum = values.reduce(
    (sum, value) => {
      const diff = value - mean;

      return sum + diff * diff;
    },
    0,
  );

  return Math.sqrt(
    squaredDiffSum / values.length,
  );
};

const calculateRadialStatistics = (
  points,
  centroid,
) => {
  const distances = points.map((point) =>
    Math.hypot(
      point.x - centroid.x,
      point.y - centroid.y,
    ),
  );

  const sortedDistances = [...distances].sort(
    (first, second) => first - second,
  );

  const medianIndex = Math.floor(
    sortedDistances.length / 2,
  );

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
    rMax:
      distances.length > 0
        ? Math.max(...distances)
        : 0,
    cep50,
  };
};

export const createClusterStatistics = (
  points,
  labels,
  centroids,
) =>
  centroids.map((centroid, clusterIndex) => {
    const members = points.filter(
      (_, pointIndex) =>
        labels[pointIndex] === clusterIndex,
    );

    const radialStatistics =
      calculateRadialStatistics(
        members,
        centroid,
      );

    const xValues = members.map(
      (point) => point.x,
    );

    const zValues = members.map(
      (point) => point.y,
    );

    const meanX = calculateMean(xValues);
    const meanZ = calculateMean(zValues);

    return {
      centroid,
      memberCount: members.length,

      meanX,
      meanZ,

      stdX: calculateStdDeviation(
        xValues,
        meanX,
      ),
      stdZ: calculateStdDeviation(
        zValues,
        meanZ,
      ),

      rMean: radialStatistics.rMean,
      rMax: radialStatistics.rMax,
      cep50: radialStatistics.cep50,
    };
  });