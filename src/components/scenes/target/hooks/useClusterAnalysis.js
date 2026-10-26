import { useMemo } from 'react';
import { runKMeansForTarget } from '../../../../math/clustering/index.js';

export function useClusterAnalysis(
  shots,
  clusterCount = 2,
  maxClusterSize = Infinity,
  clusteringAlgorithm = 'capacity-kmeans',
  clusteringOptions = {},
) {
  const epsilon = clusteringOptions.epsilon;
  const minSamples = clusteringOptions.minSamples;

  return useMemo(() => {
    const safeShots = shots ?? [];

    const result = runKMeansForTarget(
      safeShots,
      clusterCount,
      maxClusterSize,
      clusteringAlgorithm,
      {
        epsilon,
        minSamples,
      },
    );

    const clusterByShotId = new Map();

    safeShots.forEach((shot, shotIndex) => {
      const clusterIndex = result.labels[shotIndex];

      if (clusterIndex === undefined) {
        return;
      }

      clusterByShotId.set(shot.id, clusterIndex);
    });

    return {
      result,
      clusterByShotId,
    };
  }, [
    shots,
    clusterCount,
    maxClusterSize,
    clusteringAlgorithm,
    epsilon,
    minSamples,
  ]);
}