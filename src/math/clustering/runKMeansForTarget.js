import { isValidPoint } from './pointUtils.js';
import { getClusteringAlgorithm } from './registry.js';

export const runKMeansForTarget = (
  shots,
  clusterCount = 2,
  maxClusterSize = Infinity,
  algorithmId = 'capacity-kmeans',
  algorithmOptions = {},
) => {
  const points = (shots ?? [])
    .map((shot) => ({
      x: shot?.xLocal,
      y: shot?.zLocal,
    }))
    .filter(isValidPoint);

  const algorithm = getClusteringAlgorithm(algorithmId);

  return algorithm.run({
    points,
    clusterCount,
    maxClusterSize,
    ...algorithmOptions,
  });
};