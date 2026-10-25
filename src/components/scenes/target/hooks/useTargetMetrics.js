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

    const yValues = safeShots
      .map((shot) => shot?.yLocal)
      .filter((value) => typeof value === 'number');

    const meanX = calculateMean(xValues);
    const meanY = calculateMean(yValues);

    return {
      shotCount: safeShots.length,
      clusterCount: clusterResult?.k ?? 0,
      meanX,
      meanY,
      stdDevX: calculateStdDev(xValues, meanX),
      stdDevY: calculateStdDev(yValues, meanY),
    };
  }, [shots, clusterResult]);
}