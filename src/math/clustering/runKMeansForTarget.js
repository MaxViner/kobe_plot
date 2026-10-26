import { isValidPoint } from './pointUtils.js';

import { runKMeans } from './runKMeans.js';

import { runCapacityConstrainedKMeans } from './runCapacityConstrainedKMeans.js';

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

  if (!Number.isFinite(maxClusterSize)) {
    return runKMeans(points, clusterCount);
  }

  return runCapacityConstrainedKMeans(
    points,
    clusterCount,
    maxClusterSize,
  );
};