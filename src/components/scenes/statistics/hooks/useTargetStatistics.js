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

const buildTargetStatistics = (target, clusterResult) => {
  const xValues = target.shots.map((shot) => shot.xLocal);
  const yValues = target.shots.map((shot) => shot.yLocal);

  const meanX = calculateMean(xValues);
  const meanY = calculateMean(yValues);

  return {
    targetId: target.targetId,
    shotCount: target.shots.length,
    clusterCount: clusterResult?.k ?? 0,
    meanX,
    meanY,
    stdDevX: calculateStdDev(xValues, meanX),
    stdDevY: calculateStdDev(yValues, meanY),
    clusters: clusterResult?.clusters ?? [],
  };
};

export function useTargetStatistics(targets, clusterResultsByTargetId) {
  return useMemo(
    () =>
      targets.map((target) =>
        buildTargetStatistics(
          target,
          clusterResultsByTargetId.get(target.targetId),
        ),
      ),
    [targets, clusterResultsByTargetId],
  );
}