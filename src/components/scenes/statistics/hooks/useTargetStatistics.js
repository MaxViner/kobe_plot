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
  const zValues = target.shots.map((shot) => shot.zLocal);

  const meanX = calculateMean(xValues);
  const meanZ = calculateMean(zValues);

  return {
    targetId: target.targetId,
    shotCount: target.shots.length,

    meanX,
    meanZ,

    stdDevX: calculateStdDev(xValues, meanX),
    stdDevZ: calculateStdDev(zValues, meanZ),

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