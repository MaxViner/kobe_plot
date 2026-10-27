import { create } from 'zustand';
import {
  runKMeansForTarget,
} from '../math/clustering/index.js';

export const useClusterResultsStore = create(
  (set, get) => ({
    resultsByTargetId: new Map(),
    clusterByShotIdByTargetId: new Map(),

    recomputeClusterResults: ({
      dataset,
      clusteringSettings,
      clusterCountsByTargetId = {},
    }) => {
      if (!dataset) {
        set({
          resultsByTargetId: new Map(),
          clusterByShotIdByTargetId: new Map(),
        });

        return;
      }

      const resultsByTargetId = new Map();
      const clusterByShotIdByTargetId =
        new Map();

      const targetIds =
        dataset.targetIds ?? [];

      const maxClusterSize = Math.max(
        1,
        Math.floor(
          Number(
            clusteringSettings.maxClusterSize,
          ) || 1,
        ),
      );

      targetIds.forEach((targetId) => {
        const shots =
          dataset.targetsById.get(
            targetId,
          ) ?? [];

        const minimumClusterCount =
          Math.max(
            1,
            Math.ceil(
              shots.length / maxClusterSize,
            ),
          );

        const userClusterCount =
          clusterCountsByTargetId[
            targetId
          ];

        const requestedClusterCount =
          Number.isFinite(
            Number(userClusterCount),
          )
            ? Math.max(
                1,
                Math.floor(
                  Number(userClusterCount),
                ),
              )
            : minimumClusterCount;

        const effectiveClusterCount =
          Math.max(
            requestedClusterCount,
            minimumClusterCount,
          );

        const result = runKMeansForTarget(
          shots,
          effectiveClusterCount,
          maxClusterSize,
          clusteringSettings
            .clusteringAlgorithm,
          {
            epsilon:
              clusteringSettings.dbscanEpsilon,
            minSamples:
              clusteringSettings.dbscanMinSamples,
          },
        );

        const clusterByShotId = new Map();

        shots.forEach(
          (shot, shotIndex) => {
            const clusterIndex =
              result.labels[shotIndex];

            if (
              clusterIndex === undefined
            ) {
              return;
            }

            clusterByShotId.set(
              shot.id,
              clusterIndex,
            );
          },
        );

        resultsByTargetId.set(
          targetId,
          result,
        );

        clusterByShotIdByTargetId.set(
          targetId,
          clusterByShotId,
        );
      });

      set({
        resultsByTargetId,
        clusterByShotIdByTargetId,
      });
    },

    getClusterResult: (targetId) =>
      get().resultsByTargetId.get(targetId),

    getClusterByShotId: (targetId) =>
      get().clusterByShotIdByTargetId.get(
        targetId,
      ) ?? new Map(),
  }),
);