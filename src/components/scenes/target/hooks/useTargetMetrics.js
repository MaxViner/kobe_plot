import { useMemo } from 'react';

const calculateMean = (values) => {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

const calculateStdDev = (values, meanValue) => {
  if (values.length < 2) {
    return 0;
  }

  const variance =
    values.reduce(
      (sum, value) => sum + (value - meanValue) ** 2,
      0,
    ) / (values.length - 1);

  return Math.sqrt(variance);
};

export function useTargetMetrics(shots, clusterResult) {
  return useMemo(() => {
    const safeShots = shots ?? [];

    const xValues = safeShots
      .map((shot) => shot?.xLocal)
      .filter((value) => typeof value === 'number');

    const zValues = safeShots
      .map((shot) => shot?.zLocal)
      .filter((value) => typeof value === 'number');

    const meanX = calculateMean(xValues);
    const meanZ = calculateMean(zValues);

    return {
      shotCount: safeShots.length,
      clusterCount: clusterResult?.k ?? 0,

      meanX,
      meanZ,

      stdDevX: calculateStdDev(xValues, meanX),
      stdDevZ: calculateStdDev(zValues, meanZ),
    };
  }, [shots, clusterResult]);
}