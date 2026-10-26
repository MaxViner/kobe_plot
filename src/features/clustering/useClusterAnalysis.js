import { useMemo } from 'react';
import { runKMeansForTarget } from '../../math/clustering/index';

export function useClusterAnalysis(
  shots,
  clusterCount = 2,
  maxClusterSize = Infinity,
) {
  return useMemo(() => {
    const safeShots = shots ?? [];

    const result = runKMeansForTarget(
      safeShots,
      clusterCount,
      maxClusterSize
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
  }, [shots, clusterCount, maxClusterSize]);
}