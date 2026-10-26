import { runKMeans } from '../runKMeans.js';

export const kmeansAlgorithm = {
  id: 'kmeans',
  label: 'K-means',
  supportsMaxClusterSize: false,

  run({ points, clusterCount }) {
    return runKMeans(points, clusterCount);
  },
};