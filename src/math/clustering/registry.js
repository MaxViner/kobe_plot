import { kmeansAlgorithm } from './algorithms/kmeans.js';
import { capacityKMeansAlgorithm } from './algorithms/capacityKMeans.js';
import { hierarchicalAlgorithm } from './algorithms/hierarchical.js';
import { dbscanAlgorithm } from './algorithms/dbscan.js';

export const CLUSTERING_ALGORITHMS = [
  kmeansAlgorithm,
  capacityKMeansAlgorithm,
  hierarchicalAlgorithm,
  dbscanAlgorithm,
];

export const DEFAULT_CLUSTERING_ALGORITHM_ID =
  capacityKMeansAlgorithm.id;

export const getClusteringAlgorithm = (algorithmId) =>
  CLUSTERING_ALGORITHMS.find(
    (algorithm) => algorithm.id === algorithmId,
  ) ??
  CLUSTERING_ALGORITHMS.find(
    (algorithm) =>
      algorithm.id === DEFAULT_CLUSTERING_ALGORITHM_ID,
  );