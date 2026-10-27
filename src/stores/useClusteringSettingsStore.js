import { create } from 'zustand';

const DEFAULT_CLUSTERING_SETTINGS = {
  clusteringAlgorithm: 'capacity-kmeans',
  maxClusterSize: 24,
  dbscanEpsilon: 20,
  dbscanMinSamples: 3,
};

export const useClusteringSettingsStore = create(
  (set) => ({
    ...DEFAULT_CLUSTERING_SETTINGS,

    updateClusteringSettings: (nextSettings) =>
      set((state) => ({
        ...state,
        ...nextSettings,
      })),

    resetClusteringSettings: () =>
      set({ ...DEFAULT_CLUSTERING_SETTINGS }),
  }),
);