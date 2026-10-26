import { calculateDistanceSquared } from '../pointUtils.js';
import {
  createClusterStatistics,
} from '../statistics.js';

const getNeighborIndexes = (
  points,
  pointIndex,
  epsilon,
) => {
  const neighbors = [];

  points.forEach((candidate, candidateIndex) => {
    const distance = Math.sqrt(
      calculateDistanceSquared(
        points[pointIndex],
        candidate,
      ),
    );

    if (distance <= epsilon) {
      neighbors.push(candidateIndex);
    }
  });

  return neighbors;
};

export const dbscanAlgorithm = {
  id: 'dbscan',
  label: 'DBSCAN',
  supportsMaxClusterSize: false,
  requiresClusterCount: false,

  run({
    points,
    epsilon = 20,
    minSamples = 3,
  }) {
    const safeEpsilon = Math.max(
      0.001,
      Number(epsilon) || 20,
    );

    const safeMinSamples = Math.max(
      1,
      Math.floor(Number(minSamples) || 3),
    );

    const labels = new Array(points.length).fill(-2);
    let currentClusterIndex = 0;

    points.forEach((_, pointIndex) => {
      if (labels[pointIndex] !== -2) {
        return;
      }

      const neighbors = getNeighborIndexes(
        points,
        pointIndex,
        safeEpsilon,
      );

      if (neighbors.length < safeMinSamples) {
        labels[pointIndex] = -1;
        return;
      }

      labels[pointIndex] = currentClusterIndex;

      const queue = [...neighbors];

      while (queue.length > 0) {
        const neighborIndex = queue.shift();

        if (labels[neighborIndex] === -1) {
          labels[neighborIndex] = currentClusterIndex;
        }

        if (labels[neighborIndex] !== -2) {
          continue;
        }

        labels[neighborIndex] = currentClusterIndex;

        const nextNeighbors = getNeighborIndexes(
          points,
          neighborIndex,
          safeEpsilon,
        );

        if (nextNeighbors.length >= safeMinSamples) {
          queue.push(...nextNeighbors);
        }
      }

      currentClusterIndex += 1;
    });

    const clusterIndexes = [
      ...new Set(
        labels.filter((label) => label >= 0),
      ),
    ].sort((first, second) => first - second);

    const remappedLabels = labels.map((label) => {
      if (label < 0) {
        return -1;
      }

      return clusterIndexes.indexOf(label);
    });

    const centroids = clusterIndexes.map((_, clusterIndex) => {
      const members = points.filter(
        (_, pointIndex) =>
          remappedLabels[pointIndex] === clusterIndex,
      );

      if (members.length === 0) {
        return { x: 0, y: 0 };
      }

      return {
        x:
          members.reduce(
            (sum, point) => sum + point.x,
            0,
          ) / members.length,
        y:
          members.reduce(
            (sum, point) => sum + point.y,
            0,
          ) / members.length,
      };
    });

    return {
      algorithmId: 'dbscan',
      k: clusterIndexes.length,
      labels: remappedLabels,
      centroids,
      clusters: createClusterStatistics(
        points,
        remappedLabels,
        centroids,
      ),
      iterations: 0,
      inertia: 0,
      noiseCount: remappedLabels.filter(
        (label) => label === -1,
      ).length,
    };
  },
};