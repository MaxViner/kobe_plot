import { create } from 'zustand';

export const useUiStore = create((set) => ({
  viewMode: 'overview',
  selectedTargetId: null,
  hoveredShotId: null,
  hoveredTargetId: null,
  clusterCountsByTargetId: {},

  setViewMode: (viewMode) =>
    set({ viewMode }),

  selectTarget: (targetId) =>
    set({
      selectedTargetId: targetId,
      viewMode: 'target',
    }),

  selectStatisticsTarget: (targetId) =>
    set({ selectedTargetId: targetId }),

  backToTargetList: () =>
    set({
      viewMode: 'overview',
      selectedTargetId: null,
    }),

  setHoveredShotId: (hoveredShotId) =>
    set({ hoveredShotId }),

  setHoveredTargetId: (hoveredTargetId) =>
    set({ hoveredTargetId }),

  setClusterCount: (targetId, clusterCount) =>
    set((state) => ({
      clusterCountsByTargetId: {
        ...state.clusterCountsByTargetId,
        [targetId]: clusterCount,
      },
    })),

  resetDatasetSelection: () =>
    set({
      selectedTargetId: null,
      viewMode: 'overview',
      clusterCountsByTargetId: {},
    }),
}));