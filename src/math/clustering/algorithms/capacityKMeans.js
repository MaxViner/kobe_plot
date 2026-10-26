import { runCapacityConstrainedKMeans } from '../runCapacityConstrainedKMeans.js';

export const capacityKMeansAlgorithm = {
  id: 'capacity-kmeans',
  label: 'K-means с лимитом',
  supportsMaxClusterSize: true,

  run({ points, clusterCount, maxClusterSize }) {
    return runCapacityConstrainedKMeans(
      points,
      clusterCount,
      maxClusterSize,
    );
  },
};